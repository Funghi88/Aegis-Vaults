import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ type = "info", message, duration = 4000 }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((msg) => toast({ type: "success", message: msg }), [toast]);
  const error = useCallback((msg) => toast({ type: "error", message: msg, duration: 6000 }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "1.5rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "0.75rem 1.25rem",
              background: t.type === "error" ? "#c00" : "var(--dark)",
              color: "white",
              fontSize: "0.9rem",
              borderRadius: 4,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx || { toast: () => {}, success: () => {}, error: () => {} };
}
