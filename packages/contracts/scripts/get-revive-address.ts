/**
 * Get AegisVault address from Instantiated event.
 * Usage: npx ts-node scripts/get-revive-address.ts [blockHash]
 * Scans last 20 blocks if no block hash given.
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "..", ".env.revive") });

import { ApiPromise, WsProvider } from "@polkadot/api";

const WS = (process.env.WS_ENDPOINT || "ws://127.0.0.1:9944").trim();
const BLOCK = process.argv[2] || process.env.BLOCK_HASH;

async function scanBlock(api: ApiPromise, hash: string): Promise<string | null> {
  const raw = await api.query.system.events.at(hash);
  const records = Array.isArray(raw) ? raw : (raw as any)?.toArray?.() ?? [];
  for (const rec of records) {
    const event = rec?.event ?? rec;
    const section = String(event?.section ?? "");
    const method = String(event?.method ?? "");
    if (process.env.DEBUG) console.log(section, method);
    // pallet_revive emits Instantiated(deployer, contract, code_hash)
    if (section.toLowerCase().includes("revive") && method.toLowerCase().includes("instantiat")) {
      const data = event?.data;
      const addr = data?.[1]?.toString?.() ?? (Array.isArray(data) ? data[1] : null);
      if (addr) return addr;
    }
  }
  return null;
}

async function main() {
  const api = await ApiPromise.create({ provider: new WsProvider(WS) });
  if (BLOCK) {
    const hash = BLOCK.startsWith("0x") ? BLOCK : api.registry.createType("BlockHash", BLOCK).toHex();
    const addr = await scanBlock(api, hash);
    if (addr) {
      console.log("AegisVault:", addr);
      await api.disconnect();
      process.exit(0);
    }
  } else {
    const h = await api.rpc.chain.getBlockHash();
    let hash = h.toHex();
    for (let i = 0; i < 20; i++) {
      const addr = await scanBlock(api, hash);
      if (addr) {
        console.log("AegisVault:", addr);
        await api.disconnect();
        process.exit(0);
      }
      const header = await api.rpc.chain.getHeader(hash);
      hash = header.parentHash.toHex();
      if (hash === "0x0000000000000000000000000000000000000000000000000000000000000000") break;
    }
  }
  console.log("No Instantiated event found");
  await api.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
