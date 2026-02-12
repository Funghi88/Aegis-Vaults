import "dotenv/config";
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// Bypass proxy for Hardhat RPC — avoids "Invalid URL protocol" when HTTP_PROXY is ws://
// (e.g. from Chopsticks). Only affects this process; does not touch your shell env.
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;

const testnetAccounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
  networks: {
    hardhat: {
      chainId: 420420417,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 420420417,
      accounts: testnetAccounts.length ? testnetAccounts : undefined,
    },
    // Polkadot Hub TestNet (REVM) — use for Paseo/Asset Hub when targeting testnet
    polkadotTestnet: {
      url: "https://services.polkadothub-rpc.com/testnet",
      chainId: 420420417,
      accounts: testnetAccounts,
    },
  },
};

export default config;
