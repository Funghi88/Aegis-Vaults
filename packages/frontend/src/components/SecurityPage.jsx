import { Link } from "react-router-dom";
import { VAULT_ADDRESS } from "../config";

const SECTIONS = [
  {
    title: "How We Protect You",
    items: [
      {
        heading: "Non-custodial",
        text: "Your keys, your crypto. We never hold or access your funds. Every deposit, mint, repay, or withdraw is signed by you in MetaMask or your Polkadot extension. Funds stay in the smart contract; only you can withdraw your collateral.",
      },
      {
        heading: "Smart contract safeguards",
        text: "Reentrancy guard prevents withdraw-from-receive attacks. A 150% minimum health factor blocks mint or withdraw when your position would become undercollateralized. Users can only withdraw their own collateral—no arbitrary transfers.",
      },
      {
        heading: "No private keys on our site",
        text: "We never store, transmit, or request your recovery phrase or private keys. Wallet providers (MetaMask, Talisman, Polkadot.js) sign transactions locally. Legitimate services will never ask for your seed phrase.",
      },
    ],
  },
  {
    title: "What You Should Do",
    items: [
      {
        heading: "Protect your recovery phrase",
        text: "Store it offline in multiple secure locations. Never share it with anyone—not support, not “validators,” not anyone. If someone asks for it, they are trying to steal your assets.",
      },
      {
        heading: "Verify the URL",
        text: "Use only the official site. Check the address bar before connecting your wallet. Phishing sites mimic real domains; typos (e.g. aegis-vau1ts) are common.",
      },
      {
        heading: "Verify the contract",
        text: "Before depositing, confirm the vault address matches our documented address. You can cross-check in MetaMask when approving a transaction.",
      },
      {
        heading: "Use a secure connection",
        text: "Avoid public WiFi when transacting. Prefer a trusted network and up-to-date browser.",
      },
      {
        heading: "Review each transaction",
        text: "Before signing, check the recipient address, amount, and function. Reject unexpected or suspicious requests.",
      },
    ],
  },
  {
    title: "Risks to Be Aware Of",
    items: [
      {
        heading: "Phishing",
        text: "Fake sites, emails, or DMs may ask you to connect your wallet or enter your recovery phrase. Always verify the source and never enter your seed phrase on any website.",
      },
      {
        heading: "Malicious contracts",
        text: "Only interact with our documented contract address. Fake contracts may look similar but drain your funds.",
      },
      {
        heading: "Contract risk",
        text: "Our contracts are not professionally audited. Use at your own risk. Testnet deployment carries lower financial risk.",
      },
    ],
  },
];

export function SecurityPage() {
  return (
    <section
      style={{
        padding: "3rem 1.5rem",
        background: "var(--light)",
        minHeight: "60vh",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <span className="section-label">Trust & Safety</span>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
          Security
        </h1>
        <p style={{ color: "var(--muted)", fontWeight: 300, fontSize: "1rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>
          How we protect your assets and what you should do to stay safe.
        </p>

        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 500, color: "var(--dark)", marginBottom: "1rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {section.title}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {section.items.map((item) => (
                <div
                  key={item.heading}
                  className="card-hover"
                  style={{
                    padding: "1.25rem 1.5rem",
                    background: "white",
                    border: "1px solid rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <h3 style={{ fontSize: "1rem", fontWeight: 500, color: "var(--dark)", marginBottom: "0.5rem" }}>
                    {item.heading}
                  </h3>
                  <p style={{ color: "var(--muted)", fontWeight: 300, fontSize: "0.9rem", lineHeight: 1.65, margin: 0 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div
          className="card-hover"
          style={{
            padding: "1.5rem 1.75rem",
            background: "white",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ fontSize: "1rem", fontWeight: 500, color: "var(--dark)", marginBottom: "0.75rem" }}>
            Official vault contract
          </h3>
          <p style={{ color: "var(--muted)", fontWeight: 300, fontSize: "0.85rem", marginBottom: "0.5rem", fontFamily: "monospace", wordBreak: "break-all" }}>
            {VAULT_ADDRESS}
          </p>
          <p style={{ color: "var(--muted)", fontWeight: 300, fontSize: "0.8rem", margin: 0 }}>
            Verify this address in your wallet before approving any vault transaction.
          </p>
        </div>

        <p style={{ color: "var(--muted)", fontWeight: 300, fontSize: "0.85rem", textAlign: "center" }}>
          Found a vulnerability?{" "}
          <a
            href="https://github.com/Funghi88/Aegis-Vaults/issues"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)", textDecoration: "underline" }}
          >
            Report responsibly
          </a>
          . Do not disclose publicly before a fix is available.
        </p>

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link
            to="/get-started"
            className="link-hover"
            style={{
              fontSize: "0.8rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            ← Back to Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
