import { ethers } from "hardhat";

/**
 * Deploy AegisVault + pUSD stablecoin. Call setStablecoin immediately (requires totalDebt=0).
 * Use this for a fresh deployment with pUSD.
 */
async function main() {
  const signers = await ethers.getSigners();
  if (!signers.length) {
    console.error(
      "No deployer account. Set PRIVATE_KEY in .env:\n" +
        "  export PRIVATE_KEY=0x...\n" +
        "Or for local: npx hardhat run scripts/deploy-with-pusd.ts --network localhost"
    );
    process.exit(1);
  }

  const deployer = signers[0];
  const guardian = process.env.GUARDIAN_ADDRESS;
  const guardianAddress = guardian || (await deployer.getAddress());

  if (!guardian) {
    console.warn("GUARDIAN_ADDRESS not set; using deployer as guardian:", guardianAddress);
  }

  // 1. Deploy vault
  const AegisVault = await ethers.getContractFactory("AegisVault");
  const vault = await AegisVault.deploy();
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  await vault.initializeGuardian(guardianAddress);

  // 2. Deploy pUSD token
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const token = await MockERC20.deploy("pUSD", "pUSD", 18);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();

  // 3. Set vault as minter
  await token.setMinter(vaultAddress);

  // 4. Set stablecoin on vault (must be done when totalDebt=0). Guardian must call.
  const deployerAddr = await deployer.getAddress();
  const isDeployerGuardian = deployerAddr.toLowerCase() === guardianAddress.toLowerCase();
  if (isDeployerGuardian) {
    await vault.connect(deployer).setStablecoin(tokenAddress);
    console.log("Stablecoin set on vault.");
  } else {
    console.warn("Guardian differs from deployer. Guardian must call vault.setStablecoin(" + tokenAddress + ") when totalDebt=0.");
  }

  console.log("AegisVault deployed to:", vaultAddress);
  console.log("pUSD (MockERC20) deployed to:", tokenAddress);
  console.log("Guardian:", guardianAddress);
  console.log("---");
  console.log("Add to frontend .env:");
  console.log("  VITE_VAULT_ADDRESS=" + vaultAddress);
  console.log("  VITE_PUSD_ADDRESS=" + tokenAddress);
  console.log("Document in docs/contracts.md.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
