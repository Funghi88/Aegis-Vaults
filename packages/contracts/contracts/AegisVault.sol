// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IStablecoin {
    function mint(address to, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function burn(address from, uint256 amount) external;
}

/**
 * @title AegisVault
 * @notice Over-collateralized vault: deposit native DOT, mint stablecoin debt, repay, and withdraw.
 *         Guardian can flashRepay to protect positions (e.g. avoid liquidation). Target: Asset Hub (Paseo);
 *         resolc/revive-compatible. No SELFDESTRUCT.
 * @dev Health factor = (collateral / debt) in 18 decimals; minimum 150% (1.5e18) to mint or withdraw.
 *      When stablecoin is set: mint() mints tokens to user, repay() pulls and burns. When unset: debt-only (wei).
 */
contract AegisVault {
    uint256 public constant MIN_COLLATERAL_RATIO = 1.5e18; // 150% (18 decimals)
    uint256 public constant RATIO_PRECISION = 1e18;

    uint256 private _locked;
    address public guardian;
    address public stablecoin; // When set: mint/repay use token; when 0: debt-only (wei)
    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;
    uint256 public totalCollateral;
    uint256 public totalDebt;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Mint(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    event FlashRepay(address indexed user, uint256 amount, address indexed guardian);
    event GuardianUpdated(address indexed previousGuardian, address indexed newGuardian);
    event StablecoinSet(address indexed token);

    error OnlyGuardian();
    error GuardianAlreadySet();
    error StablecoinAlreadySet();
    error DebtMustBeZeroToSetStablecoin();
    error InsufficientCollateral();
    error UnhealthyPosition();
    error InsufficientDebt();
    error ZeroAmount();
    error ZeroAddress();
    error ReentrancyGuard();
    error TransferFailed();

    modifier onlyGuardian() {
        if (msg.sender != guardian) revert OnlyGuardian();
        _;
    }

    modifier nonReentrant() {
        if (_locked != 0) revert ReentrancyGuard();
        _locked = 1;
        _;
        _locked = 0;
    }

    /// @dev Revive/PolkaVM: constructor calldata is ignored. Use initializeGuardian() after deploy.
    constructor() {
        // guardian = 0 until initializeGuardian()
    }

    /// @notice Set guardian once (only when guardian is unset). Needed for Revive where constructor calldata is ignored.
    function initializeGuardian(address _guardian) external {
        if (guardian != address(0)) revert GuardianAlreadySet();
        if (_guardian == address(0)) revert ZeroAddress();
        guardian = _guardian;
        emit GuardianUpdated(address(0), _guardian);
    }

    /// @notice Set stablecoin token for mint/repay. Only guardian, once, when totalDebt is 0.
    function setStablecoin(address _stablecoin) external onlyGuardian {
        if (stablecoin != address(0)) revert StablecoinAlreadySet();
        if (totalDebt != 0) revert DebtMustBeZeroToSetStablecoin();
        if (_stablecoin == address(0)) revert ZeroAddress();
        stablecoin = _stablecoin;
        emit StablecoinSet(_stablecoin);
    }

    /// @notice Deposit native DOT as collateral. Prefer this for direct UX; receive() also credits deposits.
    /// @dev Sending native tokens to the contract (without data) triggers receive() and credits msg.sender.
    function deposit() external payable {
        if (msg.value == 0) return;
        collateral[msg.sender] += msg.value;
        totalCollateral += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /// @notice Withdraw collateral. Fails if the resulting health factor would be below 150% (or if you have debt).
    /// @param amount Amount of native token to withdraw (wei).
    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (amount > collateral[msg.sender]) revert InsufficientCollateral();
        collateral[msg.sender] -= amount;
        totalCollateral -= amount;
        if (debt[msg.sender] > 0 && _healthFactor(msg.sender) < MIN_COLLATERAL_RATIO) revert UnhealthyPosition();
        (bool ok,) = msg.sender.call{ value: amount }("");
        if (!ok) revert TransferFailed();
        emit Withdraw(msg.sender, amount);
    }

    /// @notice Mint stablecoin (increase debt). Fails if health factor would fall below 150%.
    /// @param amount Debt to mint (wei; 1:1 with stablecoin). When stablecoin set, mints tokens to caller.
    function mint(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        debt[msg.sender] += amount;
        totalDebt += amount;
        if (_healthFactor(msg.sender) < MIN_COLLATERAL_RATIO) revert UnhealthyPosition();
        if (stablecoin != address(0)) {
            IStablecoin(stablecoin).mint(msg.sender, amount);
        }
        emit Mint(msg.sender, amount);
    }

    /// @notice Repay stablecoin (reduce debt). Repays min(amount, current debt).
    /// @param amount Amount to repay (wei). When stablecoin set, pulls tokens from caller and burns.
    function repay(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        uint256 d = debt[msg.sender];
        if (d == 0) revert InsufficientDebt();
        if (amount > d) amount = d;
        if (amount > totalDebt) amount = totalDebt; // Defensive: prevent underflow if totalDebt out of sync
        debt[msg.sender] = d - amount;
        totalDebt -= amount;
        if (stablecoin != address(0)) {
            IStablecoin(stablecoin).transferFrom(msg.sender, address(this), amount);
            IStablecoin(stablecoin).burn(address(this), amount);
        }
        emit Repay(msg.sender, amount);
    }

    /// @notice Guardian-only: repay a user's debt (e.g. to avoid liquidation). Amount capped to user's debt.
    /// @param user Position to help.
    /// @param amount Amount of debt to repay (wei). When stablecoin set, guardian must provide tokens.
    function flashRepay(address user, uint256 amount) external onlyGuardian {
        if (user == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        uint256 d = debt[user];
        if (d == 0) revert InsufficientDebt();
        if (amount > d) amount = d;
        if (amount > totalDebt) amount = totalDebt; // Defensive: prevent underflow if totalDebt out of sync (e.g. REVM edge case)
        debt[user] = d - amount;
        totalDebt -= amount;
        if (stablecoin != address(0)) {
            IStablecoin(stablecoin).transferFrom(msg.sender, address(this), amount);
            IStablecoin(stablecoin).burn(address(this), amount);
        }
        emit FlashRepay(user, amount, msg.sender);
    }

    /// @notice Set a new guardian (e.g. key rotation). Callable only by current guardian.
    /// @param _newGuardian New guardian address; must not be zero.
    function setGuardian(address _newGuardian) external onlyGuardian {
        if (_newGuardian == address(0)) revert ZeroAddress();
        address previous = guardian;
        guardian = _newGuardian;
        emit GuardianUpdated(previous, _newGuardian);
    }

    /// @notice Collateral balance of a user (wei).
    function getCollateral(address user) external view returns (uint256) {
        return collateral[user];
    }

    /// @notice Debt (stablecoin) balance of a user (wei).
    function getDebt(address user) external view returns (uint256) {
        return debt[user];
    }

    /// @notice Health factor = (collateral / debt) in RATIO_PRECISION. Returns 2e18 when debt is zero (healthy).
    function getHealthFactor(address user) public view returns (uint256) {
        uint256 d = debt[user];
        if (d == 0) return RATIO_PRECISION * 2;
        return (collateral[user] * RATIO_PRECISION) / d;
    }

    function _healthFactor(address user) internal view returns (uint256) {
        return getHealthFactor(user);
    }

    /// @notice Accept direct transfers of native token; credits sender as with deposit().
    receive() external payable {
        if (msg.value == 0) return;
        collateral[msg.sender] += msg.value;
        totalCollateral += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
