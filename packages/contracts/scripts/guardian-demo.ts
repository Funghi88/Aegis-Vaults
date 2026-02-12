/**
 * AI Guardian demo: simulate unhealthy position → flashRepay.
 * Run: npx hardhat run scripts/guardian-demo.ts (uses built-in Hardhat network) or
 *      npx hardhat run scripts/guardian-demo.ts --network localhost (run `npx hardhat node` first)
 */
import { ethers } from "hardhat";

const MIN_HEALTH = ethers.parseEther("1.5"); // 150%

async function main() {
  const [guardianSigner, userSigner] = await ethers.getSigners();
  const guardian = await guardianSigner.getAddress();
  const user = await userSigner.getAddress();

  // 1. Deploy vault (AegisVaultDemo has 100% min ratio to allow unhealthy position)
  const AegisVaultDemo = await ethers.getContractFactory("AegisVaultDemo");
  const vault = await AegisVaultDemo.deploy();
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  await vault.initializeGuardian(guardian);

  console.log("Vault:", vaultAddress);
  console.log("Guardian:", guardian, "User:", user);

  // 2. User deposits 100, mints 50 (healthy), then Guardian simulates crash (debt -> 150, health = 100/150 < 1)
  const collateralAmount = ethers.parseEther("100");
  const mintAmount = ethers.parseEther("50");

  await vault.connect(userSigner).deposit({ value: collateralAmount });
  await vault.connect(userSigner).mint(mintAmount);

  // Simulate price crash: Guardian calls demoSetUnhealthy (debt becomes 2x collateral)
  await vault.connect(guardianSigner).demoSetUnhealthy(user);

  const healthBefore = await vault.getHealthFactor(user);
  console.log("\nHealth factor:", healthBefore.toString(), "(< 1.5e18 = unhealthy)");

  if (healthBefore >= MIN_HEALTH) {
    console.log("Position still healthy; mint more to simulate crash.");
    return;
  }

  // 3. Guardian triggers flashRepay (AI Guardian behavior)
  const debtToRepay = await vault.getDebt(user);
  console.log("\n>>> AI Guardian: health below 150%, executing flashRepay...");
  const tx = await vault.connect(guardianSigner).flashRepay(user, debtToRepay);
  await tx.wait();
  console.log("flashRepay tx:", tx.hash);

  const debtAfter = await vault.getDebt(user);
  const healthAfter = await vault.getHealthFactor(user);
  console.log("\nDebt after:", debtAfter.toString(), "(should be 0)");
  console.log("Health after:", healthAfter.toString(), "(debt=0 → healthy)");
  console.log("\n--- AI Guardian demo complete ---");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
