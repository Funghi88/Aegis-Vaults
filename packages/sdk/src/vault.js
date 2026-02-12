import { Contract } from "ethers";
import { VAULT_ABI } from "./constants.js";

/**
 * Create a vault contract instance.
 * @param {import('ethers').ContractRunner} providerOrSigner - ethers Provider or Signer
 * @param {string} vaultAddress - AegisVault contract address
 * @returns {Contract}
 */
export function createVault(providerOrSigner, vaultAddress) {
  return new Contract(vaultAddress, VAULT_ABI, providerOrSigner);
}

/**
 * Read vault position for a user.
 * @param {Contract} vault - vault contract instance
 * @param {string} userAddress - EVM address
 * @returns {Promise<{collateral: string, debt: string, healthFactor: string}>}
 */
export async function getPosition(vault, userAddress) {
  const [collateral, debt, healthFactor] = await Promise.all([
    vault.getCollateral(userAddress),
    vault.getDebt(userAddress),
    vault.getHealthFactor(userAddress),
  ]);
  return {
    collateral: collateral.toString(),
    debt: debt.toString(),
    healthFactor: healthFactor.toString(),
  };
}
