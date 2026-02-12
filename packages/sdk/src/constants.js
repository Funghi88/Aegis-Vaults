/** AegisVault ABI — deposit, withdraw, mint, repay, flashRepay, read functions. */
export const VAULT_ABI = [
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "function mint(uint256 amount)",
  "function repay(uint256 amount)",
  "function flashRepay(address user, uint256 amount)",
  "function getCollateral(address) view returns (uint256)",
  "function getDebt(address) view returns (uint256)",
  "function getHealthFactor(address) view returns (uint256)",
  "function guardian() view returns (address)",
  "function stablecoin() view returns (address)",
];

/** Default chain IDs. */
export const CHAIN_IDS = {
  POLKADOT_HUB_TESTNET: 420420417,
};
