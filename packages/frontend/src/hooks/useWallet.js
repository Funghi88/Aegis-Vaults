import { useState, useEffect, useCallback } from "react";
import { web3Enable, web3Accounts, isWeb3Injected } from "@polkadot/extension-dapp";
import { CHAIN_ID, RPC_URL } from "../config";

const APP_NAME = "Aegis Vaults";

export function useWallet() {
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [hasExtension, setHasExtension] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchChainId = useCallback(async () => {
    if (!window.ethereum) return null;
    try {
      const id = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(Number(id));
      return Number(id);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const hasMetaMask = typeof window !== "undefined" && !!window.ethereum;
    setHasExtension(hasMetaMask || isWeb3Injected);
    setLoading(false);
  }, []);

  // Restore connection on load (no popup). MetaMask and Polkadot remember per-site connections.
  const restoreConnection = useCallback(async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts?.[0]) {
          setAddress(accounts[0]);
          fetchChainId();
          return;
        }
      } catch {
        // ignore
      }
    }
    if (isWeb3Injected) {
      try {
        const accounts = await web3Accounts();
        if (accounts?.length) {
          setAddress(accounts[0].address);
          return;
        }
      } catch {
        // ignore
      }
    }
  }, [fetchChainId]);

  useEffect(() => {
    restoreConnection();
  }, [restoreConnection]);

  useEffect(() => {
    if (!window.ethereum) return;
    fetchChainId();
    const handler = () => fetchChainId();
    window.ethereum.on?.("chainChanged", handler);
    return () => window.ethereum.removeListener?.("chainChanged", handler);
  }, [fetchChainId]);

  // Re-check accounts when MetaMask emits account change (e.g. user switches account)
  useEffect(() => {
    if (!window.ethereum) return;
    const handler = (accounts) => {
      setAddress(accounts?.[0] || null);
    };
    window.ethereum.on?.("accountsChanged", handler);
    return () => window.ethereum.removeListener?.("accountsChanged", handler);
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum) return null;
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      return accounts?.[0] || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const connectPolkadot = async () => {
    if (!isWeb3Injected) return null;
    try {
      const extensions = await web3Enable(APP_NAME);
      if (!extensions?.length) return null;
      const accounts = await web3Accounts();
      return accounts?.length ? accounts[0].address : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const switchChain = useCallback(async () => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
      });
      await fetchChainId();
      return true;
    } catch {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: `0x${CHAIN_ID.toString(16)}`,
            chainName: "Hardhat Local",
            rpcUrls: [RPC_URL],
          }],
        });
        await fetchChainId();
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    }
  }, [fetchChainId]);

  const connect = async () => {
    if (!window.ethereum && !isWeb3Injected) {
      alert("Install MetaMask or a Polkadot wallet (Talisman, Polkadot.js, SubWallet).");
      return;
    }
    try {
      // Try MetaMask first (EVM)
      const metaAddr = await connectMetaMask();
      if (metaAddr) {
        setAddress(metaAddr);
        fetchChainId();
        return metaAddr;
      }
      // Fallback to Polkadot
      const polkAddr = await connectPolkadot();
      if (polkAddr) {
        setAddress(polkAddr);
        return polkAddr;
      }
      alert("No wallet approved. Please approve the connection in your wallet.");
      return null;
    } catch (e) {
      console.error(e);
      alert("Failed to connect. Please try again.");
      return null;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setChainId(null);
  };

  const isCorrectChain = chainId != null && chainId === CHAIN_ID;

  return {
    address,
    chainId,
    isCorrectChain,
    switchChain,
    extension: hasExtension,
    loading,
    connect,
    disconnect,
    fetchChainId,
  };
}
