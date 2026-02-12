// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title AegisVaultDemo
 * @notice Same as AegisVault but MIN_COLLATERAL_RATIO = 100% for guardian demo.
 *         Allows deposit 100 + mint 100 (health = 1) to simulate crash.
 */
contract AegisVaultDemo {
    uint256 public constant MIN_COLLATERAL_RATIO = 1e18; // 100% for demo
    uint256 public constant RATIO_PRECISION = 1e18;

    uint256 private _locked;
    address public guardian;
    mapping(address => uint256) public collateral;
    mapping(address => uint256) public debt;
    uint256 public totalCollateral;
    uint256 public totalDebt;

    event Deposit(address indexed user, uint256 amount);
    event Mint(address indexed user, uint256 amount);
    event FlashRepay(address indexed user, uint256 amount, address indexed guardian);
    event GuardianUpdated(address indexed previousGuardian, address indexed newGuardian);

    error OnlyGuardian();
    error GuardianAlreadySet();
    error InsufficientCollateral();
    error UnhealthyPosition();
    error InsufficientDebt();
    error ZeroAmount();
    error ZeroAddress();
    error ReentrancyGuard();

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

    constructor() {}

    function initializeGuardian(address _guardian) external {
        if (guardian != address(0)) revert GuardianAlreadySet();
        if (_guardian == address(0)) revert ZeroAddress();
        guardian = _guardian;
        emit GuardianUpdated(address(0), _guardian);
    }

    function deposit() external payable {
        if (msg.value == 0) return;
        collateral[msg.sender] += msg.value;
        totalCollateral += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function mint(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        debt[msg.sender] += amount;
        totalDebt += amount;
        if (_healthFactor(msg.sender) < MIN_COLLATERAL_RATIO) revert UnhealthyPosition();
        emit Mint(msg.sender, amount);
    }

    /// @dev Demo only: simulate crash by setting debt = 2x collateral (health = 0.5)
    function demoSetUnhealthy(address user) external onlyGuardian {
        uint256 c = collateral[user];
        if (c == 0) return;
        uint256 extraDebt = c; // debt becomes 2*c total
        debt[user] += extraDebt;
        totalDebt += extraDebt;
    }

    function flashRepay(address user, uint256 amount) external onlyGuardian {
        if (user == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        uint256 d = debt[user];
        if (d == 0) revert InsufficientDebt();
        if (amount > d) amount = d;
        debt[user] = d - amount;
        totalDebt -= amount;
        emit FlashRepay(user, amount, msg.sender);
    }

    function getCollateral(address user) external view returns (uint256) {
        return collateral[user];
    }

    function getDebt(address user) external view returns (uint256) {
        return debt[user];
    }

    function getHealthFactor(address user) public view returns (uint256) {
        uint256 d = debt[user];
        if (d == 0) return RATIO_PRECISION * 2;
        return (collateral[user] * RATIO_PRECISION) / d;
    }

    function _healthFactor(address user) internal view returns (uint256) {
        return getHealthFactor(user);
    }

    receive() external payable {
        if (msg.value == 0) return;
        collateral[msg.sender] += msg.value;
        totalCollateral += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
}
