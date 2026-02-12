import { createContext, useContext, useState, useCallback } from "react";

const VaultRefreshContext = createContext(null);

export function VaultRefreshProvider({ children }) {
  const [trigger, setTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setTrigger((t) => t + 1);
  }, []);

  return (
    <VaultRefreshContext.Provider value={{ trigger, triggerRefresh }}>
      {children}
    </VaultRefreshContext.Provider>
  );
}

export function useVaultRefresh() {
  const ctx = useContext(VaultRefreshContext);
  return ctx || { trigger: 0, triggerRefresh: () => {} };
}
