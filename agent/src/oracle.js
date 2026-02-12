const DESTINATIONS = [
  { id: 2034, name: "HydraDX", paraId: 2034 },
  { id: 2004, name: "Moonbeam", paraId: 2004 },
  { id: 2006, name: "Astar", paraId: 2006 },
];

const DEFILLAMA_URL = "https://yields.llama.fi/pools";

async function fetchFromDefiLlama() {
  const res = await fetch(DEFILLAMA_URL);
  if (!res.ok) throw new Error(`DefiLlama ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

const CHAIN_MAP = {
  Moonbeam: { paraId: 2004, name: "Moonbeam" },
  Hydra: { paraId: 2034, name: "HydraDX" },
  Astar: { paraId: 2006, name: "Astar" },
};

function poolsToDestinations(pools) {
  const byChain = {};
  const relevant = pools.filter((p) => CHAIN_MAP[p.chain] && (p.stablecoin === true || p.stablecoin === "yes"));
  for (const p of relevant.length ? relevant : pools) {
    const meta = CHAIN_MAP[p.chain];
    if (!meta) continue;
    const apy = Number(p.apy) || 0;
    if (!byChain[p.chain] || apy > (byChain[p.chain].apy || 0)) {
      byChain[p.chain] = { ...meta, apy };
    }
  }
  return Object.values(byChain);
}

async function fetchAPYs() {
  try {
    const pools = await fetchFromDefiLlama();
    const dests = poolsToDestinations(pools);
    if (dests.length > 0) return dests;
  } catch (e) {
    console.warn("DefiLlama fetch failed, using mock:", e.message);
  }
  return DESTINATIONS.map((d) => ({
    ...d,
    apy: 3 + Math.random() * 10,
  }));
}

async function getBestYield() {
  const yields = await fetchAPYs();
  yields.sort((a, b) => b.apy - a.apy);
  return yields[0];
}

module.exports = { fetchAPYs, getBestYield };
