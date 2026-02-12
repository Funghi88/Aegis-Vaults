import { useState, useEffect } from "react";

/**
 * Estimated gas savings vs Ethereum L1.
 * Methodology: Polkadot Hub EVM gas costs ~0.01–0.1× Ethereum等效 gas.
 * Uses synthetic weekly estimate based on typical vault activity.
 * Replace with on-chain data when available.
 */
const ETH_GAS_PRICE_GWEI = 30;
const DOT_GAS_PRICE_GWEI = 0.1; // ~100x cheaper
const ESTIMATED_DAILY_TXS = 50;
const GAS_PER_TX = 150000;
const ETH_PRICE_USD = 3600;
const DOT_PRICE_USD = 7;

function estimateWeeklySavings() {
  const ethCostPerTx = (ETH_GAS_PRICE_GWEI * GAS_PER_TX * 1e-9) * ETH_PRICE_USD;
  const polkadotCostPerTx = (DOT_GAS_PRICE_GWEI * GAS_PER_TX * 1e-9) * DOT_PRICE_USD;
  const savedPerTx = ethCostPerTx - polkadotCostPerTx;
  const weekly = savedPerTx * ESTIMATED_DAILY_TXS * 7;
  return Math.round(weekly);
}

export function useGasSavings() {
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    setSaved(estimateWeeklySavings());
  }, []);

  return {
    savedUsd: saved,
    loading: saved == null,
  };
}
