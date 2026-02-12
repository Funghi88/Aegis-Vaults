import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useXCMExecute } from "../hooks/useXCMExecute";
import { useToast } from "../context/ToastContext";

const DEST_OPTIONS = [
  { id: 0, label: "Relay (Polkadot)" },
  { id: 4001, label: "Pop (Paseo)" },
  { id: 2004, label: "Moonbeam" },
  { id: 2006, label: "Astar" },
  { id: 2030, label: "Bifrost" },
  { id: 2034, label: "HydraDX" },
];

export function XCMBuilder() {
  const [searchParams] = useSearchParams();
  const destFromUrl = searchParams.get("dest");
  const amountFromUrl = searchParams.get("amount");
  const { success, error: toastError } = useToast();
  const {
    polkadotAddress,
    connectPolkadot,
    disconnectPolkadot,
    executeXCM,
    loading: xcmLoading,
    error: xcmError,
    setError: setXcmError,
  } = useXCMExecute();

  const [destParaId, setDestParaId] = useState(() => {
    const id = destFromUrl ? parseInt(destFromUrl, 10) : 4001;
    return !isNaN(id) ? id : 4001;
  });
  const [amount, setAmount] = useState(amountFromUrl || "100000000");
  const [recipient, setRecipient] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (destFromUrl) {
      const id = parseInt(destFromUrl, 10);
      if (!isNaN(id)) setDestParaId(id);
    }
    if (amountFromUrl) setAmount(amountFromUrl);
  }, [destFromUrl, amountFromUrl]);

  const copyCli = () => {
    const cmd = `DEST_PARA_ID=${destParaId} AMOUNT=${amount} RECIPIENT_SS58=${recipient || "<your-ss58>"} npm run xcm-transfer`;
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteXCM = async () => {
    setXcmError(null);
    try {
      const result = await executeXCM({ destParaId, amount, recipient: recipient.trim() });
      if (result?.success) {
        success("XCM transfer submitted");
      }
    } catch (e) {
      toastError(e.message || "XCM execution failed");
    }
  };

  return (
    <section
      id="xcm"
      style={{
        padding: "3rem 1.5rem",
        background: "var(--light)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <span className="section-label">XCM</span>
          <h2 className="fade-up" style={{ fontSize: "2.25rem", fontWeight: 400, color: "var(--dark)", marginTop: "0.5rem" }}>
            XCM Builder
          </h2>
          <p style={{ color: "var(--muted)", fontWeight: 300, marginTop: "0.75rem", fontSize: "0.95rem" }}>
            Configure XCM transfer params. Run from <code style={{ background: "var(--accent-bg)", padding: "0.1rem 0.35rem", fontSize: "0.85em" }}>packages/xcm-scripts</code>.
          </p>
        </div>
        <div className="fade-up card-hover" style={{ maxWidth: 560, margin: "0 auto", padding: "2.5rem", background: "white", border: "1px solid rgba(0, 0, 0, 0.08)" }}>
          <div style={{ display: "grid", gap: "1.25rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 300, marginBottom: "0.5rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Destination</label>
              <select
                value={destParaId}
                onChange={(e) => setDestParaId(Number(e.target.value))}
                style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(0, 0, 0, 0.15)", fontSize: "1rem", fontFamily: "inherit" }}
              >
                {DEST_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label} ({o.id || "relay"})</option>
                ))}
                {!DEST_OPTIONS.some((o) => o.id === destParaId) && (
                  <option value={destParaId}>Para {destParaId}</option>
                )}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 300, marginBottom: "0.5rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Amount (raw, 10 decimals)</label>
              <input
                type="text"
                placeholder="100000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(0, 0, 0, 0.15)", fontSize: "1rem", fontFamily: "inherit" }}
              />
              <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>100000000 = 0.1 PAS</p>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 300, marginBottom: "0.5rem", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Recipient (SS58)</label>
              <input
                type="text"
                placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem", border: "1px solid rgba(0, 0, 0, 0.15)", fontSize: "0.9rem", fontFamily: "monospace" }}
              />
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button
                onClick={copyCli}
                className="btn-primary"
                style={{ padding: "1rem 2rem", background: "var(--dark)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
              >
                {copied ? "Copied!" : "Copy CLI command"}
              </button>
              {polkadotAddress ? (
                <>
                  <button
                    onClick={handleExecuteXCM}
                    disabled={xcmLoading || !recipient?.trim()}
                    className="btn-primary"
                    style={{ padding: "1rem 2rem", background: "var(--accent)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
                  >
                    {xcmLoading ? "Check wallet popup…" : "Execute XCM"}
                  </button>
                  {xcmLoading && (
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.5rem" }}>
                      Look for Talisman/Polkadot.js window — it may be behind this tab.
                    </p>
                  )}
                  <button
                    onClick={disconnectPolkadot}
                    className="link-hover"
                    style={{ padding: "1rem", background: "none", border: "1px solid rgba(0,0,0,0.2)", fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    Disconnect Polkadot
                  </button>
                </>
              ) : (
                <button
                  onClick={connectPolkadot}
                  className="btn-primary"
                  style={{ padding: "1rem 2rem", background: "var(--accent)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer" }}
                >
                  Connect Polkadot (execute)
                </button>
              )}
              <a
                href="https://polkadot.js.org/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ padding: "1rem 2rem", background: "var(--accent)", color: "white", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", border: "none", cursor: "pointer", textDecoration: "none" }}
              >
                Open Polkadot.js Apps
              </a>
            </div>
            {xcmError && <p style={{ color: "#c00", fontSize: "0.85rem", marginTop: "0.5rem" }}>{xcmError}</p>}
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "1.5rem" }}>
            Execute XCM: Connect Polkadot (Talisman, Polkadot.js) — extension popup will sign. CLI: requires <code>SENDER_SEED</code> or run interactively. Native PAS teleport from Asset Hub.
          </p>
        </div>
      </div>
    </section>
  );
}
