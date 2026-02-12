import { useState, useEffect, useCallback } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { addressToEvm } from "@polkadot/util-crypto";
import { VAULT_ADDRESS, RPC_URL } from "../config";
import { useVaultRefresh } from "../context/VaultRefreshContext";

const ABI = [
  "function getCollateral(address) view returns (uint256)",
  "function getDebt(address) view returns (uint256)",
  "function getHealthFactor(address) view returns (uint256)",
  "function guardian() view returns (address)",
  "function stablecoin() view returns (address)",
];

function toEvmAddress(address) {
  if (!address) return null;
  if (typeof address === "string" && address.startsWith("0x") && address.length === 42) {
    return address;
  }
  try {
    const bytes = addressToEvm(address);
    return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return null;
  }
}

export function useVault(address) {
  const { trigger } = useVaultRefresh();
  const [state, setState] = useState({
    collateral: null,
    debt: null,
    healthFactor: null,
    loading: true,
    error: null,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  const fetchVault = useCallback(async (evmAddr) => {
    const provider = new JsonRpcProvider(RPC_URL);
    const vault = new Contract(VAULT_ADDRESS, ABI, provider);
    const [collateral, debt, health, guardianAddr, stablecoinAddr] = await Promise.all([
      vault.getCollateral(evmAddr),
      vault.getDebt(evmAddr),
      vault.getHealthFactor(evmAddr),
      vault.guardian(),
      vault.stablecoin(),
    ]);
    const guardian = guardianAddr && guardianAddr !== "0x0000000000000000000000000000000000000000" ? guardianAddr.toLowerCase() : null;
    const stablecoin = stablecoinAddr && stablecoinAddr !== "0x0000000000000000000000000000000000000000" ? stablecoinAddr.toLowerCase() : null;
    return { collateral: collateral.toString(), debt: debt.toString(), healthFactor: health.toString(), guardian, stablecoin };
  }, []);

  useEffect(() => {
    if (!address) {
      setState({ collateral: null, debt: null, healthFactor: null, guardian: null, stablecoin: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    const evmAddr = toEvmAddress(address);
    if (!evmAddr) {
      setState({ collateral: null, debt: null, healthFactor: null, guardian: null, stablecoin: null, loading: false, error: "Invalid address" });
      return;
    }

    setState((s) => ({ ...s, loading: true }));

    (async () => {
      try {
        const data = await fetchVault(evmAddr);
        if (!cancelled && data) {
          setState({ ...data, loading: false, error: null });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            collateral: null,
            debt: null,
            healthFactor: null,
            guardian: null,
            stablecoin: null,
            loading: false,
            error: e.message || "Vault fetch failed",
          });
        }
      }
    })();

    const POLL_MS = 10000;
    const id = setInterval(async () => {
      if (cancelled) return;
      try {
        const data = await fetchVault(evmAddr);
        if (!cancelled && data) {
          setState((s) => ({ ...s, ...data, loading: false, error: null }));
        }
      } catch {
        // Keep previous state on poll error
      }
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [address, refreshKey, trigger, fetchVault]);

  const healthPercent = state.healthFactor
    ? Math.min(200, Number(state.healthFactor) / 1e16).toFixed(1)
    : null;

  const hasPosition =
    state.collateral != null &&
    state.debt != null &&
    (Number(state.collateral) > 0 || Number(state.debt) > 0);

  return {
    ...state,
    healthPercent,
    hasPosition,
    refetch,
  };
}
