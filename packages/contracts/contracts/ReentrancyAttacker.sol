// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./AegisVault.sol";

/**
 * @notice Test helper: reenters AegisVault.withdraw from receive() to verify nonReentrant.
 */
contract ReentrancyAttacker {
    AegisVault public vault;
    uint256 public attackAmount;

    constructor(address _vault) {
        vault = AegisVault(payable(_vault));
    }

    function deposit() external payable {
        vault.deposit{ value: msg.value }();
    }

    function attackWithdraw(uint256 amount) external {
        attackAmount = amount;
        vault.withdraw(amount);
    }

    receive() external payable {
        vault.withdraw(attackAmount);
    }
}
