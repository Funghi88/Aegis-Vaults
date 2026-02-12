/**
 * @aegis-vaults/sdk — SDK for Aegis Vaults
 *
 * Vault operations:
 *   import { createVault, getPosition } from '@aegis-vaults/sdk';
 *
 * Constants:
 *   import { VAULT_ABI, CHAIN_IDS } from '@aegis-vaults/sdk';
 */

export { VAULT_ABI, CHAIN_IDS } from "./constants.js";
export { createVault, getPosition } from "./vault.js";
