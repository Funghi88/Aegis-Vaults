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

  const cardStyle = {
    overflow: "hidden",
    overflowX: "auto",
    background: "white",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 8,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  };
  const cellBorder = "1px solid rgba(0,0,0,0.08)";
  const cellPadding = "1.25rem 1.5rem";

  return (
    <div
      style={{
        marginTop: "8rem",
        marginLeft: "-1.5rem",
        marginRight: "-1.5rem",
        paddingTop: "4.5rem",
        paddingBottom: "3rem",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
        borderTop: "2px solid var(--text)",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <span className="section-label">Benchmark</span>
          <h2 className="fade-up" style={{ fontSize: "2rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem" }}>
            Competitive Comparison
          </h2>
          <p style={{ color: "var(--muted)", fontWeight: 300, marginTop: "0.5rem", fontSize: "0.9rem" }}>
            Compare collateral ratio, APY, and TVL across Polkadot DeFi vaults.
          </p>
        </div>
        <div className="fade-up card-hover" style={cardStyle}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr>
                <th style={{ padding: cellPadding, textAlign: "left", fontWeight: 600, color: "var(--dark)", borderBottom: cellBorder, borderRight: cellBorder }}>Protocol</th>
                <th style={{ padding: cellPadding, textAlign: "right", fontWeight: 600, color: "var(--dark)", borderBottom: cellBorder, borderRight: cellBorder }}>Min. Collateral</th>
                <th style={{ padding: cellPadding, textAlign: "right", fontWeight: 600, color: "var(--dark)", borderBottom: cellBorder, borderRight: cellBorder }}>Best APY</th>
                <th style={{ padding: cellPadding, textAlign: "right", fontWeight: 600, color: "var(--dark)", borderBottom: cellBorder, borderRight: cellBorder }}>TVL</th>
                <th style={{ padding: cellPadding, textAlign: "left", fontWeight: 600, color: "var(--dark)", borderBottom: cellBorder }}>Chain</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.name}>
                  <td style={{ padding: cellPadding, fontWeight: r.name === "Aegis Vaults" ? 600 : 400, borderBottom: i < rows.length - 1 ? cellBorder : "none", borderRight: cellBorder }}>{r.name}</td>
                  <td style={{ padding: cellPadding, textAlign: "right", borderBottom: i < rows.length - 1 ? cellBorder : "none", borderRight: cellBorder }}>{r.minCollateral}%</td>
                  <td style={{ padding: cellPadding, textAlign: "right", color: r.name === "Aegis Vaults" ? "var(--accent)" : "inherit", borderBottom: i < rows.length - 1 ? cellBorder : "none", borderRight: cellBorder }}>
                    {r.apy != null ? `${r.apy.toFixed(2)}%` : "—"}
                  </td>
                  <td style={{ padding: cellPadding, textAlign: "right", borderBottom: i < rows.length - 1 ? cellBorder : "none", borderRight: cellBorder }}>{r.tvl}</td>
                  <td style={{ padding: cellPadding, borderBottom: i < rows.length - 1 ? cellBorder : "none" }}>{r.chain}</td>
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
