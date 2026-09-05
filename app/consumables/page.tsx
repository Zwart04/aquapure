"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/app-context";
import { SENSORS } from "@/lib/sensors";
import { addConsumable, getConsumables, saveConsumables, useMounted } from "@/lib/store";
import { Boxes, Plus, AlertTriangle } from "lucide-react";
import { useToast } from "@/lib/toast";

export default function ConsumablesPage() {
  const { t } = useApp();
  const mounted = useMounted();
  const { push } = useToast();
  const [items, setItems] = useState<{ id: string; name: string; sensorId: string; remaining: number; total: number; reorderAt: number; unit: string }[]>([]);
  const [name, setName] = useState("");
  const [sensorId, setSensorId] = useState(SENSORS[0].id);
  const [total, setTotal] = useState(100);
  const [reorderAt, setReorderAt] = useState(20);

  useEffect(() => {
    if (!mounted) return;
    setItems(getConsumables());
  }, [mounted]);

  function submit() {
    if (!name.trim()) return;
    addConsumable({ name, sensorId, remaining: total, total, reorderAt, unit: "qty" });
    setName("");
    setItems(getConsumables());
  }

  function setRemaining(id: string, value: number) {
    const next = items.map((c) => (c.id === id ? { ...c, remaining: value } : c));
    setItems(next);
    saveConsumables(next);
    const updated = next.find((c) => c.id === id);
    if (updated && updated.remaining <= updated.reorderAt) {
      push(`${t.toast.reorderDue}: ${updated.name}`, "warning");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Boxes className="h-5 w-5 text-aqua-600" />
          {t.consumables.title}
        </h1>
        <p className="text-sm text-[color:var(--color-muted)] mt-1 max-w-2xl">{t.consumables.desc}</p>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5">
        <h2 className="font-semibold mb-3 inline-flex items-center gap-1.5"><Plus className="h-4 w-4" />{t.consumables.addItem}</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs">
            <span className="block mb-1 font-medium">{t.consumables.item}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-44 px-3 h-9 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)]" />
          </label>
          <label className="text-xs">
            <span className="block mb-1 font-medium">{t.consumables.sensor}</span>
            <select value={sensorId} onChange={(e) => setSensorId(e.target.value)} className="px-3 h-9 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
              {SENSORS.map((s) => (<option key={s.id} value={s.id}>{s.id} - {s.name}</option>))}
            </select>
          </label>
          <label className="text-xs">
            <span className="block mb-1 font-medium">Total</span>
            <input type="number" value={total} onChange={(e) => setTotal(parseInt(e.target.value) || 0)} className="w-20 px-3 h-9 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)]" />
          </label>
          <label className="text-xs">
            <span className="block mb-1 font-medium">{t.consumables.reorderAt}</span>
            <input type="number" value={reorderAt} onChange={(e) => setReorderAt(parseInt(e.target.value) || 0)} className="w-20 px-3 h-9 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)]" />
          </label>
          <button onClick={submit} className="h-9 px-4 rounded bg-aqua-600 text-white font-medium hover:bg-aqua-700">Add</button>
        </div>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-[color:var(--color-muted)] bg-aqua-50/40 dark:bg-aqua-900/20">
            <tr>
              <th className="text-left px-4 py-2">{t.consumables.item}</th>
              <th className="text-left px-4 py-2">{t.consumables.sensor}</th>
              <th className="text-left px-4 py-2">{t.consumables.remaining}</th>
              <th className="text-left px-4 py-2">{t.consumables.reorderAt}</th>
              <th className="text-left px-4 py-2">{t.consumables.autoDecrement}</th>
            </tr>
          </thead>
          <tbody>
            {mounted && items.map((c) => {
              const sensor = SENSORS.find((s) => s.id === c.sensorId);
              const low = c.remaining <= c.reorderAt;
              const pct = Math.max(0, Math.min(100, (c.remaining / c.total) * 100));
              return (
                <tr key={c.id} className="border-t border-[color:var(--color-border)]">
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2">{sensor ? `${sensor.id} - ${sensor.name}` : c.sensorId}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-aqua-100 rounded-full overflow-hidden">
                        <div className={`h-full ${low ? "bg-red-500" : "bg-aqua-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-mono text-xs">{c.remaining.toFixed(1)} {c.unit}</span>
                      {low && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                    </div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{c.reorderAt}</td>
                  <td className="px-4 py-2">
                    <input type="range" min={0} max={c.total} value={c.remaining} onChange={(e) => setRemaining(c.id, parseFloat(e.target.value))} className="w-32 accent-aqua-600" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
