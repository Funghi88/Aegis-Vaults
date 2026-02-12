/**
 * Standalone Revive/PolkaVM compile — uses local resolc binary.
 * Bypasses Hardhat plugin (avoids download/proxy issues).
 * Output: build/revive/
 */
import { spawnSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

const BIN = path.join(__dirname, "..", "bin", "resolc-universal-apple-darwin");
const SRC = path.join(__dirname, "..", "contracts", "AegisVault.sol");
const OUT = path.join(__dirname, "..", "build", "revive");

if (!fs.existsSync(BIN)) {
  console.error("resolc binary not found. Run: ./scripts/download-resolc.sh");
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });

const result = spawnSync(BIN, [SRC, "--bin", "-o", OUT, "-O3", "--overwrite"], {
  stdio: "inherit",
  env: { ...process.env },
});

process.exit(result.status ?? 1);
