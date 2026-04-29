"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";

type ToastRecord = {
  id: number;
  title: string;
  tone: ToastTone;
};

const ToastContext = createContext<{
  pushToast: (toast: Omit<ToastRecord, "id">) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const pushToast = useCallback((toast: Omit<ToastRecord, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-atomic="true"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] mx-auto flex w-full max-w-xl flex-col gap-3 px-4"
        role="status"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-soft backdrop-blur ${
              toast.tone === "success"
                ? "border-emerald-200 bg-emerald-50/95 text-emerald-800"
                : toast.tone === "error"
                  ? "border-rose-200 bg-rose-50/95 text-rose-800"
                  : "border-ink-200 bg-white/95 text-ink-800"
            }`}
          >
            <p className="text-sm font-medium">{toast.title}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
