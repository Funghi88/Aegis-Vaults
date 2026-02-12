import { useState, useEffect, useCallback } from "react";
import { Contract, JsonRpcProvider, BrowserProvider } from "ethers";
import { addressToEvm } from "@polkadot/util-crypto";
import { RPC_URL } from "../config";
import { useVaultRefresh } from "../context/VaultRefreshContext";

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

function getProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new BrowserProvider(window.ethereum);
  }
  return new JsonRpcProvider(RPC_URL);
}

export function useWalletBalance(address, stablecoinAddr) {
  const { trigger } = useVaultRefresh();
  const [nativeBalance, setNativeBalance] = useState(null);
  const [pusdBalance, setPusdBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!address) {
      setNativeBalance(null);
      setPusdBalance(null);
      setLoading(false);
      setError(null);
      return;
    }

    const evmAddr = toEvmAddress(address);
    if (!evmAddr) {
      setNativeBalance(null);
      setPusdBalance(null);
      setLoading(false);
      setError("Invalid address");
      return;
    }

    let cancelled = false;
    setLoading(true);

    const fetchBalances = async () => {
      try {
        const provider = getProvider();
        const [native, pusd] = await Promise.all([
          provider.getBalance(evmAddr),
          stablecoinAddr
            ? new Contract(stablecoinAddr, ["function balanceOf(address) view returns (uint256)"], provider).balanceOf(evmAddr)
            : Promise.resolve(null),
        ]);
        if (!cancelled) {
          setNativeBalance(native.toString());
          setPusdBalance(pusd != null ? pusd.toString() : null);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setNativeBalance(null);
          setPusdBalance(null);
          setError(e.message || "Balance fetch failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBalances();

    const POLL_MS = 10000;
    const id = setInterval(fetchBalances, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [address, stablecoinAddr, refreshKey, trigger]);

  return { nativeBalance, pusdBalance, loading, error, refetch };
}
