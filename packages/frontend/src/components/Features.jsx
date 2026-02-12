const FEATURES = [
  { title: "AI Oracle", desc: "Scans HydraDX, Moonbeam, Astar, Bifrost for real APY via DefiLlama." },
  { title: "One-Click Route", desc: "One-Click XCM pre-fills XCM Builder for best destination. Route link opens DeFi app." },
  { title: "AI Guardian", desc: "flashRepay when health drops. Runs in backend (guardian:demo). Async Backing <6s." },
];

export function Features() {
  return (
    <section
      id="features"
      style={{
        padding: "3rem 1.5rem",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <span className="section-label">
          Product
        </span>
        <h2 className="fade-up" style={{ fontSize: "2.25rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem" }}>
          Features
        </h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        {FEATURES.map((f, i) => (
          <div key={f.title} className="fade-up card-hover" style={{ padding: "2rem", background: "white", border: "1px solid rgba(0, 0, 0, 0.08)", animationDelay: `${0.1 * i}s` }}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                background: "var(--accent)",
                marginBottom: "1rem",
              }}
            />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--dark)", marginBottom: "0.5rem" }}>
              {f.title}
            </h3>
            <p style={{ color: "var(--muted)", fontWeight: 300, fontSize: "0.95rem", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
