import { useState } from "react";
import { Contract, BrowserProvider, parseEther } from "ethers";
import { useWallet } from "../hooks/useWallet";
import { useVault } from "../hooks/useVault";
import { useToast } from "../context/ToastContext";
import { useVaultRefresh } from "../context/VaultRefreshContext";
import { VAULT_ADDRESS, RPC_URL, CHAIN_ID, NATIVE_TOKEN, VAULT_HAS_REPAY, VAULT_HAS_WITHDRAW } from "../config";

const ABI = [
  "function deposit() payable",
  "function withdraw(uint256 amount)",
  "function mint(uint256 amount)",
  "function repay(uint256 amount)",
  "function flashRepay(address user, uint256 amount)",
];

function formatWei(wei) {
  if (!wei || wei === "0") return "0";
  const n = Number(wei) / 1e18;
  return n >= 1000 ? n.toFixed(0) : n >= 1 ? n.toFixed(2) : n.toFixed(4);
}

async function ensureChain() {
  if (!window.ethereum) return false;
  try {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    if (Number(chainId) === CHAIN_ID) return true;
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
    });
    return true;
  } catch {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${CHAIN_ID.toString(16)}`,
          chainName: "Hardhat Local",
          rpcUrls: [RPC_URL],
        }],
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

export function VaultFlow() {
  const { address, connect } = useWallet();
  const { collateral, debt, healthPercent, loading, refetch, guardian } = useVault(address);
  const { success, error: toastError } = useToast();
  const { triggerRefresh } = useVaultRefresh();
  const [depositAmount, setDepositAmount] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [flashRepayUser, setFlashRepayUser] = useState("");
  const [flashRepayAmount, setFlashRepayAmount] = useState("");
  const [depositPending, setDepositPending] = useState(false);
  const [mintPending, setMintPending] = useState(false);
  const [repayPending, setRepayPending] = useState(false);
  const [withdrawPending, setWithdrawPending] = useState(false);
  const [flashRepayPending, setFlashRepayPending] = useState(false);
  const [txError, setTxError] = useState(null);

  const isGuardian = guardian && address && address.toLowerCase().startsWith("0x") && address.toLowerCase() === guardian;

  const isEvm = address?.startsWith("0x");
  const canTransact = isEvm && window.ethereum;

  // Live preview when typing in inputs
  const collNum = Number(collateral || 0) / 1e18;
  const debtNum = Number(debt || 0) / 1e18;
  const depositNum = parseFloat(depositAmount) || 0;
  const mintNum = parseFloat(mintAmount) || 0;
  const repayNum = parseFloat(repayAmount) || 0;
  const withdrawNum = parseFloat(withdrawAmount) || 0;
  const previewCollateral = collNum + depositNum - withdrawNum;
  const previewDebt = Math.max(0, debtNum + mintNum - repayNum);
  const previewHealthRaw = previewDebt > 0 ? (previewCollateral / previewDebt) * 100 : null;
  const previewHealth = previewHealthRaw != null ? Math.min(9999, previewHealthRaw) : null;
  const hasPreview = (depositNum > 0 || mintNum > 0 || repayNum > 0 || withdrawNum > 0) && !depositPending && !mintPending && !repayPending && !withdrawPending;

  const handleDeposit = async () => {
    if (!canTransact || !depositAmount) return;
    setTxError(null);
    setDepositPending(true);
    try {
      if (!(await ensureChain())) {
        throw new Error("Please add Hardhat Local network in MetaMask (Chain ID " + CHAIN_ID + ")");
      }
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vault = new Contract(VAULT_ADDRESS, ABI, signer);
      const tx = await vault.deposit({ value: parseEther(depositAmount) });
      await tx.wait();
      setDepositAmount("");
      refetch();
      triggerRefresh();
      // RPC may delay indexing; refetch again after a short wait
      setTimeout(() => {
        refetch();
        triggerRefresh();
      }, 3000);
      success("Deposit successful");
    } catch (e) {
      console.error(e);
      setTxError(e.message || "Deposit failed");
      toastError(e.message || "Deposit failed");
    } finally {
      setDepositPending(false);
    }
  };

  const handleMint = async () => {
    if (!canTransact || !mintAmount) return;
    setTxError(null);
    setMintPending(true);
    try {
      if (!(await ensureChain())) {
        throw new Error("Please add Hardhat Local network in MetaMask (Chain ID " + CHAIN_ID + ")");
      }
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vault = new Contract(VAULT_ADDRESS, ABI, signer);
      const tx = await vault.mint(parseEther(mintAmount));
      await tx.wait();
      setMintAmount("");
      refetch();
      triggerRefresh();
      setTimeout(() => {
        refetch();
        triggerRefresh();
      }, 3000);
      success("Mint successful");
    } catch (e) {
      console.error(e);
      setTxError(e.message || "Mint failed");
      toastError(e.message || "Mint failed");
    } finally {
      setMintPending(false);
    }
  };

  const handleRepay = async () => {
    if (!canTransact || !repayAmount || !VAULT_HAS_REPAY) return;
    setTxError(null);
    setRepayPending(true);
    try {
      if (!(await ensureChain())) {
        throw new Error("Please add Hardhat Local network in MetaMask (Chain ID " + CHAIN_ID + ")");
      }
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vault = new Contract(VAULT_ADDRESS, ABI, signer);
      const tx = await vault.repay(parseEther(repayAmount));
      await tx.wait();
      setRepayAmount("");
      refetch();
      triggerRefresh();
      setTimeout(() => { refetch(); triggerRefresh(); }, 3000);
      success("Repay successful");
    } catch (e) {
      console.error(e);
      setTxError(e.message || "Repay failed");
      toastError(e.message || "Repay failed");
    } finally {
      setRepayPending(false);
    }
  };

  // Max withdraw: must keep health >= 150% (collateral/debt >= 1.5). If no debt, withdraw all.
  const minRatio = 1.5;
  const maxWithdraw = debtNum > 0
    ? Math.max(0, collNum - debtNum * minRatio)
    : collNum;

  const handleWithdraw = async () => {
    if (!canTransact || !withdrawAmount || !VAULT_HAS_WITHDRAW) return;
    const amt = parseFloat(withdrawAmount) || 0;
    if (amt > maxWithdraw) {
      setTxError(`Max withdraw: ${maxWithdraw.toFixed(2)} ${NATIVE_TOKEN}. Repay debt first or withdraw less to keep health ≥ 150%.`);
      toastError(`Max withdraw: ${maxWithdraw.toFixed(2)} ${NATIVE_TOKEN}`);
      return;
    }
    setTxError(null);
    setWithdrawPending(true);
    try {
      if (!(await ensureChain())) {
        throw new Error("Please add Hardhat Local network in MetaMask (Chain ID " + CHAIN_ID + ")");
      }
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vault = new Contract(VAULT_ADDRESS, ABI, signer);
      const tx = await vault.withdraw(parseEther(withdrawAmount));
      await tx.wait();
      setWithdrawAmount("");
      refetch();
      triggerRefresh();
      setTimeout(() => { refetch(); triggerRefresh(); }, 3000);
      success("Withdraw successful");
    } catch (e) {
      console.error(e);
      const msg = e.message || "Withdraw failed";
      const friendly = msg.includes("e247bc92") || msg.includes("UnhealthyPosition")
        ? `Withdraw would make position unhealthy. Max: ${maxWithdraw.toFixed(2)} ${NATIVE_TOKEN}. Repay debt first or withdraw less.`
        : msg;
      setTxError(friendly);
      toastError(friendly);
    } finally {
      setWithdrawPending(false);
    }
  };

  const handleFlashRepay = async () => {
    if (!canTransact || !flashRepayUser || !flashRepayAmount || !isGuardian) return;
    setTxError(null);
    setFlashRepayPending(true);
    try {
      if (!(await ensureChain())) {
        throw new Error("Please switch to correct network in MetaMask (Chain ID " + CHAIN_ID + ")");
      }
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vault = new Contract(VAULT_ADDRESS, ABI, signer);
      const tx = await vault.flashRepay(flashRepayUser.trim(), parseEther(flashRepayAmount));
      await tx.wait();
      setFlashRepayUser("");
      setFlashRepayAmount("");
      refetch();
      triggerRefresh();
      success("Flash Repay successful");
    } catch (e) {
      console.error(e);
      setTxError(e.message || "flashRepay failed (guardian only; stablecoin set requires token approval)");
      toastError(e.message || "Flash Repay failed");
    } finally {
      setFlashRepayPending(false);
    }
  };

  const healthNum = Number(healthPercent) || 0;
  const guardianStatus = healthNum >= 150 ? "OK" : healthNum > 0 ? "At Risk" : null;

  if (!address) {
    return (
      <section
        id="vault"
        style={{
          padding: "3rem 1.5rem",
          background: "var(--light)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <span className="section-label">Vault</span>
            <h2 className="fade-up" style={{ fontSize: "2.25rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem" }}>
              Deposit & Mint
            </h2>
            <p style={{ color: "var(--muted)", fontWeight: 300, marginTop: "0.75rem", fontSize: "0.95rem" }}>
              Deposit {NATIVE_TOKEN} and mint stablecoin debt.
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={connect} className="btn-primary" style={{ padding: "1rem 2rem", background: "var(--dark)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer" }}>
              Connect wallet
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="vault"
      style={{
        padding: "3rem 1.5rem",
        background: "var(--light)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <span className="section-label">Vault</span>
          <h2 className="fade-up" style={{ fontSize: "2.25rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem" }}>
            Deposit & Mint
          </h2>
          <p style={{ color: "var(--muted)", fontWeight: 300, marginTop: "0.75rem", fontSize: "0.95rem" }}>
            Deposit collateral, mint debt. Health must stay above 150% (AegisVault) or 100% (demo).
          </p>
        </div>

        {loading ? (
          <p style={{ color: "var(--muted)", textAlign: "center" }}>Loading…</p>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
              <button
                type="button"
                onClick={() => { refetch(); triggerRefresh(); }}
                style={{ fontSize: "0.75rem", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
              >
                Refresh balance
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: hasPreview ? "0.5rem" : "2rem" }}>
              <div className="fade-up card-hover" style={{ padding: "1.75rem", background: "white", border: "1px solid rgba(0, 0, 0, 0.08)", animationDelay: "0.1s" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 300, color: "var(--muted)", marginBottom: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Collateral</p>
                <p style={{ fontSize: "2rem", fontWeight: 600, color: "var(--accent)", marginBottom: "0.25rem" }}>
                  {hasPreview ? previewCollateral.toFixed(2) : formatWei(collateral)} {NATIVE_TOKEN}
                </p>
                {hasPreview && depositNum > 0 && <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 300 }}>+{depositNum} on deposit</p>}
                {hasPreview && withdrawNum > 0 && <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 300 }}>−{withdrawNum} on withdraw</p>}
              </div>
              <div className="fade-up card-hover" style={{ padding: "1.75rem", background: "white", border: "1px solid rgba(0, 0, 0, 0.08)", animationDelay: "0.2s" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 300, color: "var(--muted)", marginBottom: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Debt</p>
                <p style={{ fontSize: "2rem", fontWeight: 600, color: "var(--dark)", marginBottom: "0.25rem" }}>
                  {hasPreview ? previewDebt.toFixed(2) : formatWei(debt)}
                </p>
                {hasPreview && mintNum > 0 && <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 300 }}>+{mintNum} on mint</p>}
                {hasPreview && repayNum > 0 && <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 300 }}>−{repayNum} on repay</p>}
              </div>
              <div className="fade-up card-hover" style={{ padding: "1.75rem", background: "white", border: "1px solid rgba(0, 0, 0, 0.08)", animationDelay: "0.3s" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 300, color: "var(--muted)", marginBottom: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>Health</p>
                <p style={{ fontSize: "2rem", fontWeight: 600, color: "var(--accent)", marginBottom: "0.25rem" }}>
                  {hasPreview && previewHealth != null
                    ? (previewHealth >= 1000 ? previewHealth.toFixed(0) : previewHealth.toFixed(1)) + "%"
                    : (healthPercent ?? "—") + "%"}
                </p>
                {hasPreview && <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 300 }}>Preview</p>}
                {guardianStatus && (
                  <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <p style={{ fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.25rem" }}>Guardian</p>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        background: guardianStatus === "OK" ? "var(--accent-bg)" : "rgba(200,80,80,0.2)",
                        color: guardianStatus === "OK" ? "var(--accent)" : "#c00",
                      }}
                    >
                      {guardianStatus === "OK" ? "Active" : "At Risk — flashRepay available"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {hasPreview && <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.5rem", textAlign: "center" }}>Preview — click Deposit or Mint to apply</p>}
          </>
        )}

        {!canTransact ? (
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", textAlign: "center" }}>
            Connect MetaMask and switch to Hardhat Local (Chain ID {CHAIN_ID}) to deposit or mint.
          </p>
        ) : (
          <div className="fade-up card-hover" style={{ maxWidth: 560, margin: "0 auto", padding: "2.5rem", background: "white", border: "1px solid rgba(0, 0, 0, 0.08)" }}>
            <div style={{ display: "grid", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 300, marginBottom: "0.5rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Deposit ({NATIVE_TOKEN})</label>
                <input
                  type="text"
                  placeholder="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(0, 0, 0, 0.15)", fontSize: "1rem", fontFamily: "inherit" }}
                />
              </div>
              <button
                onClick={handleDeposit}
                disabled={depositPending || !depositAmount}
                className="btn-primary"
                style={{ padding: "1rem 2rem", background: "var(--dark)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
              >
                {depositPending ? "Confirming…" : "Deposit"}
              </button>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 300, marginBottom: "0.5rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Mint (debt)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(0, 0, 0, 0.15)", fontSize: "1rem", fontFamily: "inherit" }}
                />
              </div>
              <button
                onClick={handleMint}
                disabled={mintPending || !mintAmount}
                className="btn-primary"
                style={{ padding: "1rem 2rem", background: "var(--dark)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
              >
                {mintPending ? "Confirming…" : "Mint"}
              </button>

              {VAULT_HAS_REPAY ? (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 300, marginBottom: "0.5rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Repay (reduce debt)</label>
                    <input
                      type="text"
                      placeholder="0"
                      value={repayAmount}
                      onChange={(e) => setRepayAmount(e.target.value)}
                      style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(0, 0, 0, 0.15)", fontSize: "1rem", fontFamily: "inherit" }}
                    />
                  </div>
                  <button
                    onClick={handleRepay}
                    disabled={repayPending || !repayAmount || Number(debt || 0) === 0}
                    className="btn-primary"
                    style={{ padding: "1rem 2rem", background: "var(--dark)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
                  >
                    {repayPending ? "Confirming…" : "Repay"}
                  </button>
                </>
              ) : (
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", fontStyle: "italic" }}>Repay not available (Demo vault)</p>
              )}

              {VAULT_HAS_WITHDRAW && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 300, marginBottom: "0.5rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Withdraw ({NATIVE_TOKEN})</label>
                    <input
                      type="text"
                      placeholder="0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(0, 0, 0, 0.15)", fontSize: "1rem", fontFamily: "inherit" }}
                    />
                    {debtNum > 0 && (
                      <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>Max: {maxWithdraw.toFixed(2)} {NATIVE_TOKEN} (health must stay ≥ 150%)</p>
                    )}
                  </div>
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawPending || !withdrawAmount || Number(collateral || 0) === 0 || (parseFloat(withdrawAmount) || 0) > maxWithdraw}
                    className="btn-primary"
                    style={{ padding: "1rem 2rem", background: "var(--dark)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
                  >
                    {withdrawPending ? "Confirming…" : "Withdraw"}
                  </button>
                </>
              )}

              {isGuardian && (
                <>
                  <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                    <p style={{ fontSize: "0.7rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Guardian: Flash Repay</p>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>Repay debt for an at-risk position. If stablecoin is set, you must hold tokens and approve the vault.</p>
                    <div style={{ display: "grid", gap: "1rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 300, marginBottom: "0.5rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>User address</label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={flashRepayUser}
                          onChange={(e) => setFlashRepayUser(e.target.value)}
                          style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(0, 0, 0, 0.15)", fontSize: "0.9rem", fontFamily: "monospace" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 300, marginBottom: "0.5rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Amount</label>
                        <input
                          type="text"
                          placeholder="0"
                          value={flashRepayAmount}
                          onChange={(e) => setFlashRepayAmount(e.target.value)}
                          style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(0, 0, 0, 0.15)", fontSize: "1rem", fontFamily: "inherit" }}
                        />
                      </div>
                      <button
                        onClick={handleFlashRepay}
                        disabled={flashRepayPending || !flashRepayUser.trim() || !flashRepayAmount}
                        className="btn-primary"
                        style={{ padding: "0.9rem 1.5rem", background: "var(--accent)", color: "white", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
                      >
                        {flashRepayPending ? "Confirming…" : "Flash Repay"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            {txError && <p style={{ color: "#c00", fontSize: "0.85rem", marginTop: "1rem" }}>{txError}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
