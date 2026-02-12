/**
 * Deploy AegisVault to a chain with pallet_revive (PolkaVM).
 *
 * Prerequisites:
 *   1. npm run compile:revive  (produces build/revive/AegisVault.sol:AegisVault.pvm)
 *   2. Set env or add to packages/contracts/.env.revive: WS_ENDPOINT, DEPLOYER_SEED, GUARDIAN_ADDRESS
 *
 * Note: pallet_revive is experimental. As of 2025, it may not be on public
 * Asset Hub Paseo. Use a local substrate-revive-node or wait for mainnet.
 * If the pallet is not found, the script exits with a clear message.
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config();
dotenv.config({ path: path.join(__dirname, "..", ".env.revive") });

import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import * as fs from "fs";

// Load from .env, .env.revive, or shell
const WS_ENDPOINT = (process.env.WS_ENDPOINT || "ws://127.0.0.1:9944").trim();
const DEPLOYER_SEED = (process.env.DEPLOYER_SEED || "").trim();
const GUARDIAN_ADDRESS = (
  process.env.GUARDIAN_ADDRESS ||
  process.env.GUARDIAN ||
  ""
).trim();
const PVM_PATH = path.join(__dirname, "..", "build", "revive", "AegisVault.sol:AegisVault.pvm");

function evmAddressToH160(addr: string): string {
  const hex = addr.startsWith("0x") ? addr.slice(2) : addr;
  return "0x" + hex.padStart(40, "0").toLowerCase();
}

// ABI-encode constructor(address _guardian)
function encodeConstructor(guardianEvm: string): string {
  const h160 = evmAddressToH160(guardianEvm);
  return h160.slice(2).padStart(64, "0"); // 32 bytes for address
}

async function main() {
  if (!DEPLOYER_SEED) {
    console.error("Set DEPLOYER_SEED (mnemonic) in env");
    process.exit(1);
  }
  if (!GUARDIAN_ADDRESS) {
    console.error("Set GUARDIAN_ADDRESS (0x... EVM address) in env");
    process.exit(1);
  }
  if (!fs.existsSync(PVM_PATH)) {
    console.error("PVM file not found. Run: npm run compile:revive");
    process.exit(1);
  }

  const code = fs.readFileSync(PVM_PATH);
  const codeHex = "0x" + code.toString("hex");
  // Revive: constructor has no args; call initializeGuardian() after deploy
  const data = "0x";

  const provider = new WsProvider(WS_ENDPOINT);
  const api = await ApiPromise.create({ provider });

  // pallet_revive may be "revive" or "Revive" depending on runtime
  const revivePallet = api.tx.revive ?? api.tx.Revive;
  const hasRevive = revivePallet != null;
  if (!hasRevive) {
    console.error("pallet_revive is not available on this chain.");
    console.error("Use a local substrate-revive-node, or wait for Asset Hub Paseo to include it.");
    console.error("Revive deploy blocked until pallet available on target chain.");
    await api.disconnect();
    process.exit(1);
  }

  const keyring = new Keyring({ type: "sr25519" });
  // Supports mnemonic (12/24 words) or Substrate derivation e.g. //Alice
  const deployer = keyring.addFromUri(DEPLOYER_SEED);

  // AccountUnmapped (0x2B): Substrate account must be mapped before instantiate
  const mapAccount = revivePallet.mapAccount ?? revivePallet["map_account"];
  if (typeof mapAccount === "function") {
    console.log("Mapping deployer account (revive.mapAccount)...");
    await new Promise<void>((resolve, reject) => {
      mapAccount()
        .signAndSend(deployer, ({ status, events }) => {
          if (status.isInBlock) console.log("  mapAccount in block");
          if (status.isFinalized) {
            let failed = false;
            let errData: any = null;
            for (const { event } of events) {
              if (event.section === "system" && event.method === "ExtrinsicFailed") {
                failed = true;
                errData = event.data.toJSON();
                break;
              }
            }
            if (failed && errData?.[0]?.module?.error === "0x2c000000") {
              console.log("  (already mapped)");
            } else if (failed) {
              reject(new Error("mapAccount failed: " + JSON.stringify(errData)));
              return;
            } else {
              console.log("  mapped");
            }
            resolve();
          }
        })
        .catch(reject);
    });
  }

  const value = 0;
  const weightLimit = { refTime: 500_000_000_000, proofSize: 64 * 1024 };
  // StorageDepositLimitExhausted (0x18) if too low; use 1e18 to allow enough storage
  const storageDepositLimit = "1000000000000000000";

  const instantiate =
    revivePallet.instantiateWithCode ?? revivePallet["instantiate_with_code"];
  if (typeof instantiate !== "function") {
    console.error("instantiateWithCode not found on pallet");
    process.exit(1);
  }
  const tx = instantiate(
    value,
    weightLimit,
    storageDepositLimit,
    codeHex,
    data,
    null
  );

  console.log("Deploying AegisVault (Revive/PolkaVM)...");
  console.log("Endpoint:", WS_ENDPOINT);
  console.log("Guardian:", GUARDIAN_ADDRESS);

  const unsub = await tx.signAndSend(deployer, ({ status, txHash, events }) => {
    console.log("Status:", status.toString(), "Hash:", txHash.toHex());
    if (status.isInBlock) console.log("In block:", status.asInBlock.toHex());
    if (status.isFinalized) {
      for (const { event } of events) {
        if (event.section === "system" && event.method === "ExtrinsicFailed") {
          console.error("Deploy FAILED. Event:", event.data.toJSON());
          unsub();
          api.disconnect();
          process.exit(1);
        }
      }
      let contractAddr = "";
      for (const { event } of events) {
        const s = (event.section || "").toLowerCase();
        if (s === "revive" && event.method === "Instantiated") {
          const data = event.data.toJSON() as Record<string, unknown>;
          contractAddr = (data?.contract ?? data?.[1] ?? event.data[1]?.toString?.()) as string || "";
          break;
        }
      }
      console.log("Finalized:", status.asFinalized.toHex());
      if (contractAddr) {
        console.log("AegisVault address:", contractAddr);
        console.log("Next: call initializeGuardian(", GUARDIAN_ADDRESS, ") from Remix or eth-rpc.");
      } else {
        console.log("Check block explorer for contract address from Instantiated event.");
      }
      console.log("---");
      console.log("Document in docs/contracts.md under Revive (planned)");
      unsub();
      api.disconnect();
      process.exit(0);
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
