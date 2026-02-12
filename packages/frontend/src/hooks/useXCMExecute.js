import { useState, useCallback } from "react";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3Enable, web3Accounts, web3FromAddress } from "@polkadot/extension-dapp";
import { decodeAddress } from "@polkadot/util-crypto";

import { WS_ENDPOINT } from "../config";
const APP_NAME = "Aegis Vaults";

export function useXCMExecute() {
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [polkadotAddress, setPolkadotAddress] = useState(null);
  const [error, setError] = useState(null);

  const connectPolkadot = useCallback(async () => {
    setError(null);
    try {
      const extensions = await web3Enable(APP_NAME);
      if (!extensions?.length) {
        setError("Install a Polkadot wallet (Talisman, Polkadot.js, SubWallet)");
        return null;
      }
      const accounts = await web3Accounts();
      if (!accounts?.length) {
        setError("No accounts found. Approve the connection in your wallet.");
        return null;
      }
      setPolkadotAddress(accounts[0].address);
      return accounts[0].address;
    } catch (e) {
      setError(e.message || "Failed to connect Polkadot wallet");
      return null;
    }
  }, []);

  const disconnectPolkadot = useCallback(() => {
    setPolkadotAddress(null);
  }, []);

  const executeXCM = useCallback(async ({ destParaId, amount, recipient }) => {
    if (!polkadotAddress || !recipient?.trim()) {
      setError("Connect Polkadot wallet and enter recipient (SS58)");
      return null;
    }
    setLoading(true);
    setError(null);

    let apiInstance = api;
    if (!apiInstance) {
      try {
        const provider = new WsProvider(WS_ENDPOINT);
        apiInstance = await ApiPromise.create({ provider });
        await apiInstance.isReady;
        setApi(apiInstance);
      } catch (e) {
        setLoading(false);
        setError("Failed to connect to chain: " + (e.message || e));
        return null;
      }
    }

    try {
      let recipientIdHex;
      const rec = recipient.trim();
      if (rec.startsWith("0x") && /^0x[0-9a-fA-F]{64}$/.test(rec)) {
        recipientIdHex = rec;
      } else {
        const bytes = decodeAddress(rec);
        recipientIdHex = "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      }

      const ver = "V4";
      const junction = (j) => [j];
      const destination =
        destParaId === 0
          ? { [ver]: { parents: 1, interior: { Here: null } } }
          : { [ver]: { parents: 1, interior: { X1: junction({ Parachain: destParaId }) } } };

      const beneficiary = {
        [ver]: {
          parents: 0,
          interior: { X1: junction({ AccountId32: { network: null, id: recipientIdHex } }) },
        },
      };

      const assetLocation = { parents: 0, interior: { Here: null } };
      const assets = { [ver]: [{ id: assetLocation, fun: { Fungible: BigInt(amount) } }] };
      const feeAssetItem = 0;
      const weightLimit = { Unlimited: null };

      const tx = apiInstance.tx.polkadotXcm.limitedTeleportAssets(
        destination,
        beneficiary,
        assets,
        feeAssetItem,
        weightLimit
      );

      const injector = await web3FromAddress(polkadotAddress);

      return new Promise((resolve, reject) => {
        tx.signAndSend(polkadotAddress, { signer: injector.signer }, ({ status, txHash }) => {
          if (status.isFinalized) {
            setLoading(false);
            resolve({ hash: txHash.toHex(), success: true });
          }
        }).catch((e) => {
          setLoading(false);
          setError(e.message || "XCM execution failed");
          reject(e);
        });
      });
    } catch (e) {
      setLoading(false);
      setError(e.message || "XCM execution failed");
      return { success: false, error: e.message };
    }
  }, [api, polkadotAddress]);

  return {
    polkadotAddress,
    connectPolkadot,
    disconnectPolkadot,
    executeXCM,
    loading,
    error,
    setError,
  };
}
