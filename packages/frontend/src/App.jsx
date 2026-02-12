import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { VaultRefreshProvider } from "./context/VaultRefreshContext";
import { Header } from "./components/Header";
import { StatusBanner } from "./components/StatusBanner";
import { Hero } from "./components/Hero";
import { TopYieldDestinations } from "./components/TopYieldDestinations";
import { EarnMaxYield } from "./components/EarnMaxYield";
import { VaultFlow } from "./components/VaultFlow";
import { XCMBuilder } from "./components/XCMBuilder";
import { Dashboard } from "./components/Dashboard";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { GetStarted } from "./components/GetStarted";
import { SecurityPage } from "./components/SecurityPage";

function HomePage() {
  return (
    <>
      <Hero />
      <TopYieldDestinations />
    </>
  );
}

function BridgePage() {
  return (
    <section style={{ padding: "3rem 1.5rem", background: "var(--light)", minHeight: "50vh" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <span className="section-label">Bridge</span>
        <h2 style={{ fontSize: "2.25rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem" }}>
          Bridge to Polkadot
        </h2>
        <p style={{ color: "var(--muted)", fontWeight: 300, marginTop: "1rem", marginBottom: "2rem" }}>
          Use Polkadot.js Apps for XCM and cross-chain transfers.
        </p>
        <a
          href="https://polkadot.js.org/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ display: "inline-block", padding: "1rem 2.5rem", background: "var(--dark)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer", textDecoration: "none" }}
        >
          Open Polkadot.js Apps
        </a>
      </div>
    </section>
  );
}

/** Base path for GitHub Pages (e.g. /Aegis-Vaults); empty for Vercel/root. */
const basename = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

export default function App() {
  return (
    <BrowserRouter basename={basename || undefined}>
      <ToastProvider>
        <VaultRefreshProvider>
          <div className="app-layout">
            <Header />
            <StatusBanner />
            <div className="content-frame">
              <main>
            <Routes>
                <Route path="/" element={<HomePage />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vault" element={<VaultFlow />} />
              <Route path="/earn" element={<EarnMaxYield />} />
              <Route path="/xcm" element={<XCMBuilder />} />
              <Route path="/features" element={<Features />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/bridge" element={<BridgePage />} />
            </Routes>
              </main>
              <Footer />
            </div>
          </div>
        </VaultRefreshProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
