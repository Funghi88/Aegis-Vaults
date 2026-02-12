import { useYields } from "../hooks/useYields";

/** Competitive benchmarking: Aegis vs comparable protocols on Polkadot. */
const COMPETITORS = [
  { name: "Aegis Vaults", minCollateral: 150, tvl: "—", chain: "Asset Hub", yieldKey: null },
  { name: "Moonwell", minCollateral: 120, tvl: "$12M", chain: "Moonbeam", yieldKey: "Moonbeam" },
  { name: "Bifrost", minCollateral: 125, tvl: "$45M", chain: "Bifrost", yieldKey: "Bifrost" },
  { name: "StellaSwap", minCollateral: 110, tvl: "$8M", chain: "Moonbeam", yieldKey: "Moonbeam" },
];

export function BenchmarkTable() {
  const { yields } = useYields();

  const rows = COMPETITORS.map((c) => {
    const y = c.yieldKey ? yields.find((x) => x.name === c.yieldKey) : yields[0];
    const apy = y ? Number(y.apy) : null;
    return { ...c, apy };
  });

  return (
    <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <span className="section-label">Benchmark</span>
          <h2 className="fade-up" style={{ fontSize: "2rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem" }}>
            Competitive Comparison
          </h2>
          <p style={{ color: "var(--muted)", fontWeight: 300, marginTop: "0.5rem", fontSize: "0.9rem" }}>
            Compare collateral ratio, APY, and TVL across Polkadot DeFi vaults.
          </p>
        </div>
        <div className="fade-up card-hover" style={{ overflowX: "auto", background: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(0,0,0,0.1)" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "var(--dark)" }}>Protocol</th>
                <th style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: "var(--dark)" }}>Min. Collateral</th>
                <th style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: "var(--dark)" }}>Best APY</th>
                <th style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: "var(--dark)" }}>TVL</th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "var(--dark)" }}>Chain</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name} style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                  <td style={{ padding: "1rem", fontWeight: r.name === "Aegis Vaults" ? 600 : 400 }}>{r.name}</td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>{r.minCollateral}%</td>
                  <td style={{ padding: "1rem", textAlign: "right", color: r.name === "Aegis Vaults" ? "var(--accent)" : "inherit" }}>
                    {r.apy != null ? `${r.apy.toFixed(2)}%` : "—"}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>{r.tvl}</td>
                  <td style={{ padding: "1rem" }}>{r.chain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.75rem", textAlign: "center" }}>
          APY from DeFi Llama. TVL & collateral ratios from public sources. Updated periodically.
        </p>
      </div>
    </div>
  );
}
