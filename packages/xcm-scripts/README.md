# XCM transfer script

Manual `ReserveTransferAssets` from Asset Hub (e.g. Chopsticks `ws://127.0.0.1:8000` or testnet).

## Where to set the recipient (and other env)

**In the terminal**, in the same session where you run the script — not in a file.

```bash
cd packages/xcm-scripts

# Required: sender mnemonic and recipient address (must be 32-byte Polkadot SS58, not 20-byte EVM)
export RECIPIENT_SS58="5EWkRqk3q5gGQkctCNmXCtAZxR3wnV9BzdQQSs8VhrE1z2vN"

# Destination: 0 = relay (often fails on Paseo); 2034 = Hydration, 4001 = Pop Network (parachains may work)
export DEST_PARA_ID=2034
# On Paseo testnet: use native (PAS) — USDC may not exist. Default: ASSET_ID=native, AMOUNT=100000000 (0.01 PAS)
export ASSET_ID=native
export AMOUNT=100000000
npm run xcm-transfer
```

### Using Paseo Asset Hub (after faucet)

If you have PAS on **Paseo Asset Hub** (from the faucet), run against testnet so the sender can pay fees:

> **Public RPCs timing out?** Use [Pop Onboarding](https://onpop.io/network/onboard) to bridge PAS in the browser instead.

```bash
cd packages/xcm-scripts

# Script auto-adds fallbacks when WS_ENDPOINT is set. IBP often more reliable than polkadot.io.
export WS_ENDPOINT="wss://sys.ibp.network/asset-hub-paseo"
# Or explicit list: export WS_ENDPOINTS="wss://sys.ibp.network/asset-hub-paseo,wss://asset-hub-paseo-rpc.polkadot.io"

export RECIPIENT_SS58="5EWkRqk3q5gGQkctCNmXCtAZxR3wnV9BzdQQSs8VhrE1z2vN"

npm run xcm-transfer
```

The script will **prompt you for `SENDER_SEED`** (hidden input) if you don’t set it as an env var.

**Mnemonic format:** Exactly 12 or 24 words from the BIP39 English wordlist, space-separated (no commas or newlines). Paste once when prompted; input is hidden.

Use the same `SENDER_SEED` as the account you funded on Paseo. No need to run Chopsticks.

**If connection fails (timeout, 1006 Abnormal Closure)** — public Paseo RPCs can be unstable or blocked by your network/firewall. **Workarounds:**

1. **[Pop Onboarding](https://onpop.io/network/onboard)** — Bridge PAS manually in the browser. No CLI needed.
2. **Chopsticks** (local testing): `cd chopsticks && npm run xcm:asset-hub-only`, then `WS_ENDPOINT=ws://127.0.0.1:8000` (fund sender via dev_setStorage). Note: Chopsticks forks mainnet (DOT), not Paseo (PAS).
3. **Different network** — Try mobile hotspot; some networks block WebSocket to these RPCs.

**If relay transfers fail (Filtered / LocalExecutionIncompleteWithError)** — XCM reached the destination but execution failed (often HRMP/channel config). Try in order: (1) `XCM_METHOD=reserve`, (2) `DEST_PARA_ID=4001` (Pop, Paseo), (3) [Pop Onboarding UI](https://onpop.io/network/onboard). Hydration (2034) is mainnet only.

**If you get "1002 Verification Error" / "unreachable"** — set `DEST_PARA_ID` to a chain that exists on your network (e.g. 2034 Hydration, 4001 Pop on Paseo; 2004 Moonbeam on mainnet). Check [Paseo Subscan](https://paseo.subscan.io/) for Paseo parachains.

Or one line:

```bash
SENDER_SEED="..." RECIPIENT_SS58="5EWkRqk3q5gGQkctCNmXCtAZxR3wnV9BzdQQSs8VhrE1z2vN" npm run xcm-transfer
```

Get a **32-byte** SS58 address from [Polkadot.js Apps](https://polkadot.js.org/apps) (Accounts, Polkadot relay or Asset Hub) or a Substrate wallet. Do **not** use an EVM-style address (20-byte); that will fail with "Invalid decoded address length".

## Check your balance (Asset Hub Paseo)

To see if your sender has PAS on the chain this script uses:

- **[Polkadot.js Apps](https://polkadot.js.org/apps)** → switch to a Paseo Asset Hub endpoint (e.g. **Settings** → **Endpoint** → add `wss://sys.ibp.network/asset-hub-paseo` or pick "Asset Hub Paseo") → **Accounts**. Your address and balance appear there.
- **[Asset Hub Paseo Subscan](https://assethub-paseo.subscan.io)** → search your sender address to see balance and transfers.

If balance is 0: at the [Polkadot Faucet](https://faucet.polkadot.io) you must set **Chain** to **AssetHub** (not "Paseo Relay" or "Passet Hub"). This script sends from Asset Hub; PAS on another chain does not count.

## Parachain destination (DEST_PARA_ID)

Relay transfers (`DEST_PARA_ID=0`) often fail on Paseo testnet. Use a parachain instead:

| DEST_PARA_ID | Chain | Network |
|--------------|-------|---------|
| 4001 | Pop Network | Paseo (may sunset; use [onboard](https://onpop.io/network/onboard) as fallback) |
| 2034 | Hydration | Mainnet only |
| 0 | Relay | Often fails on Paseo |

## XCM version (Chopsticks vs Paseo)

Chopsticks forks block 6M which uses **V3**; Paseo uses **V4**. The script auto-detects: `ws://127.0.0.1:8000` → V3, else V4. Override: `XCM_VERSION=V3` or `XCM_VERSION=V4`.

## XCM method (XCM_METHOD)

For native PAS: `teleport` (default) or `reserve`. If one fails with `LocalExecutionIncompleteWithError`, try the other:

```bash
XCM_METHOD=reserve npm run xcm-transfer
```

## If XCM still fails

Paseo testnet XCM can fail with `LocalExecutionIncompleteWithError` (HRMP channels, destination config). The script parses this and prints specific guidance. **Fallback:** use the [Pop Onboarding UI](https://onpop.io/network/onboard) to bridge PAS from Asset Hub to Pop. The script detects execution failure and exits 1 instead of falsely reporting success.

## Error: 1010 "Inability to pay some fees" / balance too low

Your **sender account does not have enough PAS** (on Paseo Asset Hub) to pay transaction fees. The XCM payload is valid; the chain is rejecting the tx due to low balance.

**Fix on Paseo:** Get PAS from the [Polkadot Faucet](https://faucet.polkadot.io): choose **Paseo** (or Asset Hub Paseo), paste your sender’s address (the one from your mnemonic), request PAS, then run the script again.

On a **Chopsticks fork** (e.g. `ws://127.0.0.1:8000`), the sender often has **no balance** at the forked block. You need to fund the sender on the fork:

1. Open [Polkadot.js Apps](https://polkadot.js.org/apps) and connect to **Custom** → `ws://127.0.0.1:8000`.
2. Go to **Developer** → **RPC calls** (or **JavaScript**).
3. Call `dev_setStorage` with the storage key/value for your sender’s balance, e.g. under `System.Account`. (Chopsticks docs describe the exact structure.)
4. Or run the script against **testnet** (set `WS_ENDPOINT` to a Paseo Asset Hub WSS; see "Using Paseo Asset Hub" above) so no fork funding is needed.
