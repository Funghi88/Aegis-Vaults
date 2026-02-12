import { expect } from "chai";
import { ethers } from "hardhat";

describe("AegisVault", function () {
  const MIN_RATIO = ethers.parseEther("1.5");
  let vault: Awaited<ReturnType<typeof deployVault>>;
  let owner: string;
  let guardian: string;
  let user: string;
  let guardianSigner: Awaited<ReturnType<typeof ethers.getSigner>>;
  let userSigner: Awaited<ReturnType<typeof ethers.getSigner>>;

  async function deployVault() {
    const [signer, g, u] = await ethers.getSigners();
    owner = await signer.getAddress();
    guardian = await g.getAddress();
    user = await u.getAddress();
    guardianSigner = g;
    userSigner = u;
    const AegisVault = await ethers.getContractFactory("AegisVault");
    const vault = await AegisVault.deploy();
    await vault.initializeGuardian(guardian);
    return vault;
  }

  beforeEach(async function () {
    vault = await deployVault();
  });

  describe("deployment", function () {
    it("sets guardian", async function () {
      expect(await vault.guardian()).to.equal(guardian);
    });

    it("reverts initializeGuardian when guardian is zero address", async function () {
      const AegisVaultFactory = await ethers.getContractFactory("AegisVault");
      const v = await AegisVaultFactory.deploy();
      await expect(v.initializeGuardian(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        v,
        "ZeroAddress"
      );
    });
  });

  describe("deposit / receive", function () {
    it("deposit increases collateral", async function () {
      const amount = ethers.parseEther("10");
      await vault.connect(userSigner).deposit({ value: amount });
      expect(await vault.getCollateral(user)).to.equal(amount);
      expect(await vault.totalCollateral()).to.equal(amount);
    });

    it("receive() credits direct transfers", async function () {
      const amount = ethers.parseEther("5");
      await userSigner.sendTransaction({ to: await vault.getAddress(), value: amount });
      expect(await vault.getCollateral(user)).to.equal(amount);
    });
  });

  describe("mint", function () {
    it("increases debt when healthy", async function () {
      const collateralAmount = ethers.parseEther("100");
      const mintAmount = ethers.parseEther("50");
      await vault.connect(userSigner).deposit({ value: collateralAmount });
      await vault.connect(userSigner).mint(mintAmount);
      expect(await vault.getDebt(user)).to.equal(mintAmount);
      expect(await vault.getHealthFactor(user)).to.be.gte(MIN_RATIO);
    });

    it("reverts when health would be below 150%", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await expect(vault.connect(userSigner).mint(ethers.parseEther("80"))).to.be.revertedWithCustomError(
        vault,
        "UnhealthyPosition"
      );
    });

    it("reverts mint(0)", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("1") });
      await expect(vault.connect(userSigner).mint(0)).to.be.revertedWithCustomError(vault, "ZeroAmount");
    });
  });

  describe("repay", function () {
    it("decreases debt", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await vault.connect(userSigner).mint(ethers.parseEther("50"));
      await vault.connect(userSigner).repay(ethers.parseEther("20"));
      expect(await vault.getDebt(user)).to.equal(ethers.parseEther("30"));
    });

    it("reverts repay(0)", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await vault.connect(userSigner).mint(ethers.parseEther("50"));
      await expect(vault.connect(userSigner).repay(0)).to.be.revertedWithCustomError(vault, "ZeroAmount");
    });

    it("reverts repay when debt is zero", async function () {
      await expect(vault.connect(userSigner).repay(ethers.parseEther("1"))).to.be.revertedWithCustomError(
        vault,
        "InsufficientDebt"
      );
    });

    it("caps repay to current debt", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await vault.connect(userSigner).mint(ethers.parseEther("50"));
      await vault.connect(userSigner).repay(ethers.parseEther("100"));
      expect(await vault.getDebt(user)).to.equal(0);
    });
  });

  describe("flashRepay", function () {
    it("only guardian can call", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await vault.connect(userSigner).mint(ethers.parseEther("50"));
      await expect(vault.connect(userSigner).flashRepay(user, ethers.parseEther("10"))).to.be.revertedWithCustomError(
        vault,
        "OnlyGuardian"
      );
      await vault.connect(guardianSigner).flashRepay(user, ethers.parseEther("10"));
      expect(await vault.getDebt(user)).to.equal(ethers.parseEther("40"));
    });

    it("reverts flashRepay(user, 0)", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await vault.connect(userSigner).mint(ethers.parseEther("50"));
      await expect(vault.connect(guardianSigner).flashRepay(user, 0)).to.be.revertedWithCustomError(
        vault,
        "ZeroAmount"
      );
    });

    it("reverts flashRepay(zero address, amount)", async function () {
      await expect(
        vault.connect(guardianSigner).flashRepay(ethers.ZeroAddress, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(vault, "ZeroAddress");
    });

    it("reverts flashRepay when user has no debt", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await expect(
        vault.connect(guardianSigner).flashRepay(user, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(vault, "InsufficientDebt");
    });
  });

  describe("withdraw", function () {
    it("sends collateral when healthy", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await vault.connect(userSigner).mint(ethers.parseEther("40"));
      const before = await ethers.provider.getBalance(user);
      const tx = await vault.connect(userSigner).withdraw(ethers.parseEther("20"));
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const after = await ethers.provider.getBalance(user);
      expect(after - before).to.equal(ethers.parseEther("20") - gasUsed);
      expect(await vault.getCollateral(user)).to.equal(ethers.parseEther("80"));
    });

    it("reverts withdraw(0)", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("10") });
      await expect(vault.connect(userSigner).withdraw(0)).to.be.revertedWithCustomError(vault, "ZeroAmount");
    });

    it("reverts withdraw above collateral", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("10") });
      await expect(vault.connect(userSigner).withdraw(ethers.parseEther("11"))).to.be.revertedWithCustomError(
        vault,
        "InsufficientCollateral"
      );
    });

    it("reverts withdraw that would make position unhealthy", async function () {
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await vault.connect(userSigner).mint(ethers.parseEther("50"));
      await expect(vault.connect(userSigner).withdraw(ethers.parseEther("30"))).to.be.revertedWithCustomError(
        vault,
        "UnhealthyPosition"
      );
    });
  });

  describe("setGuardian", function () {
    it("only guardian can set new guardian", async function () {
      const [,,, newG] = await ethers.getSigners();
      const newGuardianAddr = await newG.getAddress();
      await expect(vault.connect(userSigner).setGuardian(newGuardianAddr)).to.be.revertedWithCustomError(
        vault,
        "OnlyGuardian"
      );
      await vault.connect(guardianSigner).setGuardian(newGuardianAddr);
      expect(await vault.guardian()).to.equal(newGuardianAddr);
    });

    it("reverts setGuardian(zero)", async function () {
      await expect(vault.connect(guardianSigner).setGuardian(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        vault,
        "ZeroAddress"
      );
    });

    it("new guardian can flashRepay after rotation", async function () {
      const [,,, newG] = await ethers.getSigners();
      await vault.connect(guardianSigner).setGuardian(await newG.getAddress());
      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await vault.connect(userSigner).mint(ethers.parseEther("50"));
      await vault.connect(newG).flashRepay(user, ethers.parseEther("10"));
      expect(await vault.getDebt(user)).to.equal(ethers.parseEther("40"));
    });
  });

  describe("stablecoin (pUSD)", function () {
    it("mint and repay with token when stablecoin set", async function () {
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      const token = await MockERC20.deploy("pUSD", "pUSD", 18);
      await token.setMinter(await vault.getAddress());

      await vault.connect(guardianSigner).setStablecoin(await token.getAddress());

      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await vault.connect(userSigner).mint(ethers.parseEther("50"));

      expect(await token.balanceOf(user)).to.equal(ethers.parseEther("50"));
      expect(await vault.getDebt(user)).to.equal(ethers.parseEther("50"));

      await token.connect(userSigner).approve(await vault.getAddress(), ethers.parseEther("20"));
      await vault.connect(userSigner).repay(ethers.parseEther("20"));

      expect(await vault.getDebt(user)).to.equal(ethers.parseEther("30"));
      expect(await token.balanceOf(user)).to.equal(ethers.parseEther("30"));
    });

    it("reverts setStablecoin when debt > 0", async function () {
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      const token = await MockERC20.deploy("pUSD", "pUSD", 18);
      await token.setMinter(await vault.getAddress());

      await vault.connect(userSigner).deposit({ value: ethers.parseEther("100") });
      await vault.connect(userSigner).mint(ethers.parseEther("50"));

      await expect(
        vault.connect(guardianSigner).setStablecoin(await token.getAddress())
      ).to.be.revertedWithCustomError(vault, "DebtMustBeZeroToSetStablecoin");
    });

    it("reverts setStablecoin when already set", async function () {
      const MockERC20 = await ethers.getContractFactory("MockERC20");
      const token = await MockERC20.deploy("pUSD", "pUSD", 18);
      await token.setMinter(await vault.getAddress());
      await vault.connect(guardianSigner).setStablecoin(await token.getAddress());

      const token2 = await MockERC20.deploy("pUSD2", "pUSD2", 18);
      await expect(
        vault.connect(guardianSigner).setStablecoin(await token2.getAddress())
      ).to.be.revertedWithCustomError(vault, "StablecoinAlreadySet");
    });
  });

  describe("reentrancy", function () {
    it("withdraw is protected against reentrancy", async function () {
      const [ownerSigner] = await ethers.getSigners();
      const ReentrancyAttacker = await ethers.getContractFactory("ReentrancyAttacker");
      const attacker = await ReentrancyAttacker.deploy(await vault.getAddress());
      const amount = ethers.parseEther("10");
      await attacker.connect(ownerSigner).deposit({ value: amount });
      // Reentrant withdraw reverts with ReentrancyGuard; outer transfer then fails → vault reverts TransferFailed
      await expect(attacker.attackWithdraw(amount)).to.be.revertedWithCustomError(vault, "TransferFailed");
    });
  });
});
