"use client";

import { useEffect, useRef } from "react";

interface Props {
  data: { ts: number; v: number }[];
  color: string;
  height?: number;
  threshold?: { safe: [number, number]; marginal: [number, number] };
  paramMin?: number;
  paramMax?: number;
}

export function Sparkline({ data, color, height = 32, threshold, paramMin, paramMax }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || data.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth || 200;
    const h = height;
    cv.width = w * dpr;
    cv.height = h * dpr;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const vals = data.map((d) => d.v);
    let vMin = Math.min(...vals);
    let vMax = Math.max(...vals);
    if (threshold) {
      vMin = Math.min(vMin, threshold.marginal[0]);
      vMax = Math.max(vMax, threshold.marginal[1]);
    }
    if (paramMin !== undefined) vMin = Math.min(vMin, paramMin);
    if (paramMax !== undefined) vMax = Math.max(vMax, paramMax);
    if (vMax - vMin < 0.001) {
      vMin -= 0.5;
      vMax += 0.5;
    }

    const t0 = data[0].ts;
    const t1 = data[data.length - 1].ts;
    const span = Math.max(1, t1 - t0);
    const xOf = (ts: number) => ((ts - t0) / span) * w;
    const yOf = (v: number) => h - ((v - vMin) / (vMax - vMin)) * (h - 4) - 2;

    if (threshold) {
      ctx.fillStyle = "rgba(22,163,74,0.10)";
      const y1 = yOf(threshold.safe[1]);
      const y2 = yOf(threshold.safe[0]);
      ctx.fillRect(0, Math.min(y1, y2), w, Math.abs(y2 - y1));
      ctx.fillStyle = "rgba(234,179,8,0.10)";
      const yM1 = yOf(Math.min(threshold.marginal[1], threshold.safe[1]));
      const yM2 = yOf(Math.max(threshold.marginal[0], threshold.safe[0]));
      if (yM1 > 0) ctx.fillRect(0, Math.min(yM1, yM2), w, Math.abs(yM2 - yM1));
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = xOf(d.ts);
      const y = yOf(d.v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    const last = data[data.length - 1];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(xOf(last.ts), yOf(last.v), 2.5, 0, Math.PI * 2);
    ctx.fill();
  }, [data, color, height, threshold, paramMin, paramMax]);

  return <canvas ref={ref} style={{ width: "100%", height }} />;
}
