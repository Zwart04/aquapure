"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { useApp } from "@/lib/app-context";
import { SENSORS, generateHistory } from "@/lib/sensors";
import { linearForecast } from "@/lib/classifier";
import { TrendingUp } from "lucide-react";

const PARAMS = [
  { key: "ph", label: "pH", color: "#0891b2" },
  { key: "tds", label: "TDS", color: "#16a34a" },
  { key: "cl", label: "Chlorine", color: "#a855f7" },
  { key: "turb", label: "Turbidity", color: "#ea580c" },
  { key: "temp", label: "Temperature", color: "#dc2626" },
] as const;

export default function ForecastPage() {
  const { t } = useApp();
  const [sensorId, setSensorId] = useState(SENSORS[0].id);
  const [param, setParam] = useState<typeof PARAMS[number]["key"]>("tds");
  const [horizon, setHorizon] = useState(24); // hours

  const data = useMemo(() => {
    const history = generateHistory(sensorId, 168, 60);
    const series = history.map((r) => ({ ts: r.ts, v: r[param] }));
    return linearForecast(series, horizon * 3600_000, 60);
  }, [sensorId, param, horizon]);

  const chartData = useMemo(() => {
    return data.map((p) => ({
      ts: new Date(p.ts).toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit" }),
      history: p.history !== undefined ? Number(p.history.toFixed(3)) : undefined,
      forecast: p.forecast !== undefined ? Number(p.forecast.toFixed(3)) : undefined,
      upper: p.upper !== undefined ? Number(p.upper.toFixed(3)) : undefined,
      lower: p.lower !== undefined ? Number(p.lower.toFixed(3)) : undefined,
    }));
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-aqua-600" />
          {t.forecast.title}
        </h1>
        <p className="text-sm text-[color:var(--color-muted)] mt-1 max-w-2xl">{t.forecast.desc}</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <label className="text-xs">
          <span className="block mb-1 font-medium">Sensor</span>
          <select value={sensorId} onChange={(e) => setSensorId(e.target.value)} className="px-3 h-9 rounded border border-[color:var(--color-border)] bg-[color:var(--color-card)]">
            {SENSORS.map((s) => (<option key={s.id} value={s.id}>{s.id} - {s.name}</option>))}
          </select>
        </label>
        <label className="text-xs">
          <span className="block mb-1 font-medium">Parameter</span>
          <select value={param} onChange={(e) => setParam(e.target.value as typeof PARAMS[number]["key"])} className="px-3 h-9 rounded border border-[color:var(--color-border)] bg-[color:var(--color-card)]">
            {PARAMS.map((p) => (<option key={p.key} value={p.key}>{p.label}</option>))}
          </select>
        </label>
        <label className="text-xs">
          <span className="block mb-1 font-medium">{t.forecast.horizon} (h)</span>
          <input type="number" min={1} max={72} value={horizon} onChange={(e) => setHorizon(parseInt(e.target.value) || 24)} className="w-20 px-3 h-9 rounded border border-[color:var(--color-border)] bg-[color:var(--color-card)]" />
        </label>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4" style={{ height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid stroke="rgba(100,116,139,0.2)" strokeDasharray="3 3" />
            <XAxis dataKey="ts" tick={{ fontSize: 10 }} interval={Math.max(1, Math.floor(chartData.length / 12))} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 12, backgroundColor: "rgba(15,23,42,0.92)", color: "#f8fafc", border: "none" }} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="#0891b2" fillOpacity={0.1} isAnimationActive={false} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#0891b2" fillOpacity={0.1} isAnimationActive={false} />
            <Line type="monotone" dataKey="history" stroke="#0e7490" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="forecast" stroke="#dc2626" strokeWidth={2} strokeDasharray="6 3" dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 text-xs text-[color:var(--color-muted)]">
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-4 bg-[#0e7490]" />7-day history</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-4 bg-[#dc2626]" style={{ backgroundImage: "repeating-linear-gradient(90deg,#dc2626 0 4px,transparent 4px 7px)" }} />Forecast (linear regression)</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-4 bg-[#0891b2] opacity-30" />Confidence band (1 std dev)</span>
      </div>
    </div>
  );
}
