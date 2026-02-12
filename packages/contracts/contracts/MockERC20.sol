// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title MockERC20
 * @notice Minimal ERC20 with mint for testing. Vault is minter; mints on mint(), holds on repay().
 */
contract MockERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    uint256 public totalSupply;

    address public minter;
    address public owner;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    error OnlyMinter();
    error OnlyOwner();
    error TransferFailed();

    constructor(string memory _name, string memory _symbol, uint8 _decimals) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = msg.sender;
        minter = msg.sender;
    }

    function setMinter(address _minter) external {
        if (msg.sender != owner) revert OnlyOwner();
        minter = _minter;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != minter) revert OnlyMinter();
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    /// @notice Burn tokens (vault calls after repay). Only minter.
    function burn(address from, uint256 amount) external {
        if (msg.sender != minter) revert OnlyMinter();
        if (balanceOf[from] < amount) revert TransferFailed();
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - amount;
        }
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (balanceOf[from] < amount) revert TransferFailed();
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
