# Aegis Vaults — Contracts

Solidity vault for Asset Hub (Paseo/Polkadot Hub). Hardhat + solc 0.8.28; resolc/revive-compatible.

**Security:** Reentrancy guard on withdraw, zero-address/zero-amount checks, guardian-only `flashRepay` and `setGuardian`, and checks-effects-interactions for ETH transfer.

## Commands

- `npm run compile` — compile contracts
- `npm test` — run tests

## Deploy to testnet

Set `PRIVATE_KEY` and optionally `GUARDIAN_ADDRESS` (defaults to deployer), then:

```bash
npx hardhat run scripts/deploy.ts --network polkadotTestnet
```

Document the printed addresses in `docs/contracts.md`.

## Contract

**AegisVault** — Over-collateralized vault: deposit DOT (native), mint/repay debt (stablecoin), 150% min collateral ratio. Guardian-only `flashRepay(user, amount)` for rebalance/liquidation protection.
