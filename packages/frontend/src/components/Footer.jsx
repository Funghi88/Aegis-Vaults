export function Footer() {
  return (
    <footer
      style={{
        padding: "3rem 1.5rem",
        borderTop: "2px solid var(--text)",
        marginTop: "2rem",
        textAlign: "center",
        color: "var(--muted)",
        fontSize: "0.9rem",
      }}
    >
      <p style={{ fontWeight: 300, color: "var(--text)", letterSpacing: "0.02em" }}>
        Aegis Vaults — Self-Driving Money on Polkadot
      </p>
      <p style={{ marginTop: "0.75rem", fontWeight: 300, letterSpacing: "0.04em" }}>
        <a href="https://github.com/PolkaSynth/aegis-vaults" target="_blank" rel="noopener noreferrer" className="link-hover" style={{ color: "var(--accent)" }}>
          GitHub
        </a>
        {" · "}
        <a href="https://polkadot.js.org/apps" target="_blank" rel="noopener noreferrer" className="link-hover" style={{ color: "var(--accent)" }}>
          Polkadot.js Apps
        </a>
      </p>
    </footer>
  );
}
