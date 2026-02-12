# Chopsticks — Local XCM testing

Fork Asset Hub (and optionally relay + parachains) locally for testing. **Recommended:** run only Asset Hub to avoid relay executor/runtime mismatches.

## Prerequisites

- Node.js 18+

## Run (recommended: Asset Hub only)

```bash
npm install
npm run xcm:asset-hub-only
```

This forks **Polkadot Asset Hub** and listens on **port 8000**. Use **Polkadot.js Apps** → Development → Custom endpoint → `ws://localhost:8000` to interact.

**If you see `UnresolvedFunctionImport` / `ext_storage_proof_size_storage_proof_size_version_1`:** The Asset Hub config is set to fork at **block 6000000** (older runtime). If it still panics, try a lower block in `configs/polkadot-asset-hub.yml` (e.g. `block: 5000000`) or **skip Chopsticks** and use **Paseo testnet** for development: connect your app to `wss://polkadot-asset-hub-paseo-rpc.dwellir.com` (or another Paseo Asset Hub RPC) instead of a local fork.

## Full XCM (relay + parachains) — often broken

```bash
npm run xcm
```

Forks Polkadot (relay) + Asset Hub, Moonbeam, HydraDX and mocks HRMP. **This often panics** when forking the relay: the Polkadot runtime WASM uses host functions (e.g. `ext_storage_proof_size_storage_proof_size_version_1`) that the current Chopsticks executor doesn’t provide. If you see `UnresolvedFunctionImport` or `VirtualMachine(...)`, use **`npm run xcm:asset-hub-only`** for local work and run full XCM on testnet (e.g. Paseo) instead.

## Optional env (fork at specific block)

- `POLKADOT_BLOCK_NUMBER`
- `POLKADOT_ASSET_HUB_BLOCK_NUMBER`
- `HYDRADX_BLOCK_NUMBER`
- `MOONBEAM_BLOCK_NUMBER` (for moonbeam.yml)

Leave unset to use latest.

## 1.4 — Manual XCM USDC transfer

After the fork is running (Asset Hub on port 8000), run the ReserveTransferAssets script from **repo root** (so `packages/xcm-scripts` exists):

```bash
# From repo root (the folder that contains packages/ and chopsticks/)
cd packages/xcm-scripts
npm install
export SENDER_SEED="your mnemonic or seed"
export RECIPIENT_SS58="5EWkRqk3q5gGQkctCNmXCtAZxR3wnV9BzdQQSs8VhrE1z2vN"
export DEST_PARA_ID=2004
export AMOUNT=1000000
npm run xcm-transfer
```

Optional env: `WS_ENDPOINT` (default `ws://127.0.0.1:8000`), `ASSET_ID` (default 1984 = USDC). The script calls `polkadotXcm.limitedReserveTransferAssets` on Asset Hub to send USDC to the given parachain (e.g. 2004 Moonbeam, 2034 HydraDX).

---

## Next steps (with the fork running)

1. **Inspect the fork:** Open [Polkadot.js Apps](https://polkadot.js.org/apps), click the network icon → **Development** → **Custom endpoint** → `ws://127.0.0.1:8000` → **Switch**. You’ll see the forked Asset Hub state (blocks, accounts, assets).
2. **Optional — XCM transfer script:** In another terminal, go to **repo root** (`aegis-vaults/`), then `cd packages/xcm-scripts`, `npm i`, set `SENDER_SEED`, `RECIPIENT_SS58`, `DEST_PARA_ID`, `AMOUNT`, and run `npm run xcm-transfer`. The fork has mainnet state, so the sender account must have balance on real Asset Hub (or use Chopsticks `dev_setStorage` to fund a test account).
3. **Phase 1 done.** Move to **Days 3–4 (The Brain):** AI Oracle (APY fetch), “if APY diff > 2% trigger XCM”, AI Guardian (health + `flashRepay`), XCM Builder. See [ROADMAP.md](../ROADMAP.md) §5.
4. **Deploy vault on testnet:** From `packages/contracts`, set `PRIVATE_KEY` and `GUARDIAN_ADDRESS`, then `npm run deploy:testnet`. Record addresses in `docs/contracts.md`.
