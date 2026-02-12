import { useYields } from "../hooks/useYields";
import { useWallet } from "../hooks/useWallet";
import { useVault } from "../hooks/useVault";
import { useGasSavings } from "../hooks/useGasSavings";
import { BenchmarkTable } from "./BenchmarkTable";
import { NATIVE_TOKEN } from "../config";

function formatWei(wei) {
  if (!wei || wei === "0") return "0";
  const n = Number(wei) / 1e18;
  return n >= 1000 ? n.toFixed(0) : n >= 1 ? n.toFixed(2) : n.toFixed(4);
}

export function Dashboard() {
  const { yields, best, loading, error } = useYields();
  const { address, connect } = useWallet();
  const { collateral, debt, healthPercent, loading: vaultLoading, error: vaultError } = useVault(address);
  const { savedUsd, loading: gasLoading } = useGasSavings();

  const balanceValue =
    vaultLoading && address
      ? "…"
      : vaultError
        ? "—"
        : collateral != null
          ? `${formatWei(collateral)} ${NATIVE_TOKEN}`
          : "—";

  const balanceSubtitle = !address
    ? "Connect wallet"
    : vaultError
      ? "Vault not deployed or unsupported chain"
      : collateral != null && (Number(collateral) > 0 || Number(debt) > 0)
        ? `Debt: ${formatWei(debt)} · Health: ${healthPercent || "—"}%`
        : "No vault position";

  return (
    <section
      id="dashboard"
      style={{
        padding: "3rem 1.5rem",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <span className="section-label">
          Overview
        </span>
        <h2 className="fade-up" style={{ fontSize: "2.25rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem" }}>
          Dashboard
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
        <Card title="Your Balance" value={balanceValue} subtitle={balanceSubtitle} accent="var(--accent)" delay="0.1s" onSubtitleClick={!address ? connect : undefined} />
        <Card title="Optimized Yield" value={best ? `${(Number(best.apy) || 0).toFixed(2)}%` : "—"} subtitle={best ? best.name : loading ? "Loading..." : "—"} accent="var(--accent)" delay="0.2s" />
        <Card title="Current Yield" value={yields[1] ? `${(Number(yields[1].apy) || 0).toFixed(2)}%` : best ? `${(Number(best.apy) || 0).toFixed(2)}%` : "—"} subtitle={yields[1] ? yields[1].name : "Best available"} accent="var(--accent)" delay="0.3s" />
        <Card title="Gas Savings" value={gasLoading ? "…" : savedUsd != null ? `$${savedUsd.toLocaleString()}` : "—"} subtitle="Saved vs Ethereum L1 this week" accent="var(--accent)" delay="0.4s" />
      </div>
      {error && (
        <p style={{ color: "var(--muted)", fontWeight: 300, fontSize: "0.85rem", marginTop: "1rem", textAlign: "center" }}>
          Using fallback APY data
        </p>
      )}
      <BenchmarkTable />
    </section>
  );
}

function Card({ title, value, subtitle, accent, delay, onSubtitleClick }) {
  return (
    <div className="fade-up card-hover" style={{ padding: "2rem", background: "white", border: "1px solid rgba(0, 0, 0, 0.08)", animationDelay: delay }}>
      <p style={{ fontSize: "0.75rem", fontWeight: 300, color: "var(--muted)", marginBottom: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {title}
      </p>
      <p style={{ fontSize: "2rem", fontWeight: 600, color: accent, marginBottom: "0.25rem" }}>
        {value}
      </p>
      {onSubtitleClick ? (
        <button onClick={onSubtitleClick} className="link-hover" style={{ fontSize: "0.9rem", fontWeight: 300, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>
          {subtitle}
        </button>
      ) : (
        <p style={{ fontSize: "0.9rem", fontWeight: 300, color: "var(--muted)" }}>{subtitle}</p>
      )}
    </div>
  );
}
