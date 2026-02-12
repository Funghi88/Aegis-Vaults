require("dotenv").config();
const { fetchAPYs, getBestYield } = require("./oracle");
const { getVaultState } = require("./vault");

async function main() {
  console.log("=== AI Oracle ===");
  const yields = await fetchAPYs();
  console.log("APYs:", yields);

  const best = await getBestYield();
  console.log("Best yield:", best.name, best.apy.toFixed(2) + "%");

  if (process.env.AEGIS_VAULT_ADDRESS) {
    console.log("\n=== Vault state (check 0x0...1) ===");
    const { ethers } = require("ethers");
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const state = await getVaultState(
      provider,
      process.env.AEGIS_VAULT_ADDRESS,
      "0x0000000000000000000000000000000000000001"
    );
    console.log(state);
  }
}

main().catch(console.error);