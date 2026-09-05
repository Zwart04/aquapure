"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/lib/app-context";
import { getVisits, useMounted } from "@/lib/store";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const { t } = useApp();
  const mounted = useMounted();
  const [data, setData] = useState<{ source: string; count: number }[]>([]);

  useEffect(() => {
    if (!mounted) return;
    setData(getVisits());
  }, [mounted]);

  const total = data.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-aqua-600" />
          {t.analytics.title}
        </h1>
        <p className="text-sm text-[color:var(--color-muted)] mt-1 max-w-2xl">{t.analytics.desc}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5">
          <div className="text-xs text-[color:var(--color-muted)]">Total visits (this browser)</div>
          <div className="text-3xl font-bold mt-1">{total}</div>
        </div>
        <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5">
          <div className="text-xs text-[color:var(--color-muted)]">Distinct sources</div>
          <div className="text-3xl font-bold mt-1">{data.length}</div>
        </div>
        <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5">
          <div className="text-xs text-[color:var(--color-muted)]">Tracker scripts loaded</div>
          <div className="text-3xl font-bold mt-1 text-emerald-600">0</div>
          <div className="text-xs text-[color:var(--color-muted)] mt-1">No fbq / gtag / NEXT_PUBLIC_*_ADS_ID</div>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="rgba(100,116,139,0.2)" strokeDasharray="3 3" />
            <XAxis dataKey="source" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, backgroundColor: "rgba(15,23,42,0.92)", color: "#f8fafc", border: "none" }} />
            <Bar dataKey="count" fill="#0891b2" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-[color:var(--color-muted)]">
        Tip: open the app with <code className="px-1 bg-aqua-50 dark:bg-aqua-900/30 rounded">?utm_source=newsletter</code> or <code className="px-1 bg-aqua-50 dark:bg-aqua-900/30 rounded">?utm_source=linkedin</code> to record attributed visits. Persistence is browser-local via <code className="px-1 bg-aqua-50 dark:bg-aqua-900/30 rounded">localStorage</code> — no third-party trackers, no pixels.
      </div>
    </div>
  );
}
