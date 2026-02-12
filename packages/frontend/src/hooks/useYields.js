import { useState, useEffect } from "react";

const CHAIN_MAP = {
  Moonbeam: { paraId: 2004, name: "Moonbeam", url: "https://apps.moonbeam.network" },
  Astar: { paraId: 2006, name: "Astar", url: "https://app.astar.network" },
  Bifrost: { paraId: 2030, name: "Bifrost", url: "https://app.bifrost.io" },
  "Bifrost Network": { paraId: 2030, name: "Bifrost", url: "https://app.bifrost.io" },
  HydraDX: { paraId: 2034, name: "HydraDX", url: "https://app.hydradx.io" },
};

function poolsToDestinations(pools) {
  const byChain = {};
  const relevant = pools.filter(
    (p) => CHAIN_MAP[p.chain] && (p.stablecoin === true || p.stablecoin === "yes")
  );
  const source = relevant.length ? relevant : pools;
  for (const p of source) {
    const meta = CHAIN_MAP[p.chain];
    if (!meta) continue;
    const apy = Number(p.apy) || 0;
    const name = meta.name || p.chain;
    if (!byChain[name] || apy > (byChain[name].apy || 0)) {
      byChain[name] = { name, apy, url: meta.url, paraId: meta.paraId };
    }
  }
  return Object.values(byChain);
}

export function useYields() {
  const [yields, setYields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchYields() {
      try {
        const res = await fetch("https://yields.llama.fi/pools");
        if (!res.ok) throw new Error(`API ${res.status}`);
        const json = await res.json();
        const data = json.data || [];
        const dests = poolsToDestinations(data);
        if (!cancelled) {
          setYields(dests.sort((a, b) => b.apy - a.apy));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setYields([
            { name: "Moonbeam", apy: 4.5, url: "https://apps.moonbeam.network", paraId: 2004 },
            { name: "HydraDX", apy: 3.8, url: "https://app.hydradx.io", paraId: 2034 },
            { name: "Astar", apy: 3.2, url: "https://app.astar.network", paraId: 2006 },
          ]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchYields();
    return () => (cancelled = true);
  }, []);

  const best = yields[0] || null;
  const current = yields[1] || yields[0] || null;

  return { yields, best, current, loading, error };
}
