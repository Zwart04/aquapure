"use client";

import { useEffect, useRef, useState } from "react";
import { SENSORS, THRESHOLDS, statusOf, type Reading } from "@/lib/sensors";
import { useApp } from "@/lib/app-context";

interface Props {
  latest: Record<string, Reading>;
}

interface Marker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  region: string;
  score: number;
  status: "safe" | "marginal" | "critical";
  ripplePhase: number;
}

function project(lat: number, lng: number, w: number, h: number, padding: number): { x: number; y: number } {
  // simple equirectangular projection over Jakarta/Bogor/Tangerang bbox
  const bbox = { minLat: -6.55, maxLat: -6.05, minLng: 106.55, maxLng: 107.05 };
  const x = ((lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * (w - padding * 2) + padding;
  const y = ((bbox.maxLat - lat) / (bbox.maxLat - bbox.minLat)) * (h - padding * 2) + padding;
  return { x, y };
}

export function GeoHeatmap({ latest }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [hovered, setHovered] = useState<Marker | null>(null);
  const [markers, setMarkers] = useState<Marker[]>(() =>
    SENSORS.map((s, i) => ({
      id: s.id,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
      region: s.region,
      score: 0,
      status: "safe",
      ripplePhase: i * 0.4,
    }))
  );
  const { t } = useApp();

  useEffect(() => {
    setMarkers((prev) =>
      prev.map((m) => {
        const r = latest[m.id];
        if (!r) return m;
        const composite = (
          ["ph", "tds", "cl", "turb", "temp"] as const
        )
          .map((k) => statusOf(r[k], THRESHOLDS[k]))
          .reduce<"safe" | "marginal" | "critical">((acc, cur) =>
            cur === "critical" ? "critical" : cur === "marginal" && acc !== "critical" ? "marginal" : acc,
            "safe"
          );
        const score = composite === "critical" ? 1 : composite === "marginal" ? 0.55 : 0.18;
        return { ...m, score, status: composite };
      })
    );
  }, [latest]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth || 800;
    const h = cv.clientHeight || 600;
    cv.width = w * dpr;
    cv.height = h * dpr;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      // gradient background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#0e7490");
      grad.addColorStop(1, "#082f49");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // grid
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      // markers + ripples
      const padding = 30;
      for (const m of markers) {
        const { x, y } = project(m.lat, m.lng, w, h, padding);
        const t = ((now / 1000 + m.ripplePhase) % 2.4) / 2.4;
        const radius = 6 + t * 50;
        const alpha = (1 - t) * 0.6;
        const color = m.status === "critical" ? "239,68,68" : m.status === "marginal" ? "234,179,8" : "34,197,94";

        // radial heatmap overlay
        const heatGrad = ctx.createRadialGradient(x, y, 0, x, y, 80);
        heatGrad.addColorStop(0, `rgba(${color},${m.score * 0.55})`);
        heatGrad.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = heatGrad;
        ctx.beginPath();
        ctx.arc(x, y, 80, 0, Math.PI * 2);
        ctx.fill();

        // ripple rings
        ctx.strokeStyle = `rgba(${color},${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // solid core
        ctx.fillStyle = `rgb(${color})`;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        // label
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "11px ui-sans-serif, system-ui";
        ctx.fillText(m.id, x + 8, y - 6);
        ctx.fillText(m.name, x + 8, y + 8);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationRef.current);
  }, [markers]);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const onMove = (e: MouseEvent) => {
      const rect = cv.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      let closest: { m: Marker; d: number } | null = null;
      for (const m of markers) {
        const p = project(m.lat, m.lng, rect.width, rect.height, 30);
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < 30 && (!closest || d < closest.d)) closest = { m, d };
      }
      setHovered(closest ? closest.m : null);
    };
    cv.addEventListener("mousemove", onMove);
    cv.addEventListener("mouseleave", () => setHovered(null));
    return () => {
      cv.removeEventListener("mousemove", onMove);
    };
  }, [markers]);

  function exportPNG() {
    const cv = ref.current;
    if (!cv) return;
    const url = cv.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `aquapure-heatmap-${Date.now()}.png`;
    a.click();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />{t.dash.statusSafe}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />{t.dash.statusMarginal}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" />{t.dash.statusCritical}</span>
        </div>
        <button onClick={exportPNG} className="text-xs px-3 h-8 rounded border border-[color:var(--color-border)] hover:bg-aqua-50 dark:hover:bg-aqua-900/30">
          {t.heatmap.exportPNG}
        </button>
      </div>
      <div className="relative rounded-xl overflow-hidden border border-[color:var(--color-border)] bg-[color:var(--color-card)]" style={{ aspectRatio: "4 / 3" }}>
        <canvas ref={ref} className="absolute inset-0 w-full h-full" />
        {hovered && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 rounded-lg shadow-lg px-3 py-2 text-xs border border-[color:var(--color-border)]">
            <div className="font-medium">{hovered.id} - {hovered.name}</div>
            <div className="text-[color:var(--color-muted)]">{hovered.region}</div>
            <div className="mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                hovered.status === "critical" ? "bg-red-100 text-red-700" :
                hovered.status === "marginal" ? "bg-amber-100 text-amber-800" :
                "bg-emerald-100 text-emerald-800"
              }`}>{hovered.status}</span>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-[color:var(--color-muted)]">{t.heatmap.hover}</p>
    </div>
  );
}
