const { ethers } = require("ethers");
const { getVaultState } = require("./vault");

const MIN_HEALTH = 15e16; // 1.5e18 = 150% in 18 decimals

async function rebalanceVault(params) {
  const { vaultAddress, userAddress, guardianKey, rpcUrl } = params;
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(guardianKey, provider);
  const vault = new ethers.Contract(vaultAddress, require("./vault").ABI, wallet);

  const state = await getVaultState(provider, vaultAddress, userAddress);
  const health = BigInt(state.healthFactor);

  if (health >= MIN_HEALTH) {
    return { action: "no_action", reason: "Health factor OK", health: state.healthFactor };
  }

  const repayAmount = state.debt; // Repay full debt to maximize health
  const tx = await vault.flashRepay(userAddress, repayAmount);
  await tx.wait();
  return { action: "flashRepay", txHash: tx.hash, amount: repayAmount };
}

module.exports = { rebalanceVault };