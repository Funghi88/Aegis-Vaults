import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section
      style={{
        padding: "3rem 1.5rem 6rem",
        background: "var(--light)",
      }}
    >
      <div
        className="hero-grid"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "2rem",
          alignItems: "center",
        }}
      >
        {/* Left column — editorial article style */}
        <div className="hero-text" style={{ zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
            <a href="https://polkadot.network" target="_blank" rel="noopener noreferrer" className="section-label hero-label-link" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textDecoration: "none" }}>
              Polkadot
            </a>
            <a href="https://polkadot.network/ecosystem" target="_blank" rel="noopener noreferrer" className="section-label hero-label-link" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textDecoration: "none" }}>
              Asset Hub
            </a>
            <a href="https://wiki.polkadot.network/docs/learn-xcm" target="_blank" rel="noopener noreferrer" className="section-label hero-label-link" style={{ fontSize: "0.75rem", fontWeight: 300, color: "var(--dark)", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
              XCM
            </a>
            <span className="accent-box" style={{ marginLeft: "auto" }}>
              2026
            </span>
          </div>
          <h1
            style={{
              fontSize: "clamp(2.5rem, 4.5vw, 3.75rem)",
              fontWeight: 400,
              color: "var(--dark)",
              lineHeight: 1.15,
              marginBottom: "1.5rem",
            }}
          >
            Your One-Stop Yield
          </h1>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 300,
              color: "var(--muted)",
              lineHeight: 1.75,
              maxWidth: 420,
              marginBottom: "2rem",
            }}
          >
            Route stablecoin to max yield across Polkadot. One click. AI-powered. As part of the ecosystem, Aegis Vaults connects Asset Hub to highest-yield destinations on Moonbeam, HydraDX, and Astar.
          </p>
          <div className="hero-ctas" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link to="/earn" className="btn-primary" style={{ padding: "1rem 2rem", background: "var(--dark)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
              Earn Max Yield
            </Link>
            <a href="https://onpop.io/network/onboard" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: "1rem 2rem", background: "transparent", color: "var(--dark)", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "1px solid var(--dark)" }}>
              Bridge to Pop
            </a>
          </div>
          <div className="hero-badges" style={{ marginTop: "2rem", display: "flex", gap: "1.5rem", color: "var(--muted)", fontSize: "0.8rem", fontWeight: 300, letterSpacing: "0.04em" }}>
            <a href="https://polkadot.network" target="_blank" rel="noopener noreferrer" className="link-hover" style={{ color: "inherit", textDecoration: "none" }}>Built on Polkadot</a>
            <a href="https://polkadot.network/ecosystem" target="_blank" rel="noopener noreferrer" className="link-hover" style={{ color: "inherit", textDecoration: "none" }}>Asset Hub</a>
            <a href="https://wiki.polkadot.network/docs/learn-xcm" target="_blank" rel="noopener noreferrer" className="link-hover" style={{ color: "inherit", textDecoration: "none" }}>XCM Powered</a>
          </div>
        </div>

        {/* Right column — editorial image */}
        <div className="hero-bust hero-bust-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", zIndex: 1 }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 420,
              aspectRatio: "1",
              background: "var(--light)",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.08)",
            }}
          >
            <div className="hero-bust-shimmer" />
            <img
              src="/ambient/hero-bust.png"
              alt=""
              className="hero-bust-img"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
