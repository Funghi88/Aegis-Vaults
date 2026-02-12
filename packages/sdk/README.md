# @aegis-vaults/sdk

SDK for building on Aegis Vaults — vault operations, XCM, yield routing.

## Install

```bash
npm install @aegis-vaults/sdk ethers
```

## Usage

### Vault reads

```typescript
import { createVault, getPosition } from "@aegis-vaults/sdk";
import { JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider("https://services.polkadothub-rpc.com/testnet");
const vault = createVault(provider, "0x75dCb05352872D1d5359C9E9121Ebee26Fff232f" );

const position = await getPosition(vault, "0x...");
console.log(position); // { collateral, debt, healthFactor }
```

### Vault writes (deposit, mint, repay, withdraw)

Use the vault contract with a signer:

```typescript
import { createVault } from "@aegis-vaults/sdk";
import { BrowserProvider, parseEther } from "ethers";

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const vault = createVault(signer, VAULT_ADDRESS);

await vault.deposit({ value: parseEther("100") });
await vault.mint(parseEther("50"));
await vault.repay(parseEther("25"));
await vault.withdraw(parseEther("50"));
```

### Guardian: flashRepay

```typescript
await vault.flashRepay(userAddress, parseEther(amount));
```

## Integration

- **Polkadot Agent Kit:** Use with `polkadot-agent-kit` for off-chain bots and automations.
- **Frontend:** See `packages/frontend` for React hooks and components.
- **XCM:** Use `packages/xcm-scripts` for cross-chain transfers.

## API

| Export | Description |
|--------|-------------|
| `VAULT_ABI` | AegisVault contract ABI |
| `CHAIN_IDS` | Chain IDs (Polkadot Hub TestNet) |
| `createVault(providerOrSigner, address)` | Create vault contract instance |
| `getPosition(vault, userAddress)` | Read collateral, debt, health factor |
