import { Link } from "react-router-dom";
import { useYields } from "../hooks/useYields";

export function TopYieldDestinations() {
  const { yields, loading } = useYields();

  return (
    <section
      style={{
        padding: "5rem 1.5rem",
        background: "var(--light)",
      }}
    >
      {/* Full-bleed border: extends to vertical frame edges */}
      <div
        style={{
          margin: "0 -1.5rem",
          paddingTop: "2rem",
          borderTop: "2px solid var(--text)",
        }}
      />
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", marginTop: "2rem", textAlign: "center" }}>
          <span className="section-label">
            Yield Destinations
          </span>
          <h2 className="fade-up" style={{ fontSize: "2.25rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem" }}>
            Top Yield Destinations
          </h2>
          <p style={{ color: "var(--muted)", fontWeight: 300, marginTop: "0.75rem", fontSize: "0.95rem", maxWidth: 560, margin: "0.75rem auto 0" }}>
            Route stablecoin to earn farm rewards & fees across Polkadot.
          </p>
        </div>
        {loading ? (
          <p style={{ color: "var(--muted)", textAlign: "center" }}>Loading...</p>
        ) : yields.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
            {yields.slice(0, 5).map((y, i) => (
              <Link
                key={y.name}
                to={y.paraId != null ? `/earn?dest=${y.paraId}` : "/earn"}
                className="fade-up card-hover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1.25rem 1.5rem",
                  background: "white",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                  textDecoration: "none",
                  color: "inherit",
                  animationDelay: `${0.05 * i}s`,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span className="accent-box" style={{ minWidth: 32, textAlign: "center" }}>
                    {i + 1}
                  </span>
                  <span style={{ fontWeight: 400, color: "var(--dark)" }}>{y.name}</span>
                </span>
                <span style={{ fontWeight: 600, color: "var(--accent)", fontSize: "1.1rem" }}>
                  {(Number(y.apy) || 0).toFixed(2)}% APY
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--muted)", textAlign: "center" }}>No yield data available</p>
        )}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link to="/earn" className="btn-primary" style={{ display: "inline-block", padding: "0.9rem 2rem", background: "var(--dark)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
            Earn Max Yield
          </Link>
        </div>
      </div>
    </section>
  );
}
