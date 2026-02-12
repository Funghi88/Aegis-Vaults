# Roadmap Alignment — Aegis Vaults vs pUSD Vision

**Primary goal:** Build a stablecoin protocol on Polkadot 2.0 (Asset Hub, Revive).

**Reference:** [ROADMAP.md](../ROADMAP.md), [PROBLEM-STATEMENT.md](PROBLEM-STATEMENT.md), Polkadot Native Stablecoin Synthesis infographic (pUSD vision)

---

## 1. Where We Are Now (Current State)

### 1.1 Core Contracts

| Contract | Functions | Status |
|----------|-----------|--------|
| **AegisVault.sol** | deposit, withdraw, mint, repay, flashRepay | ✅ Built |
| **AegisVaultDemo.sol** | deposit, mint, flashRepay (no repay, no withdraw) | ✅ Built |

### 1.2 Frontend UI (Live)

| Page | Features | Status |
|------|----------|--------|
| **Home** | Hero, Top Yield Destinations (APY cards) | ✅ |
| **Dashboard** | Your Balance, Optimized Yield, Current Yield | ✅ |
| **Vault** | Deposit, Mint, Repay, Guardian flashRepay | ✅ |
| **Earn Max Yield** | Best destination, One-Click XCM link, Route link, Yield diff | ✅ |
| **XCM Builder** | Destination, Amount, Recipient, Copy CLI | ✅ |
| **Features** | AI Oracle, One-Click Route, AI Guardian | ✅ |
| **Bridge** | Pop Onboarding link | ✅ |

### 1.3 Layout & UX (Recent)

| Item | Status |
|------|--------|
| Sticky footer (touches bottom of viewport) | ✅ |
| Responsive layout (adapts to screen size) | ✅ |
| Consistent top padding (8rem) across pages | ✅ |
| Content-frame vertical borders | ✅ |
| Full-bleed horizontal borders (connect to verticals) | ✅ |

### 1.4 Backend / Agent

| Component | Status |
|-----------|--------|
| AI Oracle (APY fetch) | ✅ `agent/oracle.js`, `useYields` |
| XCM scripts | ✅ `xcm-scripts/xcm-usdc-transfer.js` |
| guardian-demo (flashRepay) | ✅ `packages/contracts/scripts/guardian-demo.ts` |
| Chopsticks configs | ✅ Asset Hub, Moonbeam, HydraDX |

---

## 2. Vault Functions — UI vs Backend

| Function | AegisVault | AegisVaultDemo | In UI? |
|----------|------------|----------------|--------|
| **deposit** | ✅ | ✅ | ✅ VaultFlow |
| **withdraw** | ✅ | ❌ | ✅ VaultFlow (when `VITE_VAULT_TYPE=full`) |
| **mint** | ✅ | ✅ | ✅ VaultFlow |
| **repay** | ✅ | ❌ | ✅ VaultFlow (when `VITE_VAULT_TYPE=full`) |
| **flashRepay** | ✅ | ✅ | ✅ Guardian panel |

**Note:** Set `VITE_VAULT_TYPE=full` for AegisVault (repay, withdraw); `demo` for AegisVaultDemo (repay hidden, "Repay not available" message).

---

## 3. User-Facing Features

### 3.1 Implemented ✅

| # | Feature | Status |
|---|---------|--------|
| 1 | **Withdraw** | ✅ VaultFlow; shown when `VITE_VAULT_TYPE=full` |
| 2 | **Contract detection** | ✅ Config-based: `VITE_VAULT_TYPE=full\|demo` |
| 3 | **XCM execution from frontend** | ✅ XCMBuilder: Connect Polkadot → Execute XCM (sign & submit) |
| 4 | **Network status** | ✅ Header shows chain name; "Switch" when wrong network |
| 5 | **Repay UX for Demo** | ✅ Repay hidden; "Repay not available (Demo vault)" shown |
| 6 | **Transaction feedback** | ✅ Toast notifications for success/error |
| 7 | **Balance refresh** | ✅ `VaultRefreshContext`; Dashboard + Vault auto-refresh after tx |

### 3.2 Future (Phase 3)

| # | Feature | Description |
|---|---------|-------------|
| 8 | **vDOT / DAP integration** | Deep integration per pUSD vision. |
| 9 | **Multi-vault** | Support multiple vault deployments (Asset Hub, Paseo). |
| 10 | **Polkadot.js wallet** | Primary SS58 connect (currently MetaMask first, Polkadot fallback). |

**Why these aren’t on the site yet**

| Feature | Main blockers |
|---------|----------------|
| **vDOT / DAP** | **Infrastructure & ecosystem** — vDOT and DAP are Polkadot-native primitives. Integration depends on runtime support, SDKs, and stable APIs on Asset Hub. Some pieces may still be in development or only on mainnet. |
| **Multi-vault** | **Product scope** — Needs multiple vault deployments and config per network. Technically feasible; we’re prioritizing one vault path first. |
| **Polkadot.js wallet** | **Architecture** — Vault is EVM (Revive/PVM), so MetaMask is the natural fit for deposit/mint. Polkadot.js is used for XCM, but SS58→EVM mapping for vault flows would need extra logic. Making Polkadot.js primary is a UX choice we can add later. |

---

## 4. pUSD Phase Alignment

| Phase | pUSD Vision | Our Status | Next Step |
|-------|-------------|------------|-----------|
| **Phase 1: Core Logic** | Vault on Revive | ✅ deposit, mint, repay, withdraw in UI | — |
| **Phase 2: XCM** | Teleportation to parachains | ✅ CLI + in-browser Execute XCM | — |
| **Phase 3: Deep Integration** | vDOT, DAP | Future | Features #8–10 below |

---

## 5. Primary Users & Product Story

### 5.1 Who Are Our Primary Users?

| Segment | Who They Are | What They Need |
|---------|--------------|----------------|
| **Yield-seeking DeFi users** | Holders of DOT, USDC, or stablecoins on Polkadot. Want yield without doing manual bridging. | One-click routing to best APY; no gas-token juggling. |
| **Stablecoin minters** | Users who want to borrow against DOT collateral (e.g. mint pUSD). | Simple deposit → mint flow; health monitoring; AI Guardian safety. |
| **Liquidity providers / protocols** | Protocols or DAOs with idle TVL on Asset Hub. | Automated yield optimization; XCM execution without infra. |
| **Ecosystem builders** | Projects integrating yield or vaults into their UIs. | Reliable vault + oracle + XCM tooling; configurable guardians. |

### 5.2 Who Needs Our Services?

- **Users with fragmented TVL** — ~$450M+ TVL across Polkadot is underutilized or stuck in suboptimal yield. We activate it.
- **Users tired of manual bridging** — ~12 clicks to earn yield manually. We reduce that to one click.
- **Users who want “set and forget”** — AI Guardian monitors health and rebalances; flashRepay protects at-risk positions.
- **Users who need native Polkadot UX** — SS58 (Polkadot.js) + EVM (MetaMask); PVM-native contracts on Revive.

### 5.3 How to Tell the Product Story

**Headline:** *"Self-driving money on Polkadot"*

**Before → After:**
- **Before:** Manual bridging, gas tokens, multiple chains, yield hunting, ~12 clicks.
- **After:** Deposit once → AI routes to best yield; AI Guardian protects positions; one click.

**Three pillars:**
1. **Intent-based** — User says “earn max yield.” AI Oracle finds best APY; XCM Builder routes the asset.
2. **Self-managing** — Vault + AI Guardian: flashRepay when health drops; Async Backing (6s blocks) for fast rebalancing.
3. **Liquidity abstraction** — Hide gas, wrapping, and chain complexity. One interface for DOT and USDC.

**Pitch angle:** “Before vs After” demo + target **TVL activation** (~75–80% activated yield).

**Technical proof points:** PVM-native; resolc/revive; no SELFDESTRUCT; 6s blocks; DefiLlama APY; XCM teleport.

---

## 6. Config Reference

| Env Var | Description |
|---------|-------------|
| `VITE_VAULT_TYPE` | `full` = AegisVault (repay, withdraw); `demo` = AegisVaultDemo |
| `VITE_VAULT_ADDRESS` | Deployed vault contract address |
| `VITE_WS_ENDPOINT` | WebSocket for XCM (e.g. `wss://paseo-asset-hub-rpc.polkadot.io`) |

---

**Bottom line:** deposit, mint, repay, withdraw, and balance fetch are in the UI. Contract type is config-based. flashRepay form appears when connected wallet is guardian. XCM Builder: CLI copy + in-browser Execute XCM (Polkadot extension). Network status and one-click switch in header. Toasts for tx feedback. Auto-refresh after transactions.
