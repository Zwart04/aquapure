"use client";

import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { classifyReading } from "@/lib/classifier";
import { pushClassification, getClassifications, useMounted } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { Sparkles, RotateCcw } from "lucide-react";

export default function ClassifierPage() {
  const { t, mounted: ctxMounted } = useApp();
  const { push } = useToast();
  const mounted = useMounted() && ctxMounted;
  const [ph, setPh] = useState(7.2);
  const [tds, setTds] = useState(380);
  const [cl, setCl] = useState(0.6);
  const [turb, setTurb] = useState(2.0);
  const [temp, setTemp] = useState(27.5);
  const [history, setHistory] = useState(() => getClassifications());

  function classify() {
    const r = classifyReading({ ts: Date.now(), sensorId: "manual", ph, tds, cl, turb, temp });
    pushClassification({ id: crypto.randomUUID(), ts: Date.now(), input: { ph, tds, cl, turb, temp }, score: r.riskScore, status: r.status });
    setHistory(getClassifications());
    push(`${t.toast.classified}: ${r.riskScore} (${r.status})`, r.status === "critical" ? "critical" : r.status === "marginal" ? "warning" : "success");
  }

  function reset() {
    setPh(7.2); setTds(380); setCl(0.6); setTurb(2.0); setTemp(27.5);
  }

  // preview result on every change
  const preview = classifyReading({ ts: Date.now(), sensorId: "preview", ph, tds, cl, turb, temp });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-aqua-600" />
          {t.classifier.title}
        </h1>
        <p className="text-sm text-[color:var(--color-muted)] mt-1 max-w-2xl">{t.classifier.desc}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5 space-y-4">
          {([
            { label: "pH", value: ph, set: setPh, min: 4, max: 10, step: 0.1 },
            { label: "TDS (ppm)", value: tds, set: setTds, min: 0, max: 2000, step: 10 },
            { label: "Chlorine (ppm)", value: cl, set: setCl, min: 0, max: 3, step: 0.05 },
            { label: "Turbidity (NTU)", value: turb, set: setTurb, min: 0, max: 40, step: 0.1 },
            { label: "Temperature (C)", value: temp, set: setTemp, min: 20, max: 35, step: 0.1 },
          ] as const).map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{f.label}</span>
                <span className="font-mono">{f.value.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={f.value}
                onChange={(e) => f.set(parseFloat(e.target.value))}
                className="w-full accent-aqua-600"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button onClick={classify} className="px-4 h-10 rounded bg-aqua-600 text-white font-medium hover:bg-aqua-700 inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> {t.classifier.classify}
            </button>
            <button onClick={reset} className="px-4 h-10 rounded border border-[color:var(--color-border)] hover:bg-aqua-50 dark:hover:bg-aqua-900/30 inline-flex items-center gap-1.5">
              <RotateCcw className="h-4 w-4" /> {t.classifier.reset}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5 space-y-4">
          <div>
            <div className="text-xs text-[color:var(--color-muted)]">{t.classifier.score}</div>
            <div className="text-4xl font-bold mt-1" style={{ color: preview.status === "critical" ? "#dc2626" : preview.status === "marginal" ? "#eab308" : "#16a34a" }}>
              {preview.riskScore}
            </div>
          </div>
          <div>
            <div className="text-xs text-[color:var(--color-muted)]">{t.classifier.verdict}</div>
            <div className="font-semibold mt-1">{preview.verdict}</div>
          </div>
          <div>
            <div className="text-xs text-[color:var(--color-muted)] mb-1">{t.classifier.reasoning}</div>
            <ul className="text-sm space-y-1">
              {preview.reasoning.map((r, i) => (
                <li key={i} className="text-[color:var(--color-muted)]">- {r}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5">
        <h2 className="font-semibold mb-3">{t.classifier.history}</h2>
        {mounted && history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[color:var(--color-muted)]">
                <tr className="border-b border-[color:var(--color-border)]">
                  <th className="text-left py-2 pr-4">Time</th>
                  <th className="text-left py-2 pr-4">pH</th>
                  <th className="text-left py-2 pr-4">TDS</th>
                  <th className="text-left py-2 pr-4">Cl</th>
                  <th className="text-left py-2 pr-4">Turb</th>
                  <th className="text-left py-2 pr-4">Temp</th>
                  <th className="text-left py-2 pr-4">Score</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 12).map((h) => (
                  <tr key={h.id} className="border-b border-[color:var(--color-border)] last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{new Date(h.ts).toLocaleTimeString()}</td>
                    <td className="py-2 pr-4 font-mono">{h.input.ph.toFixed(2)}</td>
                    <td className="py-2 pr-4 font-mono">{h.input.tds.toFixed(0)}</td>
                    <td className="py-2 pr-4 font-mono">{h.input.cl.toFixed(2)}</td>
                    <td className="py-2 pr-4 font-mono">{h.input.turb.toFixed(1)}</td>
                    <td className="py-2 pr-4 font-mono">{h.input.temp.toFixed(1)}</td>
                    <td className="py-2 pr-4 font-mono font-semibold">{h.score}</td>
                    <td className="py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        h.status === "critical" ? "bg-red-100 text-red-700" :
                        h.status === "marginal" ? "bg-amber-100 text-amber-800" :
                        "bg-emerald-100 text-emerald-800"
                      }`}>{h.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-[color:var(--color-muted)]">No classifications yet.</div>
        )}
      </div>
    </div>
  );
}
