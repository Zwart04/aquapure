"use client";

import { useApp } from "@/lib/app-context";
import { useTelemetry } from "@/lib/use-telemetry";
import { SENSORS, THRESHOLDS, statusOf } from "@/lib/sensors";
import { Sparkline } from "@/components/sparkline";
import { Pause, Play, Activity } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useToast } from "@/lib/toast";
import { pushAlert, pushFinance, decrementConsumable, getConsumables } from "@/lib/store";

const PARAM_KEYS = [
  { key: "ph", label: "ph", color: "#0891b2", threshold: THRESHOLDS.ph, fmt: (v: number) => v.toFixed(2) },
  { key: "tds", label: "tds", color: "#16a34a", threshold: THRESHOLDS.tds, fmt: (v: number) => v.toFixed(0) },
  { key: "cl", label: "cl", color: "#a855f7", threshold: THRESHOLDS.cl, fmt: (v: number) => v.toFixed(2) },
  { key: "turb", label: "turb", color: "#ea580c", threshold: THRESHOLDS.turb, fmt: (v: number) => v.toFixed(1) },
  { key: "temp", label: "temp", color: "#dc2626", threshold: THRESHOLDS.temp, fmt: (v: number) => v.toFixed(1) },
] as const;

export default function DashboardPage() {
  const { t } = useApp();
  const { paused, togglePause, latest, series, totalCount } = useTelemetry();
  const { push } = useToast();

  // alert detection (use latest + history of marginal / critical transitions)
  const lastStatusRef = useRef<Record<string, string>>({});
  useEffect(() => {
    SENSORS.forEach((s) => {
      const r = latest[s.id];
      if (!r) return;
      const worst = (
        ["ph", "tds", "cl", "turb", "temp"] as const
      )
        .map((k) => statusOf(r[k], THRESHOLDS[k]))
        .reduce<"safe" | "marginal" | "critical">((acc, cur) => {
          if (cur === "critical") return "critical";
          if (cur === "marginal" && acc !== "critical") return "marginal";
          return acc;
        }, "safe");

      const key = s.id + ":" + worst;
      if (lastStatusRef.current[s.id] !== key) {
        lastStatusRef.current[s.id] = key;
        if (worst === "critical") {
          pushAlert({
            id: crypto.randomUUID(),
            ts: Date.now(),
            sensorId: s.id,
            parameter: "composite",
            value: worst === "critical" ? 1 : 0,
            severity: "critical",
            message: `${s.name} composite status CRITICAL`,
          });
          push(`${s.name}: ${t.toast.alertCritical}`, "critical");
          pushFinance({ id: crypto.randomUUID(), ts: Date.now(), source: "auto-alert", description: `Critical alert ${s.name}`, amountIdr: 5000 });
        } else if (worst === "marginal") {
          pushAlert({
            id: crypto.randomUUID(),
            ts: Date.now(),
            sensorId: s.id,
            parameter: "composite",
            value: 0.5,
            severity: "marginal",
            message: `${s.name} composite status MARGINAL`,
          });
          pushFinance({ id: crypto.randomUUID(), ts: Date.now(), source: "auto-alert", description: `Marginal alert ${s.name}`, amountIdr: 1500 });
        }
        // auto-decrement consumable per sensor every reading
        decrementConsumable(s.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest]);

  const avgPerSensor = useMemo(() => {
    return Object.fromEntries(
      SENSORS.map((s) => {
        const arr = series[s.id] || [];
        const mean = arr.length ? arr.reduce((a, b) => a + b.ph, 0) / arr.length : 0;
        return [s.id, mean];
      })
    );
  }, [series]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-aqua-600" />
          {t.dash.liveStream}
        </h1>
        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className={`h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot`} />
          {totalCount} {t.dash.liveCount}
        </span>
        <button onClick={togglePause} className="text-xs px-3 h-8 rounded border border-[color:var(--color-border)] hover:bg-aqua-50 dark:hover:bg-aqua-900/30 inline-flex items-center gap-1.5">
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          {paused ? t.dash.resume : t.dash.pause}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SENSORS.map((s) => {
          const r = latest[s.id];
          if (!r) return null;
          const seriesData = series[s.id] || [];
          return (
            <div key={s.id} className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-xs text-[color:var(--color-muted)]">{s.id}</div>
                  <div className="font-medium leading-tight">{s.name}</div>
                  <div className="text-[10px] uppercase tracking-wide text-[color:var(--color-muted)] mt-0.5">{s.kind} - {s.region}</div>
                </div>
                <StatusBadge
                  worst={
                    (["ph", "tds", "cl", "turb", "temp"] as const)
                      .map((k) => statusOf(r[k], THRESHOLDS[k]))
                      .reduce<"safe" | "marginal" | "critical">((acc, cur) =>
                        cur === "critical" ? "critical" : cur === "marginal" && acc !== "critical" ? "marginal" : acc,
                        "safe"
                      )
                  }
                  t={t}
                />
              </div>
              <div className="grid grid-cols-5 gap-1 mt-3">
                {PARAM_KEYS.map((p) => (
                  <div key={p.key} className="text-center">
                    <div className="text-[10px] text-[color:var(--color-muted)]">{t.dash[`param${p.label.charAt(0).toUpperCase() + p.label.slice(1)}` as keyof typeof t.dash]}</div>
                    <div className="text-sm font-mono font-semibold" style={{ color: p.color }}>{p.fmt(r[p.key])}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Sparkline
                  data={seriesData.map((d) => ({ ts: d.ts, v: d.ph }))}
                  color="#0891b2"
                  threshold={THRESHOLDS.ph}
                  paramMin={5}
                  paramMax={9.5}
                />
                <div className="text-[10px] text-[color:var(--color-muted)] mt-1">{t.dash.sparkline} pH | avg 24h (rolling) {avgPerSensor[s.id]?.toFixed(2) ?? "0.00"}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ worst, t }: { worst: "safe" | "marginal" | "critical"; t: ReturnType<typeof useApp>["t"] }) {
  const cls =
    worst === "critical"
      ? "bg-red-100 text-red-700 border-red-200"
      : worst === "marginal"
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-emerald-100 text-emerald-800 border-emerald-200";
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cls}`}>
      {worst === "safe" && t.dash.statusSafe}
      {worst === "marginal" && t.dash.statusMarginal}
      {worst === "critical" && t.dash.statusCritical}
    </span>
  );
}
