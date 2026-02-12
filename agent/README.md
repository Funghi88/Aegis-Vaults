# Agent — AI Oracle & Guardian

Off-chain logic: APY fetch, vault monitor, RebalanceVault (flashRepay), XCM Builder.

**Required in `.env`:** `AEGIS_VAULT_ADDRESS`, `RPC_URL`. Optional: `GUARDIAN_PRIVATE_KEY`, `SENDER_SEED`.

**XCM execution:** Set `RECIPIENT_SS58`, `SENDER_SEED`, `XCM_EXECUTE=true` to auto-run XCM when yield diff > 2%.

```bash
npm install
npm run start      # Oracle + vault state
npm run oracle     # APY fetch only
npm run monitor    # Yield monitor (log only)
XCM_EXECUTE=true npm run monitor   # Execute XCM when triggered
```
