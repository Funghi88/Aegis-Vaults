import "dotenv/config";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { decodeAddress } from "@polkadot/util-crypto";

function normalizeMnemonic(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

async function promptHidden(promptText) {
  // Minimal hidden prompt (no echo). Works in most terminals.
  if (!process.stdin.isTTY) throw new Error("Cannot prompt for mnemonic (stdin is not a TTY). Set SENDER_SEED env var.");

  const stdin = process.stdin;
  const stdout = process.stdout;

  stdout.write(promptText);
  stdin.setEncoding("utf8");
  stdin.resume();

  const wasRaw = stdin.isRaw;
  stdin.setRawMode(true);

  return await new Promise((resolve, reject) => {
    let input = "";

    const cleanup = () => {
      stdin.off("data", onData);
      try {
        stdin.setRawMode(Boolean(wasRaw));
      } catch (_) {
        // ignore
      }
      stdin.pause();
      stdout.write("\n");
    };

    const onData = (chunk) => {
      const s = String(chunk);
      for (const ch of s) {
        // Enter
        if (ch === "\r" || ch === "\n") {
          cleanup();
          resolve(input);
          return;
        }

        // Ctrl+C
        if (ch === "\u0003") {
          cleanup();
          reject(new Error("Cancelled"));
          return;
        }

        // Backspace (DEL or BS)
        if (ch === "\u007f" || ch === "\b") {
          input = input.slice(0, -1);
          continue;
        }

        input += ch;
      }
    };

    stdin.on("data", onData);
  });
}

// Prefer WS_ENDPOINTS (list) so CLI overrides .env; else WS_ENDPOINT (single)
const PASEO_FALLBACKS = ["wss://sys.ibp.network/asset-hub-paseo", "wss://asset-hub-paseo-rpc.polkadot.io"];
let WS_ENDPOINTS;
if (process.env.WS_ENDPOINTS) {
  WS_ENDPOINTS = process.env.WS_ENDPOINTS.split(",").map((s) => s.trim()).filter(Boolean);
} else if (process.env.WS_ENDPOINT) {
  const primary = process.env.WS_ENDPOINT.trim();
  WS_ENDPOINTS = [primary, ...PASEO_FALLBACKS.filter((u) => u !== primary)];
} else {
  WS_ENDPOINTS = ["ws://127.0.0.1:8000", ...PASEO_FALLBACKS];
}
const WS_ENDPOINT = WS_ENDPOINTS[0];
const SENDER_SEED = normalizeMnemonic(process.env.SENDER_SEED);
const RECIPIENT_RAW = (process.env.RECIPIENT_SS58 || "").trim().replace(/\s/g, "");
const DEST_PARA_ID = parseInt(process.env.DEST_PARA_ID || "4001", 10); // 0 = relay; 4001 = Pop (Paseo); 2034 = Hydration (mainnet)
const XCM_METHOD = (process.env.XCM_METHOD || "teleport").toLowerCase(); // teleport | reserve
const ASSET_ID_RAW = (process.env.ASSET_ID || "native").toString().toLowerCase();
const USE_NATIVE = ASSET_ID_RAW === "native" || ASSET_ID_RAW === "0";
const ASSET_ID = USE_NATIVE ? 0 : parseInt(ASSET_ID_RAW, 10); // "native" or 0 = PAS; 1984 = USDC on mainnet
const AMOUNT = BigInt(process.env.AMOUNT || (USE_NATIVE ? "100000000" : "1000000")); // 0.01 PAS (10 dec) or 1 USDC (6 dec)
// V3 = Chopsticks fork (block 6M); V4 = Paseo/current Asset Hub
const XCM_VER = (process.env.XCM_VERSION || "").toUpperCase() || null;

if (!RECIPIENT_RAW) {
  console.error("Set RECIPIENT_SS58 (Polkadot SS58, 47-48 chars, or 0x + 64 hex)");
  process.exit(1);
}

// Normalize recipient to 32-byte hex for AccountId32 (SS58 or 0x+64 hex)
let recipientIdHex;
if (RECIPIENT_RAW.startsWith("0x") && /^0x[0-9a-fA-F]{64}$/.test(RECIPIENT_RAW)) {
  recipientIdHex = RECIPIENT_RAW.length === 66 ? RECIPIENT_RAW : `0x${RECIPIENT_RAW.slice(2).padStart(64, "0")}`;
} else {
  try {
    const bytes = decodeAddress(RECIPIENT_RAW);
    if (bytes.length !== 32) {
      console.error("RECIPIENT_SS58 decodes to " + bytes.length + " bytes. XCM beneficiary must be a 32-byte Polkadot/Substrate address (not a 20-byte EVM address). Example: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
      process.exit(1);
    }
    recipientIdHex = "0x" + Buffer.from(bytes).toString("hex");
  } catch (e) {
    console.error("RECIPIENT_SS58 must be a valid Polkadot SS58 address (47-48 chars) or 0x + 64 hex chars. Example: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
    console.error(e.message);
    process.exit(1);
  }
}

async function connectWithTimeout(promise, ms) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Connection timeout")), ms);
  });
  try {
    const result = await Promise.race([promise, timeout]);
    clearTimeout(timeoutId);
    return result;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

async function connectApi() {
  const reconnectMs = 8000;
  const connectTimeoutMs = 20000;
  for (const endpoint of WS_ENDPOINTS) {
    try {
      console.log("Connecting to", endpoint, "...");
      const provider = new WsProvider(endpoint, reconnectMs);
      const api = await connectWithTimeout(
        ApiPromise.create({ provider }).then((a) => a.isReady.then(() => a)),
        connectTimeoutMs
      );
      return { api, endpoint };
    } catch (e) {
      console.warn("Connection failed to", endpoint, "-", e.message || e);
      if (WS_ENDPOINTS.indexOf(endpoint) < WS_ENDPOINTS.length - 1) {
        console.log("Trying next endpoint...");
      } else {
        throw e;
      }
    }
  }
  throw new Error("No endpoints available");
}

async function main() {
  const { api, endpoint } = await connectApi();
  if (endpoint !== WS_ENDPOINT) {
    console.log("Using endpoint:", endpoint);
  }
  const keyring = new Keyring({ type: "sr25519" });
  let senderSeed = SENDER_SEED;
  let sender;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (!senderSeed) {
      senderSeed = normalizeMnemonic(await promptHidden("Enter SENDER_SEED (mnemonic, hidden): "));
    }

    try {
      sender = keyring.addFromMnemonic(senderSeed);
      break;
    } catch (e) {
      if (/invalid bip39|mnemonic|invalid.*seed/i.test(String(e.message))) {
        senderSeed = "";
        if (attempt === 2) {
          console.error("Invalid SENDER_SEED: mnemonic is not valid BIP39 (typo / wrong words / wrong length).");
          throw e;
        }
        console.error("Invalid mnemonic. Try again.");
        continue;
      }
      throw e;
    }
  }

  // Chopsticks fork (block 6M) uses V3; Paseo/current Asset Hub uses V4.
  const isLocal = /localhost|127\.0\.0\.1/i.test(endpoint);
  const ver = XCM_VER || (isLocal ? "V3" : "V4");
  const isV3 = ver === "V3";

  // V3: X1 takes single junction { Parachain: id }; V4: X1 takes array [{ Parachain: id }]
  const junction = (j) => (isV3 ? j : [j]);
  const destination =
    DEST_PARA_ID === 0
      ? { [ver]: { parents: 1, interior: { Here: null } } }
      : { [ver]: { parents: 1, interior: { X1: junction({ Parachain: DEST_PARA_ID }) } } };

  const beneficiary = {
    [ver]: {
      parents: 0,
      interior: { X1: junction({ AccountId32: { network: null, id: recipientIdHex } }) },
    },
  };

  const assetLocation = USE_NATIVE
    ? { parents: 0, interior: { Here: null } }
    : { parents: 0, interior: { X2: [ { PalletInstance: 50 }, { GeneralIndex: ASSET_ID } ] } };
  // V3 AssetId: Concrete(MultiLocation); V4 uses bare MultiLocation
  const assetId = isV3 ? { Concrete: assetLocation } : assetLocation;
  const assets = { [ver]: [ { id: assetId, fun: { Fungible: AMOUNT } } ] };

  const feeAssetItem = 0;
  const weightLimit = { Unlimited: null };

  const pallet = api.tx.polkadotXcm;
  const tx =
    XCM_METHOD === "teleport" && USE_NATIVE
      ? pallet.limitedTeleportAssets(destination, beneficiary, assets, feeAssetItem, weightLimit)
      : pallet.limitedReserveTransferAssets(destination, beneficiary, assets, feeAssetItem, weightLimit);

  const senderAddress = sender.address;
  const methodName = XCM_METHOD === "teleport" && USE_NATIVE ? "limitedTeleportAssets" : "limitedReserveTransferAssets";
  const isPaseo = /paseo|passet/i.test(endpoint);
  console.log("Endpoint:", endpoint);
  if (isPaseo && DEST_PARA_ID === 0) {
    console.log("Note: Relay (DEST_PARA_ID=0) often fails on Paseo. Try DEST_PARA_ID=4001 (Pop) if this fails.");
  }
  console.log("Sender (this account needs PAS on Asset Hub):", senderAddress);
  console.log("Destination:", DEST_PARA_ID === 0 ? "relay" : "parachain " + DEST_PARA_ID);
  console.log("Method:", methodName);
  console.log("Recipient (id):", recipientIdHex.slice(0, 18) + "...");
  console.log("Asset:", USE_NATIVE ? "native (PAS)" : "id " + ASSET_ID, "Amount (raw):", AMOUNT.toString());

  const unsub = await tx.signAndSend(sender, async ({ status, txHash }) => {
    console.log("Status:", status.toString(), "Hash:", txHash.toHex());
    if (status.isInBlock) console.log("In block:", status.asInBlock.toHex());
    if (status.isFinalized) {
      const blockHash = status.asFinalized;
      try {
        const [block, events] = await Promise.all([
          api.rpc.chain.getBlock(blockHash),
          api.query.system.events.at(blockHash),
        ]);
        let exIndex = block.block.extrinsics.findIndex((ex) => ex.hash.toHex() === txHash.toHex());
        if (exIndex < 0) exIndex = 0;
        let failed = false;
        let errMsg = "";
        for (const record of events) {
          const { phase, event } = record;
          if (phase.isApplyExtrinsic && phase.asApplyExtrinsic.toNumber() === exIndex) {
            const mod = event.section;
            const name = event.method;
            if (mod === "system" && name === "ExtrinsicFailed") {
              failed = true;
              const err = event.data[0];
              errMsg = err?.toHuman ? JSON.stringify(err.toHuman()) : String(err ?? event.data);
              break;
            }
            if (mod === "system" && name === "ExtrinsicSuccess") break;
          }
        }
        if (failed) {
          console.error("\n❌ XCM FAILED (check Subscan):", errMsg);
          const isLocalExec = /LocalExecutionIncompleteWithError|localExecutionIncomplete/i.test(errMsg);
          if (isLocalExec) {
            console.error("\n   LocalExecutionIncompleteWithError → XCM reached destination but execution failed.");
            console.error("   Often caused by HRMP/channel config or unsupported XCM version.");
            console.error("   Try in order:");
            console.error("   1. XCM_METHOD=reserve npm run xcm-transfer");
            console.error("   2. Different DEST_PARA_ID: 4001 (Pop, Paseo) or 2034 (Hydration, mainnet only)");
            console.error("   3. Fallback: Pop Onboarding UI: https://onpop.io/network/onboard");
          } else {
            console.error("   Try: XCM_METHOD=reserve npm run xcm-transfer");
            console.error("   Or use Pop onboarding UI: https://onpop.io/network/onboard");
          }
          process.exit(1);
        }
      } catch (_) {
        // If event parsing fails, still report finalized
      }
      console.log("Finalized:", blockHash.toHex());
      unsub();
      api.disconnect();
      process.exit(0);
    }
  });
}

main().catch((err) => {
  const msg = String(err.message || err);
  const is1010Fees = msg.includes("1010") && (msg.includes("payment") || msg.includes("fee") || msg.includes("balance too low") || msg.includes("Inability to pay"));
  if (is1010Fees) {
    console.error("\n1010: Sender account cannot pay fees (balance too low).");
    console.error("The sender is the account derived from SENDER_SEED (printed above).");
    console.error("Fund THAT address on Paseo Asset Hub (not Relay):");
    console.error("  → https://faucet.polkadot.io (choose Paseo → Asset Hub, paste the SENDER address, request PAS)");
    console.error("Then run this script again with the same SENDER_SEED.");
    console.error("On a Chopsticks fork (ws://127.0.0.1:8000): use Developer → RPC → dev_setStorage to set System.Account balance.");
  } else if (/Cancelled/.test(msg)) {
    console.error("Cancelled.");
  } else {
    console.error(err);
  }
  process.exit(1);
});
