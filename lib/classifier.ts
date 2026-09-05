// AI contamination classifier — deterministic rule-based scoring engine
import { THRESHOLDS, type Reading, type Status, statusOf } from "./sensors";

export interface ClassificationResult {
  riskScore: number;
  status: Status;
  verdict: string;
  reasoning: string[];
  paramStatus: Record<keyof typeof THRESHOLDS, Status>;
}

export function classifyReading(r: Reading): ClassificationResult {
  const phS = statusOf(r.ph, THRESHOLDS.ph);
  const tdsS = statusOf(r.tds, THRESHOLDS.tds);
  const clS = statusOf(r.cl, THRESHOLDS.cl);
  const turbS = statusOf(r.turb, THRESHOLDS.turb);
  const tempS = statusOf(r.temp, THRESHOLDS.temp);

  const w = { ph: 22, tds: 22, cl: 18, turb: 22, temp: 16 };
  let score = 0;
  const reasoning: string[] = [];

  const add = (s: Status, weight: number, label: string, value: number, unit: string) => {
    if (s === "critical") {
      score += weight;
      reasoning.push(`Critical ${label}: ${value.toFixed(2)} ${unit}`);
    } else if (s === "marginal") {
      score += weight * 0.4;
      reasoning.push(`Marginal ${label}: ${value.toFixed(2)} ${unit}`);
    }
  };

  add(phS, w.ph, "pH", r.ph, "");
  add(tdsS, w.tds, "TDS", r.tds, "ppm");
  add(clS, w.cl, "chlorine", r.cl, "ppm");
  add(turbS, w.turb, "turbidity", r.turb, "NTU");
  add(tempS, w.temp, "temperature", r.temp, "C");

  score = Math.max(0, Math.min(100, Math.round(score)));
  const status: Status = score >= 70 ? "critical" : score >= 35 ? "marginal" : "safe";

  if (reasoning.length === 0) reasoning.push("All five parameters within WHO safe range.");

  const verdictMap: Record<Status, { en: string; id: string }> = {
    safe: { en: "Safe to consume (post-treatment)", id: "Aman diminum (setelah perlakuan)" },
    marginal: { en: "Marginal — retest within 6h", id: "Marginal — uji ulang dalam 6 jam" },
    critical: { en: "Critical — do not distribute", id: "Kritis — jangan distribusikan" },
  };

  return {
    riskScore: score,
    status,
    verdict: verdictMap[status].en,
    reasoning,
    paramStatus: { ph: phS, tds: tdsS, cl: clS, turb: turbS, temp: tempS },
  };
}

export interface ForecastPoint {
  ts: number;
  history?: number;
  forecast?: number;
  upper?: number;
  lower?: number;
}

// Linear regression on a series of {ts, value}
export function linearForecast(values: { ts: number; v: number }[], horizonMs: number, stepMin = 30) {
  const n = values.length;
  if (n < 2) return [] as ForecastPoint[];
  const t0 = values[0].ts;
  const xs = values.map((v) => (v.ts - t0) / 3600_000); // hours
  const ys = values.map((v) => v.v);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  const residuals = ys.map((y, i) => y - (slope * xs[i] + intercept));
  const std = Math.sqrt(residuals.reduce((a, b) => a + b * b, 0) / Math.max(1, n - 2));

  const history: ForecastPoint[] = values.map((v) => ({
    ts: v.ts,
    history: v.v,
  }));
  const steps = Math.floor(horizonMs / (stepMin * 60_000));
  const lastX = xs[xs.length - 1];
  const lastTs = values[values.length - 1].ts;
  for (let i = 1; i <= steps; i++) {
    const x = lastX + (i * stepMin) / 60;
    const ts = lastTs + i * stepMin * 60_000;
    const yhat = slope * x + intercept;
    history.push({
      ts,
      forecast: yhat,
      upper: yhat + std,
      lower: yhat - std,
    });
  }
  return history;
}

export function meanOf(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stdOf(values: number[]): number {
  if (values.length < 2) return 0;
  const m = meanOf(values);
  return Math.sqrt(values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length - 1));
}
