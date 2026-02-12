import { Link } from "react-router-dom";

const STEPS = [
  {
    title: "Vault — Deposit & Mint",
    desc: "Deposit PAS (native token) as collateral and mint pUSD (when stablecoin is set) or debt. Repay to reduce debt, withdraw when health stays above 150%. Guardian can flashRepay for at-risk positions.",
    link: "/vault",
    linkText: "Go to Vault",
  },
  {
    title: "Earn Max Yield",
    desc: "See live APY for Bifrost, Astar, Moonbeam, HydraDX. One-Click XCM pre-fills the XCM Builder. Route opens the DeFi app directly.",
    link: "/earn",
    linkText: "Go to Earn Max Yield",
  },
  {
    title: "XCM — Cross-Chain",
    desc: "Send PAS or USDC from Asset Hub to another parachain (Moonbeam, Bifrost, etc.) to earn yield. Use Execute XCM in-browser or copy the CLI.",
    link: "/xcm",
    linkText: "Go to XCM Builder",
  },
  {
    title: "Bridge",
    desc: "Use Polkadot.js Apps for manual XCM and cross-chain transfers when you need more control.",
    link: "/bridge",
    linkText: "Go to Bridge",
  },
];

export function GetStarted() {
  return (
    <section
      style={{
        padding: "3rem 1.5rem",
        background: "var(--light)",
        minHeight: "60vh",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <span className="section-label">Onboarding</span>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem", marginBottom: "1rem" }}>
          Get Started
        </h1>
        <p style={{ color: "var(--muted)", fontWeight: 300, fontSize: "1rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>
          Aegis Vaults helps you deposit collateral, mint stablecoin, and route assets to the highest yield across Polkadot. Here’s what you can do on this site.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="card-hover"
              style={{
                padding: "1.5rem 1.75rem",
                background: "white",
                border: "1px solid rgba(0, 0, 0, 0.08)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
                <span className="accent-box" style={{ minWidth: 32, textAlign: "center" }}>
                  {i + 1}
                </span>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--dark)", margin: 0 }}>
                  {s.title}
                </h2>
              </div>
              <p style={{ color: "var(--muted)", fontWeight: 300, fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                {s.desc}
              </p>
              <Link
                to={s.link}
                className="link-hover"
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  color: "var(--accent)",
                  textDecoration: "none",
                }}
              >
                {s.linkText} →
              </Link>
            </div>
          ))}
        </div>

        <p style={{ color: "var(--muted)", fontWeight: 300, fontSize: "0.85rem", marginTop: "2rem", textAlign: "center" }}>
          <strong>Requirements:</strong> MetaMask for Vault; Polkadot extension (Talisman, Polkadot.js) for in-browser XCM.
        </p>
      </div>
    </section>
  );
}
