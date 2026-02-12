# Security — Aegis Vaults

How we protect user funds and what you should know.

## How Your Money Is Protected

### 1. Non-Custodial Architecture

**Your keys, your crypto.** The app never holds or has access to your funds.

- **Vault (EVM):** You connect MetaMask. Every deposit, mint, repay, withdraw is signed by you. Funds stay in the smart contract; only you can withdraw your collateral.
- **XCM:** You connect a Polkadot extension (Talisman, Polkadot.js). You sign each transaction. No keys are stored on our site.

### 2. Smart Contract Safeguards

| Protection | What It Does |
|------------|--------------|
| **Reentrancy guard** | Prevents withdraw-from-receive attacks. |
| **Health factor (150%)** | Mint/withdraw blocked if collateral/debt would fall below 150%. |
| **User-only withdrawals** | Users can only withdraw their own collateral. |
| **Guardian-only flashRepay** | Only the designated guardian can repay for others (e.g. to avoid liquidation). |
| **No arbitrary transfers** | No function lets anyone move funds from a user’s position. |

### 3. No Private Keys in the App

- No private keys stored in the frontend.
- `PRIVATE_KEY` is only used in deploy scripts; it is never committed or used in the app.
- Users sign transactions via MetaMask or Polkadot extensions.

### 4. Guardian Trust Model

The **guardian** can:

- Call `flashRepay(user, amount)` — repay debt for at-risk positions (good).
- Call `setGuardian(newGuardian)` — rotate the guardian.
- Call `setStablecoin(address)` — set once when totalDebt is 0.

The guardian cannot withdraw user collateral or mint arbitrary debt. Document the guardian address in [docs/contracts.md](contracts.md).

---

## What Can Go Wrong?

| Risk | Mitigation |
|------|------------|
| **Malicious site** | Use the official URL only. Check the contract address matches [docs/contracts.md](contracts.md). |
| **Phishing** | Verify the domain before connecting. |
| **Compromised guardian** | Guardian could call `setGuardian` to hand over control. Use a multisig or trusted key. |
| **Contract bug** | Contract is not audited. Use at your own risk; testnet is lower risk. |
| **Frontend/DNS hijack** | Use HTTPS; avoid public WiFi when transacting. |

---

## Recommendations for Production

1. **Contract audit** — Have a professional audit before mainnet.
2. **Bug bounty** — Consider a program for responsible disclosure.
3. **Security headers** — Use CSP, X-Frame-Options, etc. (see [DEPLOY.md](DEPLOY.md)).
4. **Multisig guardian** — Use a multisig for the guardian role.
5. **Contract upgrade** — Consider a proxy pattern for upgradeability if needed.

---

## Reporting

Report vulnerabilities responsibly: open an issue or contact the maintainers. Do not disclose publicly before a fix is available.
