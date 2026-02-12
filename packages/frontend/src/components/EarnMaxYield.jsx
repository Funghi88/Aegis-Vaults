import { useNavigate, useSearchParams } from "react-router-dom";
import { useYields } from "../hooks/useYields";

const APY_DIFF_THRESHOLD = 2;

export function EarnMaxYield() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const destParam = searchParams.get("dest");
  const { best, yields, loading } = useYields();

  const selected = yields.find((y) => y.paraId != null && String(y.paraId) === destParam) || best;
  const second = yields[1] || yields[0];
  const isBest = selected?.name === best?.name;
  const yieldDiff = selected && second ? (Number(selected.apy) || 0) - (Number(second.apy) || 0) : 0;
  const wouldTrigger = yieldDiff >= APY_DIFF_THRESHOLD;

  const selectDest = (paraId) => {
    setSearchParams(paraId != null ? { dest: String(paraId) } : {});
  };

  return (
    <section
      id="earn"
      style={{
        padding: "3rem 1.5rem",
        background: "var(--light)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <span className="section-label">
            Best Destination
          </span>
          <h2 className="fade-up" style={{ fontSize: "2.25rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem" }}>
            Earn Max Yield
          </h2>
          <p style={{ color: "var(--muted)", fontWeight: 300, marginTop: "0.75rem", fontSize: "0.95rem" }}>
            One click to route your stablecoin to the highest-yield destination on Polkadot.
          </p>
        </div>
        <div className="fade-up card-hover card-hover--lg" style={{ maxWidth: 560, margin: "0 auto", padding: "2.5rem", background: "var(--light)", border: "1px solid rgba(0, 0, 0, 0.08)" }}>
          {loading ? (
            <p style={{ color: "var(--muted)" }}>Loading best yield...</p>
          ) : selected ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <span className="accent-box">Live</span>
                {isBest && (
                  <span style={{ padding: "0.25rem 0.5rem", background: "rgba(80,180,80,0.2)", color: "#28a745", fontSize: "0.75rem", fontWeight: 500, borderRadius: 4 }}>
                    AI Recommended
                  </span>
                )}
                <span style={{ fontSize: "0.8rem", fontWeight: 300, color: "var(--muted)", letterSpacing: "0.04em" }}>
                  {isBest ? "Best APY destination" : "Alternative"}
                </span>
              </div>
              <h3 style={{ fontSize: "2rem", fontWeight: 400, color: "var(--dark)", marginBottom: "0.5rem" }}>
                {selected.name}
              </h3>
              <p style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--accent)", marginBottom: "0.25rem" }}>
                {(Number(selected.apy) || 0).toFixed(2)}% APY
              </p>
              <p style={{ fontSize: "0.8rem", fontWeight: 300, color: "var(--muted)", marginBottom: "1.5rem" }}>
                APY (Annual Percentage Yield) is the estimated yearly return on your deposited assets.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {selected.paraId != null && (
                  <button
                    onClick={() => navigate(`/xcm?dest=${selected.paraId}&amount=100000000`)}
                    className="btn-primary"
                    style={{ padding: "1rem 2.5rem", background: "var(--accent)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
                  >
                    One-Click XCM to {selected.name}
                  </button>
                )}
                <a
                  href={selected.url || "https://polkadot.js.org/apps"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ display: "inline-block", padding: "1rem 2.5rem", background: "var(--dark)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer", textDecoration: "none" }}
                >
                  Route to {selected.name}
                </a>
              </div>
              <p style={{ fontSize: "0.8rem", fontWeight: 300, color: "var(--muted)", marginTop: "1rem" }}>
                {selected.paraId != null
                  ? "One-Click XCM pre-fills the XCM Builder; copy CLI or use Polkadot.js Apps. Or open the destination app directly."
                  : "Opens destination app in new tab."}
              </p>
              {yields.length > 1 && best && (
                <p style={{ fontSize: "0.8rem", fontWeight: 300, color: "var(--muted)", marginTop: "0.5rem" }}>
                  {isBest ? (
                    <>Yield diff: <strong style={{ color: wouldTrigger ? "var(--accent)" : "var(--text)" }}>{yieldDiff.toFixed(2)}%</strong> above next best{wouldTrigger ? " — trigger at 2%" : " — below 2% trigger"}.</>
                  ) : (
                    <>{(Number(best.apy) || 0) - (Number(selected.apy) || 0) > 0 && (
                      <><strong>{((Number(best.apy) || 0) - (Number(selected.apy) || 0)).toFixed(2)}%</strong> below best.</>
                    )}</>
                  )}
                </p>
              )}
            </>
          ) : (
            <p style={{ color: "var(--muted)" }}>No yield data available</p>
          )}
        </div>
        {yields.length > 1 && (
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            {yields.slice(0, 4).map((y) => (
              <button
                key={y.name}
                type="button"
                onClick={() => selectDest(y.paraId)}
                style={{
                  padding: "0.4rem 0.75rem",
                  background: selected?.name === y.name ? "var(--accent)" : "var(--accent-bg)",
                  color: selected?.name === y.name ? "white" : "var(--text)",
                  fontSize: "0.8rem",
                  fontWeight: 300,
                  letterSpacing: "0.02em",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {y.name}: {(Number(y.apy) || 0).toFixed(2)}%{best?.name === y.name ? " ★" : ""}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
