"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/app-context";
import { SENSORS, generateHistory } from "@/lib/sensors";
import { meanOf, stdOf } from "@/lib/classifier";
import { getReports, pushReport, pushFinance, useMounted } from "@/lib/store";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/lib/toast";

export default function ReportsPage() {
  const { t } = useApp();
  const mounted = useMounted();
  const { push } = useToast();
  const [sensorId, setSensorId] = useState(SENSORS[0].id);
  const [days, setDays] = useState(7);
  const [history, setHistory] = useState<{ id: string; ts: number; sensorId: string; fileName: string; fromTs: number; toTs: number }[]>([]);

  useEffect(() => {
    if (!mounted) return;
    setHistory(getReports());
  }, [mounted]);

  const dataset = useMemo(() => generateHistory(sensorId, days * 24, 30), [sensorId, days]);

  async function generate() {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const sensor = SENSORS.find((s) => s.id === sensorId)!;
    const fromTs = dataset[0].ts;
    const toTs = dataset[dataset.length - 1].ts;
    const summary = {
      ph: { mean: meanOf(dataset.map((d) => d.ph)), std: stdOf(dataset.map((d) => d.ph)) },
      tds: { mean: meanOf(dataset.map((d) => d.tds)), std: stdOf(dataset.map((d) => d.tds)) },
      cl: { mean: meanOf(dataset.map((d) => d.cl)), std: stdOf(dataset.map((d) => d.cl)) },
      turb: { mean: meanOf(dataset.map((d) => d.turb)), std: stdOf(dataset.map((d) => d.turb)) },
      temp: { mean: meanOf(dataset.map((d) => d.temp)), std: stdOf(dataset.map((d) => d.temp)) },
    };

    doc.setFontSize(16);
    doc.text("AquaPure Compliance Report", 40, 50);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`BPOM/Depkes-style water quality summary`, 40, 66);
    doc.setTextColor(20);
    doc.text(`Sensor: ${sensor.id} - ${sensor.name}`, 40, 84);
    doc.text(`Region: ${sensor.region}  Kind: ${sensor.kind}`, 40, 98);
    doc.text(`Window: ${new Date(fromTs).toLocaleString()}  to  ${new Date(toTs).toLocaleString()}`, 40, 112);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 126);

    doc.setFontSize(12);
    doc.text("Summary statistics", 40, 152);
    autoTable(doc, {
      startY: 160,
      head: [["Parameter", "Mean", "Std Dev", "Unit"]],
      body: [
        ["pH", summary.ph.mean.toFixed(2), summary.ph.std.toFixed(2), "-"],
        ["TDS", summary.tds.mean.toFixed(1), summary.tds.std.toFixed(1), "ppm"],
        ["Chlorine", summary.cl.mean.toFixed(2), summary.cl.std.toFixed(2), "ppm"],
        ["Turbidity", summary.turb.mean.toFixed(1), summary.turb.std.toFixed(1), "NTU"],
        ["Temperature", summary.temp.mean.toFixed(1), summary.temp.std.toFixed(1), "C"],
      ],
      styles: { fontSize: 9 },
    });

    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20,
      head: [["Timestamp", "pH", "TDS", "Cl", "Turb", "Temp"]],
      body: dataset.slice(-24).map((d) => [
        new Date(d.ts).toLocaleString(),
        d.ph.toFixed(2),
        d.tds.toFixed(0),
        d.cl.toFixed(2),
        d.turb.toFixed(1),
        d.temp.toFixed(1),
      ]),
      styles: { fontSize: 8 },
    });

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
    doc.setFontSize(10);
    doc.text("Conclusion", 40, finalY);
    doc.setFontSize(9);
    const verdict =
      summary.ph.mean >= 6.5 && summary.ph.mean <= 8.5
        ? "Average pH within BPOM safe range (6.5-8.5). Continue scheduled sampling."
        : "Average pH OUT OF BPOM safe range. Immediate retest + corrective action required.";
    doc.text(verdict, 40, finalY + 14, { maxWidth: 515 });

    doc.setFontSize(9);
    doc.text("Signed: AquaPure automated pipeline  |  No third-party trackers used.", 40, finalY + 80);

    const fileName = `aquapure-${sensorId}-${new Date(fromTs).toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    pushReport({ id: crypto.randomUUID(), ts: Date.now(), sensorId, fromTs, toTs, fileName });
    pushFinance({ id: crypto.randomUUID(), ts: Date.now(), source: "auto-export", description: `Compliance report ${sensorId}`, amountIdr: 2500 });
    setHistory(getReports());
    push(t.toast.reportReady, "success");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-aqua-600" />
          {t.reports.title}
        </h1>
        <p className="text-sm text-[color:var(--color-muted)] mt-1 max-w-2xl">{t.reports.desc}</p>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5 flex flex-wrap items-end gap-4">
        <label className="text-xs">
          <span className="block mb-1 font-medium">{t.reports.sensor}</span>
          <select value={sensorId} onChange={(e) => setSensorId(e.target.value)} className="px-3 h-9 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
            {SENSORS.map((s) => (<option key={s.id} value={s.id}>{s.id} - {s.name}</option>))}
          </select>
        </label>
        <label className="text-xs">
          <span className="block mb-1 font-medium">{t.reports.from} (days back)</span>
          <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(parseInt(e.target.value) || 1)} className="w-24 px-3 h-9 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg)]" />
        </label>
        <button onClick={generate} className="h-9 px-4 rounded bg-aqua-600 text-white font-medium hover:bg-aqua-700 inline-flex items-center gap-1.5">
          <Download className="h-4 w-4" />{t.reports.generate}
        </button>
      </div>

      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5">
        <h2 className="font-semibold mb-3">{t.reports.history}</h2>
        {!mounted || history.length === 0 ? (
          <div className="text-sm text-[color:var(--color-muted)]">No reports yet.</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.slice(0, 12).map((r) => (
              <li key={r.id} className="flex items-center justify-between border-b border-[color:var(--color-border)] pb-2 last:border-0">
                <span><FileText className="inline h-3.5 w-3.5 mr-1.5 text-aqua-600" />{r.fileName}</span>
                <span className="text-xs text-[color:var(--color-muted)] font-mono">{new Date(r.ts).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
