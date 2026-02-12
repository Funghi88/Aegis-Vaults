# Contracts — ABIs, Addresses, Guardian

Reference for AegisVault deployment and integration (agent, frontend).

## Deployed addresses

| Network                    | Runtime | AegisVault | pUSD | Guardian (constructor) |
|----------------------------|---------|------------|------|------------------------|
| Polkadot Hub TestNet (Paseo) | REVM    | 0xBa9Fa63E2F9E776f7F08371FeC95dD1FCd34E137 | 0x11a8cAAD58BedBCbe0471d0dDf64516624d66279 | *(paste from deploy output)* |
| Revive (local)             | PVM     | 0xa44639cd0d0e6c6607491088c9c549e184456122 | — | 0x8eaf... (call initializeGuardian) |

**Revive status:** pallet_revive is experimental. As of 2025, it may not be on public Asset Hub Paseo. Use a local substrate-revive-node or wait for mainnet. See `deploy:revive` script.

**Guardian** is the address allowed to call `flashRepay(user, amount)` and `setGuardian(newGuardian)`. Document the guardian key for the AI Agent (LangChain tool) so it can sign rebalance transactions.

**To update:** After deploy, paste the printed addresses into the table above. Same chain applies for both rows (Polkadot Hub TestNet).

## Deploy

From repo root:

**Vault only (no pUSD):**
```bash
cd packages/contracts
export PRIVATE_KEY=0x...          # deployer (never commit)
export GUARDIAN_ADDRESS=0x...    # optional; defaults to deployer
npm run deploy:testnet
```

**Vault + pUSD stablecoin:**
```bash
cd packages/contracts
export PRIVATE_KEY=0x...
export GUARDIAN_ADDRESS=0x...    # optional
npm run deploy:pusd:testnet
```

Then paste the printed `AegisVault`, `pUSD`, and `Guardian` addresses into the table above.

## ABI

- **Full ABI:** `packages/contracts/artifacts/contracts/AegisVault.sol/AegisVault.json` (after `npm run compile`).
- Key functions: `deposit`, `withdraw`, `mint`, `repay`, `flashRepay`, `setGuardian`, `getCollateral`, `getDebt`, `getHealthFactor`.

## Revive (PolkaVM) — Hackathon track

Polkadot is promoting **pallet-revive** and **PolkaVM** for the Asset Hub hackathon.

**Compile for PolkaVM (no download, no proxy):** Uses local resolc binary.

```bash
cd packages/contracts
./scripts/download-resolc.sh   # once — fetches resolc v0.6.0 for macOS
npm run compile:revive
```

Output: `build/revive/AegisVault.sol:AegisVault.pvm`

**Deploy:** `npm run deploy:revive`

**WS 1006 Abnormal Closure?** Nothing is listening on `ws://127.0.0.1:9944`. You need a Revive node.

### Best move for Revive hackathon (must deploy to PolkaVM)

Hackathon requires PolkaVM/Revive — Paseo REVM won’t count. Since building locally needs 50+ GB:

**Option 1: Cloud VM (recommended)**

1. **Create** an EC2 instance (e.g. `t3.medium`, 64 GB disk) or GCP VM. Ubuntu 22.04.
2. **Build** on the VM:
   ```bash
   sudo apt install -y clang git curl
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
   source ~/.cargo/env
   git clone https://github.com/paritytech/polkadot-sdk.git
   cd polkadot-sdk
   cargo build -p revive-dev-node --bin revive-dev-node --release
   ```
3. **Run** the node: `./target/release/revive-dev-node --dev`
4. **Expose** port 9944: open in security group, or use SSH tunnel from your Mac:
   ```bash
   ssh -L 9944:localhost:9944 ubuntu@<VM-IP>
   ```
5. **Deploy from your Mac** (keep tunnel open):
   ```bash
   cd packages/contracts
   export WS_ENDPOINT=ws://127.0.0.1:9944
   export DEPLOYER_SEED="your mnemonic"
   export GUARDIAN_ADDRESS="0x..."
   npm run compile:revive && npm run deploy:revive
   ```

**Option 2: GitHub Codespaces** (if available, ~60 GB disk)

- Create a Codespace for this repo, 4-core machine.
- Inside Codespace: clone polkadot-sdk, build, run node. Run deploy in same Codespace.
- Build may hit disk limits; if so, use Option 1.

**Option 3: Teammate with disk space**

- Teammate builds and runs the node locally.
- You SSH tunnel to their machine: `ssh -L 9944:localhost:9944 user@their-ip`
- Deploy from your Mac with `WS_ENDPOINT=ws://127.0.0.1:9944`.

### Run local Revive node (if you have 50+ GB free)

Build from [polkadot-sdk](https://github.com/paritytech/polkadot-sdk) or [OpenGuild substrate-revive-node](https://github.com/openguild-labs/substrate-revive-node) (parachain template, may be smaller):

```bash
# Option A: polkadot-sdk (large)
git clone https://github.com/paritytech/polkadot-sdk.git && cd polkadot-sdk
cargo build -p revive-dev-node --bin revive-dev-node --release
./target/release/revive-dev-node --dev

# Option B: substrate-revive-node (parachain; may use less disk)
# See https://openguild.wtf/blog/polkadot/polkadot-how-to-set-up-pallet-revive-in-substrate-parachain-template
```

Node runs on `ws://127.0.0.1:9944`. Then in another terminal: `npm run deploy:revive`.

### Deploy commands

```bash
cd packages/contracts
npm run compile:revive

# Option A: Create .env.revive from .env.revive.example, fill values, then run
cp .env.revive.example .env.revive
# Edit .env.revive with your DEPLOYER_SEED, GUARDIAN_ADDRESS
npm run deploy:revive

# Option B: Export in shell first
export WS_ENDPOINT="ws://127.0.0.1:9944"
export DEPLOYER_SEED="word1 word2 ... word12"
export GUARDIAN_ADDRESS="0x..."
npm run deploy:revive
```

If pallet not on chain, script exits with status message. When successful, document address in the table above.

## Stablecoin (pUSD) integration

When a stablecoin token is set via `setStablecoin(address)` (guardian only, once, when totalDebt is 0):

- `mint()` mints tokens to the caller
- `repay()` pulls tokens from caller and burns
- `flashRepay()` pulls tokens from guardian and burns

Use `MockERC20` for testing: deploy it, set vault as minter, then `setStablecoin(mockERC20)` on the vault. See `AegisVault.test.ts` for the flow.

## Notes
- Storage Precompile (data-heavy ops): use address `0x0000000000000000000000000000000000000901` per .cursorrules when needed.
