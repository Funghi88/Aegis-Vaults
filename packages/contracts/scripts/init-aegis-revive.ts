/**
 * Initialize AegisVault: call initializeGuardian, then deposit.
 * Usage: CONTRACT_ADDRESS=0x... npx ts-node scripts/init-aegis-revive.ts
 * Or:   npx ts-node scripts/init-aegis-revive.ts 0x...
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config();
dotenv.config({ path: path.join(__dirname, "..", ".env.revive") });

import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";

const WS = (process.env.WS_ENDPOINT || "ws://127.0.0.1:9944").trim();
const DEPLOYER_SEED = (process.env.DEPLOYER_SEED || "//Alice").trim();
const GUARDIAN_ADDRESS = (
  process.env.GUARDIAN_ADDRESS ||
  process.env.GUARDIAN ||
  "0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48"
).trim();
const CONTRACT_ADDRESS = (process.argv[2] || process.env.CONTRACT_ADDRESS || "").trim();
const DEPOSIT_AMOUNT = process.env.DEPOSIT_AMOUNT || "1000000000000000000"; // 1 token
const SKIP_INIT = process.env.SKIP_INIT === "1" || process.env.SKIP_INIT === "true";

function evmAddressToH160(addr: string): string {
  const hex = addr.startsWith("0x") ? addr.slice(2) : addr;
  return "0x" + hex.padStart(40, "0").toLowerCase();
}

function encodeAddressArg(addr: string): string {
  const h = evmAddressToH160(addr);
  return h.slice(2).padStart(64, "0");
}

// keccak256("initializeGuardian(address)")[0:4]
const INIT_GUARDIAN_SELECTOR = "529963f9";

async function main() {
  if (!CONTRACT_ADDRESS) {
    console.error("Usage: CONTRACT_ADDRESS=0x... npx ts-node scripts/init-aegis-revive.ts");
    console.error("   Or: npx ts-node scripts/init-aegis-revive.ts 0x...");
    process.exit(1);
  }

  const provider = new WsProvider(WS);
  const api = await ApiPromise.create({ provider });

  const revivePallet = api.tx.revive ?? api.tx.Revive;
  if (!revivePallet?.call) {
    console.error("revive.call not found");
    await api.disconnect();
    process.exit(1);
  }

  const keyring = new Keyring({ type: "sr25519" });
  const signer = keyring.addFromUri(DEPLOYER_SEED);

  const dest = evmAddressToH160(CONTRACT_ADDRESS);
  const weightLimit = { refTime: 100_000_000_000, proofSize: 64 * 1024 };
  const storageDepositLimit = "1000000000000000000";

  // 1. initializeGuardian(guardian) — skip if SKIP_INIT or already set
  if (!SKIP_INIT) {
  const initData =
    "0x" +
    INIT_GUARDIAN_SELECTOR +
    encodeAddressArg(GUARDIAN_ADDRESS);

  if (!SKIP_INIT) console.log("Calling initializeGuardian(", GUARDIAN_ADDRESS, ")...");
  try {
    await new Promise<void>((resolve, reject) => {
      revivePallet
        .call(dest, 0, weightLimit, storageDepositLimit, initData)
        .signAndSend(signer, ({ status, events }) => {
          if (status.isInBlock) console.log("  in block");
          if (status.isFinalized) {
            for (const { event } of events) {
              if (event.section === "system" && event.method === "ExtrinsicFailed") {
                const err = (event.data.toJSON() as any[])?.[0]?.module?.error;
                if (String(err).toLowerCase() === "0x1a000000") {
                  console.log("  (guardian already set, skipping)");
                  resolve();
                  return;
                }
                reject(new Error("initializeGuardian failed: " + JSON.stringify(event.data.toJSON())));
                return;
              }
            }
            console.log("  done");
            resolve();
          }
        })
        .catch(reject);
    });
  } catch (e: any) {
    if (e?.message?.includes("0x1a000000")) {
      console.log("  (guardian already set, continuing)");
    } else throw e;
  }
  }

  // 2. deposit(1 token)
  const depositSelector = "d0e30db0"; // keccak256("deposit()")[0:4]
  const depositData = "0x" + depositSelector;

  console.log("Calling deposit(", DEPOSIT_AMOUNT, ")...");
  await new Promise<void>((resolve, reject) => {
    revivePallet
      .call(dest, DEPOSIT_AMOUNT, weightLimit, storageDepositLimit, depositData)
      .signAndSend(signer, ({ status, events }) => {
        if (status.isInBlock) console.log("  in block");
        if (status.isFinalized) {
          for (const { event } of events) {
            if (event.section === "system" && event.method === "ExtrinsicFailed") {
              reject(new Error("deposit failed: " + JSON.stringify(event.data.toJSON())));
              return;
            }
          }
          console.log("  done");
          resolve();
        }
      })
      .catch(reject);
  });

  console.log("---");
  console.log("AegisVault at", CONTRACT_ADDRESS, "ready. Use mint/repay in Remix.");
  await api.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
