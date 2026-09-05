"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/lib/app-context";
import { getFinance, useMounted } from "@/lib/store";
import { Wallet, TrendingUp } from "lucide-react";

export default function FinancePage() {
  const { t } = useApp();
  const mounted = useMounted();
  const [entries, setEntries] = useState<{ id: string; ts: number; source: string; description: string; amountIdr: number }[]>([]);

  useEffect(() => {
    if (!mounted) return;
    setEntries(getFinance());
    const id = window.setInterval(() => setEntries(getFinance()), 3000);
    return () => window.clearInterval(id);
  }, [mounted]);

  const cumulative = (() => {
    const sorted = [...entries].sort((a, b) => a.ts - b.ts);
    let running = 0;
    return sorted.map((e) => {
      running += e.amountIdr;
      return { ts: e.ts, label: new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), amount: e.amountIdr, cumulative: running };
    });
  })();

  const totalIdr = entries.reduce((a, b) => a + b.amountIdr, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-aqua-600" />
            {t.finance.title}
          </h1>
          <p className="text-sm text-[color:var(--color-muted)] mt-1">{t.finance.desc}</p>
        </div>
        <div className="rounded-lg bg-aqua-50 dark:bg-aqua-900/30 px-4 py-2 text-right">
          <div className="text-xs text-[color:var(--color-muted)]">Total</div>
          <div className="text-xl font-bold text-aqua-700 dark:text-aqua-300">Rp {totalIdr.toLocaleString("id-ID")}</div>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulative}>
            <CartesianGrid stroke="rgba(100,116,139,0.2)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={Math.max(1, Math.floor(cumulative.length / 12))} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 12, backgroundColor: "rgba(15,23,42,0.92)", color: "#f8fafc", border: "none" }} />
            <Area type="monotone" dataKey="cumulative" stroke="#0891b2" fill="#0891b2" fillOpacity={0.25} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-[color:var(--color-muted)] inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />{t.finance.cumulative}</div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-[color:var(--color-muted)] bg-aqua-50/40 dark:bg-aqua-900/20">
            <tr>
              <th className="text-left px-4 py-2">Time</th>
              <th className="text-left px-4 py-2">{t.finance.source}</th>
              <th className="text-left px-4 py-2">{t.finance.description}</th>
              <th className="text-right px-4 py-2">{t.finance.amount}</th>
            </tr>
          </thead>
          <tbody>
            {mounted && entries.length > 0 ? entries.slice(0, 30).map((e) => (
              <tr key={e.id} className="border-t border-[color:var(--color-border)]">
                <td className="px-4 py-2 font-mono text-xs">{new Date(e.ts).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    e.source === "auto-alert" ? "bg-red-100 text-red-700" :
                    e.source === "auto-consumable" ? "bg-amber-100 text-amber-800" :
                    "bg-aqua-100 text-aqua-800"
                  }`}>{e.source}</span>
                </td>
                <td className="px-4 py-2">{e.description}</td>
                <td className="px-4 py-2 text-right font-mono">Rp {e.amountIdr.toLocaleString("id-ID")}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-[color:var(--color-muted)]">No finance entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
