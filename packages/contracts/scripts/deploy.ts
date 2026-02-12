import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  if (!signers.length) {
    console.error(
      "No deployer account. Set PRIVATE_KEY in .env:\n" +
        "  export PRIVATE_KEY=0x...\n" +
        "Or for local test: npx hardhat run scripts/deploy.ts --network localhost\n" +
        "(after running: npx hardhat node)"
    );
    process.exit(1);
  }

  const deployer = signers[0];
  const guardian = process.env.GUARDIAN_ADDRESS;
  if (!guardian) {
    console.warn("GUARDIAN_ADDRESS not set; using deployer as guardian:", await deployer.getAddress());
  }
  const guardianAddress = guardian || (await deployer.getAddress());

  const AegisVault = await ethers.getContractFactory("AegisVault");
  const vault = await AegisVault.deploy();
  await vault.waitForDeployment();
  const address = await vault.getAddress();

  const tx = await vault.initializeGuardian(guardianAddress);
  await tx.wait();

  console.log("AegisVault deployed to:", address);
  console.log("Guardian:", guardianAddress);
  console.log("---");
  console.log("Add to frontend .env: VITE_VAULT_ADDRESS=" + address);
  console.log("Document in docs/contracts.md.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
