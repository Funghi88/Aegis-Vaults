import { Link, NavLink } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { CHAIN_ID, CHAIN_NAMES } from "../config";

const navLightStyle = { color: "var(--dark)", fontSize: "0.8rem", fontWeight: 300, letterSpacing: "0.08em", textTransform: "uppercase" };
const navDarkStyle = { color: "white", fontSize: "0.75rem", fontWeight: 300, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 1rem" };

export function Header() {
  const { address, connect, disconnect, chainId, isCorrectChain, switchChain } = useWallet();
  const chainName = chainId != null ? (CHAIN_NAMES[chainId] || `Chain ${chainId}`) : null;

  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
      {/* Top bar — light, Homepage | Aegis Vaults (centered) | Connect | Earn Max Yield */}
      <div
        style={{
          background: "var(--light)",
          padding: "0.75rem 1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <NavLink to="/get-started" className="link-hover" style={navLightStyle}>Get started</NavLink>
          </div>

          <Link to="/" className="section-title link-hover" style={{ fontSize: "1.5rem", fontWeight: 400, color: "var(--dark)", letterSpacing: "0.02em", textTransform: "uppercase", flexShrink: 0 }}>
            Aegis Vaults
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, justifyContent: "flex-end", minWidth: 0, flexWrap: "wrap" }}>
            {address && chainName && (
              <>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: isCorrectChain ? "var(--accent)" : "#c00",
                  }}
                >
                  {chainName}
                </span>
                {!isCorrectChain && (
                  <button
                    onClick={switchChain}
                    className="link-hover"
                    style={{ fontSize: "0.7rem", background: "none", border: "none", cursor: "pointer", color: "var(--accent)", textDecoration: "underline" }}
                  >
                    Switch
                  </button>
                )}
              </>
            )}
            <button
              onClick={address ? disconnect : connect}
              className="link-hover"
              style={{ ...navLightStyle, background: "none", border: "none", cursor: "pointer" }}
            >
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect wallet"}
            </button>
            <span className="nav-divider" style={{ margin: "0 0.25rem" }} />
            <Link to="/earn" className="btn-primary" style={{ padding: "0.4rem 0.9rem", background: "var(--dark)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
              Earn Max Yield
            </Link>
          </div>
        </div>
      </div>

      {/* Nav bar — dark, single horizontal line at bottom only */}
      <div
        className="header-nav-bar"
        style={{
          background: "var(--dark)",
          padding: "0.6rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0",
          flexWrap: "wrap",
          borderBottom: "2px solid var(--text)",
        }}
      >
        <NavLink to="/" end className="link-hover" style={({ isActive }) => ({ ...navDarkStyle, textDecoration: isActive ? "underline" : "none" })}>Home</NavLink>
        <span className="nav-divider" style={{ margin: "0", background: "rgba(255,255,255,0.3)", opacity: 1 }} />
        <NavLink to="/get-started" className="link-hover" style={({ isActive }) => ({ ...navDarkStyle, textDecoration: isActive ? "underline" : "none" })}>Get started</NavLink>
        <span className="nav-divider" style={{ margin: "0", background: "rgba(255,255,255,0.3)", opacity: 1 }} />
        <NavLink to="/dashboard" className="link-hover" style={({ isActive }) => ({ ...navDarkStyle, textDecoration: isActive ? "underline" : "none" })}>Dashboard</NavLink>
        <span className="nav-divider" style={{ margin: "0", background: "rgba(255,255,255,0.3)", opacity: 1 }} />
        <NavLink to="/vault" className="link-hover" style={({ isActive }) => ({ ...navDarkStyle, textDecoration: isActive ? "underline" : "none" })}>Vault</NavLink>
        <span className="nav-divider" style={{ margin: "0", background: "rgba(255,255,255,0.3)", opacity: 1 }} />
        <NavLink to="/earn" className="link-hover" style={({ isActive }) => ({ ...navDarkStyle, textDecoration: isActive ? "underline" : "none" })}>Earn Max Yield</NavLink>
        <span className="nav-divider" style={{ margin: "0", background: "rgba(255,255,255,0.3)", opacity: 1 }} />
        <NavLink to="/xcm" className="link-hover" style={({ isActive }) => ({ ...navDarkStyle, textDecoration: isActive ? "underline" : "none" })}>XCM</NavLink>
        <span className="nav-divider" style={{ margin: "0", background: "rgba(255,255,255,0.3)", opacity: 1 }} />
        <NavLink to="/features" className="link-hover" style={({ isActive }) => ({ ...navDarkStyle, textDecoration: isActive ? "underline" : "none" })}>Features</NavLink>
        <span className="nav-divider" style={{ margin: "0", background: "rgba(255,255,255,0.3)", opacity: 1 }} />
        <NavLink to="/bridge" className="link-hover" style={({ isActive }) => ({ ...navDarkStyle, textDecoration: isActive ? "underline" : "none" })}>Bridge</NavLink>
      </div>
    </header>
  );
}
