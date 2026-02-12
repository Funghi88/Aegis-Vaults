const { ethers } = require("ethers");

const ABI = [
  "function getCollateral(address) view returns (uint256)",
  "function getDebt(address) view returns (uint256)",
  "function getHealthFactor(address) view returns (uint256)",
  "function flashRepay(address,uint256)",
];

async function getVaultState(provider, vaultAddress, userAddress) {
  const vault = new ethers.Contract(vaultAddress, ABI, provider);
  const [collateral, debt, health] = await Promise.all([
    vault.getCollateral(userAddress),
    vault.getDebt(userAddress),
    vault.getHealthFactor(userAddress),
  ]);
  return {
    collateral: collateral.toString(),
    debt: debt.toString(),
    healthFactor: health.toString(),
  };
}

module.exports = { getVaultState, ABI };