"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type ToastVariant = "default" | "success" | "warning" | "critical";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  ttl: number;
}

interface ToastCtx {
  toasts: Toast[];
  push: (message: string, variant?: ToastVariant, ttl?: number) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: ToastVariant = "default", ttl = 4500) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, variant, ttl }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, ttl);
  }, []);

  return (
    <Ctx.Provider value={{ toasts, push }}>{children}</Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast must be inside ToastProvider");
  return v;
}

export function ToastViewport() {
  const { toasts } = useToast();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const bg = t.variant === "critical" ? "bg-red-600 text-white" :
          t.variant === "warning" ? "bg-amber-500 text-white" :
          t.variant === "success" ? "bg-emerald-600 text-white" :
          "bg-slate-800 text-white";
        return (
          <div key={t.id} className={`${bg} rounded-lg shadow-lg px-4 py-3 text-sm font-medium pointer-events-auto animate-in fade-in slide-in-from-top-2`}>
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
