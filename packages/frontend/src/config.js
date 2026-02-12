/** Vault & chain config. Replace with your deployed address and RPC after deploy. */
export const VAULT_ADDRESS =
  import.meta.env.VITE_VAULT_ADDRESS || "0xa44639cd0d0e6c6607491088c9c549e184456122";

/** Vault type: "full" = AegisVault (repay, withdraw); "demo" = AegisVaultDemo (no repay/withdraw). */
export const VAULT_TYPE = (import.meta.env.VITE_VAULT_TYPE || "demo").toLowerCase();
export const VAULT_HAS_REPAY = VAULT_TYPE === "full";
export const VAULT_HAS_WITHDRAW = VAULT_TYPE === "full";

/** Polkadot Hub TestNet (Paseo) or your chain's EVM RPC. */
export const RPC_URL =
  import.meta.env.VITE_RPC_URL || "https://services.polkadothub-rpc.com/testnet";

/** Chain ID for MetaMask (Hardhat local: 420420417). */
export const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || "420420417");

/** Chain name for display. */
export const CHAIN_NAMES = {
  420420417: "Hardhat Local",
  888: "Paseo",
  137: "Polygon",
};

/** Native token symbol (DEV for local Hardhat, PAS for Paseo/Polkadot Hub TestNet). */
export const NATIVE_TOKEN = import.meta.env.VITE_NATIVE_TOKEN || "PAS";

/** WebSocket endpoint for XCM (Polkadot.js API). */
export const WS_ENDPOINT = import.meta.env.VITE_WS_ENDPOINT || "wss://paseo-asset-hub-rpc.polkadot.io";
