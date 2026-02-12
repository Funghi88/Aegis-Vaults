import { Link } from "react-router-dom";

/** Before vs After: Traditional manual flow vs Aegis one-click. */
const ROWS = [
  { metric: "Clicks to Yield", traditional: "12", aegis: "1" },
  { metric: "Gas tokens required", traditional: "3", aegis: "0" },
  { metric: "Time to best yield", traditional: "8+ min", aegis: "6 sec" },
];

const cardStyle = {
  overflow: "hidden",
  background: "white",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 8,
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
};
const cellBorder = "1px solid rgba(0,0,0,0.08)";
const cellPadding = "1.25rem 1.5rem";

export function ComparisonTable() {
  return (
    <section style={{ padding: "3rem 1.5rem", background: "var(--light)", borderTop: "2px solid var(--text)" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <span className="section-label" style={{ color: "var(--muted)", letterSpacing: "0.08em" }}>Compare</span>
          <h2 style={{ fontSize: "2rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.75rem" }}>
            Traditional vs Aegis
          </h2>
        </div>
        <div className="card-hover fade-up" style={cardStyle}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "1rem" }}>
            <thead>
              <tr>
                <th style={{ padding: cellPadding, textAlign: "left", fontWeight: 600, color: "var(--muted)", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: cellBorder, borderRight: cellBorder }}>Metric</th>
                <th style={{ padding: cellPadding, textAlign: "center", fontWeight: 600, color: "var(--muted)", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: cellBorder, borderRight: cellBorder }}>Traditional</th>
                <th style={{ padding: cellPadding, textAlign: "center", fontWeight: 600, color: "var(--accent)", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: cellBorder }}>Aegis</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.metric}>
                  <td style={{ padding: cellPadding, fontWeight: 500, color: "var(--dark)", borderBottom: i < ROWS.length - 1 ? cellBorder : "none", borderRight: cellBorder }}>{r.metric}</td>
                  <td style={{ padding: cellPadding, textAlign: "center", color: "var(--muted)", borderBottom: i < ROWS.length - 1 ? cellBorder : "none", borderRight: cellBorder }}>{r.traditional}</td>
                  <td style={{ padding: cellPadding, textAlign: "center", fontWeight: 600, color: "var(--accent)", borderBottom: i < ROWS.length - 1 ? cellBorder : "none" }}>{r.aegis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginTop: "1.5rem", textAlign: "center" }}>
          <Link to="/earn" className="link-hover" style={{ color: "var(--accent)", fontWeight: 500 }}>Try one-click yield →</Link>
        </p>
      </div>
    </section>
  );
}
