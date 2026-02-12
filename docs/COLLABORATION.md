# How We Handle This Together

## Strategic split

| You own | Cursor / AI owns |
|--------|-------------------|
| Product narrative, pitch, "Self-driving money," Before/After (PolkaSynth) story | Solidity, tests, Hardhat, Agent Kit + LangChain, Polkadot.js/XCM |
| pUSD/Hollar/DAP/Treasury context and slides | .cursorrules, README, PROBLEM-STATEMENT, technical docs |
| Collateral ratio, APY_Diff threshold (e.g. 2%), guardian key policy | Vault, flashRepay, APY fetcher, XCM Builder (ReserveTransferAssets), rebalance tool |
| Demo video (Before vs After), submission form, deadlines | Rapid XCM config (MultiLocation), frontend scaffolding, smart routing logic |

## Working rhythm

1. **Phase-based:** Start with "Phase 1, Day 1" and do tasks in order; use ROADMAP checkpoints.
2. **Small steps:** One function or one script per request; run tests after each change.
3. **Checkpoints:** Before moving on, confirm the checkpoint (e.g. "deposit on Paseo works") in chat.
4. **Blockers:** If tooling (resolc, Agent Kit) differs from the report, we adjust the plan together.

## Good prompts to use

- "Start Days 1–2: set up Hardhat for Paseo, Chopsticks + HRMP, and script a manual XCM USDC transfer; then minimal AegisVault (deposit → mint → repay + flashRepay)."
- "Generate the MultiLocation / ReserveTransferAssets struct for moving USDC from Asset Hub to Moonbeam."
- "Days 3–4: build the APY fetcher for HydraDX, Moonbeam, Astar; add logic 'If APY_Diff > 2% trigger XCM'; wire RebalanceVault tool for AI Guardian."
- "Add the flashRepay function with onlyGuardian modifier."
- "Days 5–6: React one-click UI and dashboard (Your Balance, Current Yield, Optimized Yield); hide XCM complexity."
- "Simulate a price drop and show the agent triggering rebalance; document the 2-second advantage."

## When to decide (you)

- Which testnet (Paseo vs Westend).
- Final collateral ratio and liquidation threshold.
- Whether to use mock stablecoin or wait for pUSD on testnet.
- How to store/use the guardian key (env var, KMS, etc.) for demo vs production.

You’re the product and ecosystem lead; Cursor is the implementation partner. Use ROADMAP.md as the single source of truth for the 7-day sprint.
