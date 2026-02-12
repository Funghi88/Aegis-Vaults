export function StatusBanner() {
  return (
    <div
      style={{
        padding: "0.5rem 1.5rem",
        background: "var(--accent-bg)",
        fontSize: "0.75rem",
        fontWeight: 300,
        color: "var(--muted)",
        textAlign: "center",
        letterSpacing: "0.02em",
      }}
    >
      Live: APY data, wallet connect, vault (deposit, mint, repay), guardian flashRepay, yield diff, XCM Builder, One-Click Earn Max Yield.
    </div>
  );
}
