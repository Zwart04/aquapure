// AquaPure thresholds and sensor config
export type Status = "safe" | "marginal" | "critical";

export interface SensorMeta {
  id: string;
  name: string;
  kind: "dam" | "kolam" | "sungai";
  lat: number;
  lng: number;
  region: string;
}

export const SENSORS: SensorMeta[] = [
  { id: "S01", name: "DAM Cipulir", kind: "dam", lat: -6.2416, lng: 106.7827, region: "Jakarta Selatan" },
  { id: "S02", name: "DAM Rorotan", kind: "dam", lat: -6.1498, lng: 106.9583, region: "Jakarta Utara" },
  { id: "S03", name: "DAM Bekasi", kind: "dam", lat: -6.2349, lng: 107.0013, region: "Bekasi" },
  { id: "S04", name: "Kolam Udang Cilincing", kind: "kolam", lat: -6.1034, lng: 106.9297, region: "Jakarta Utara" },
  { id: "S05", name: "Kolam Lele Cibinong", kind: "kolam", lat: -6.4817, lng: 106.8227, region: "Bogor" },
  { id: "S06", name: "Kolam Nila Tangerang", kind: "kolam", lat: -6.1783, lng: 106.6319, region: "Tangerang" },
  { id: "S07", name: "Sungai Ciliwung", kind: "sungai", lat: -6.2034, lng: 106.8328, region: "Jakarta Pusat" },
  { id: "S08", name: "Sungai Cisadane", kind: "sungai", lat: -6.1828, lng: 106.6321, region: "Tangerang" },
];

export interface Reading {
  ts: number;
  sensorId: string;
  ph: number;
  tds: number;
  cl: number;
  turb: number;
  temp: number;
}

// BPOM / WHO thresholds (per parameter)
export const THRESHOLDS: Record<
  "ph" | "tds" | "cl" | "turb" | "temp",
  { safe: [number, number]; marginal: [number, number]; critical: [number, number] }
> = {
  ph: { safe: [6.5, 8.5], marginal: [6.0, 9.0], critical: [0, 14] },
  tds: { safe: [0, 500], marginal: [500, 1000], critical: [1000, 3000] },
  cl: { safe: [0.2, 1.5], marginal: [0, 2.5], critical: [0, 5] },
  turb: { safe: [0, 5], marginal: [5, 25], critical: [25, 1000] },
  temp: { safe: [20, 30], marginal: [15, 33], critical: [0, 50] },
};

export function statusOf(value: number, range: { safe: [number, number]; marginal: [number, number]; critical: [number, number] }): Status {
  if (value >= range.safe[0] && value <= range.safe[1]) return "safe";
  if (value >= range.marginal[0] && value <= range.marginal[1]) return "marginal";
  return "critical";
}

export interface SensorProfile {
  base: { ph: number; tds: number; cl: number; turb: number; temp: number };
  drift: { ph: number; tds: number; cl: number; turb: number; temp: number };
}

export const SENSOR_PROFILES: Record<string, SensorProfile> = {
  S01: { base: { ph: 7.4, tds: 320, cl: 0.6, turb: 1.2, temp: 27.0 }, drift: { ph: 0.25, tds: 18, cl: 0.08, turb: 0.4, temp: 0.5 } },
  S02: { base: { ph: 7.2, tds: 380, cl: 0.5, turb: 2.0, temp: 27.5 }, drift: { ph: 0.30, tds: 22, cl: 0.10, turb: 0.6, temp: 0.6 } },
  S03: { base: { ph: 7.5, tds: 290, cl: 0.7, turb: 1.0, temp: 26.8 }, drift: { ph: 0.22, tds: 16, cl: 0.06, turb: 0.3, temp: 0.4 } },
  S04: { base: { ph: 7.8, tds: 1200, cl: 0.05, turb: 12.0, temp: 29.5 }, drift: { ph: 0.4, tds: 60, cl: 0.05, turb: 3.0, temp: 0.8 } },
  S05: { base: { ph: 7.6, tds: 480, cl: 0.1, turb: 7.0, temp: 28.0 }, drift: { ph: 0.35, tds: 30, cl: 0.06, turb: 2.0, temp: 0.6 } },
  S06: { base: { ph: 7.7, tds: 410, cl: 0.08, turb: 5.0, temp: 28.5 }, drift: { ph: 0.3, tds: 24, cl: 0.05, turb: 1.5, temp: 0.5 } },
  S07: { base: { ph: 6.9, tds: 540, cl: 0.02, turb: 18.0, temp: 27.2 }, drift: { ph: 0.6, tds: 40, cl: 0.03, turb: 5.0, temp: 0.9 } },
  S08: { base: { ph: 7.0, tds: 510, cl: 0.03, turb: 16.0, temp: 27.6 }, drift: { ph: 0.55, tds: 38, cl: 0.03, turb: 4.5, temp: 0.8 } },
};

// Mulberry32 seeded RNG for deterministic history
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function tickReading(sensorId: string, prev?: Reading): Reading {
  const profile = SENSOR_PROFILES[sensorId];
  if (!profile) throw new Error("unknown sensor " + sensorId);
  const noise = (mag: number) => (Math.random() - 0.5) * 2 * mag;
  const trend = prev
    ? {
        ph: (prev.ph - profile.base.ph) * 0.85,
        tds: (prev.tds - profile.base.tds) * 0.85,
        cl: (prev.cl - profile.base.cl) * 0.85,
        turb: (prev.turb - profile.base.turb) * 0.85,
        temp: (prev.temp - profile.base.temp) * 0.85,
      }
    : { ph: 0, tds: 0, cl: 0, turb: 0, temp: 0 };

  return {
    ts: Date.now(),
    sensorId,
    ph: clamp(profile.base.ph + trend.ph + noise(profile.drift.ph), 5, 9.5),
    tds: clamp(profile.base.tds + trend.tds + noise(profile.drift.tds), 50, 2000),
    cl: clamp(profile.base.cl + trend.cl + noise(profile.drift.cl), 0, 3),
    turb: clamp(profile.base.turb + trend.turb + noise(profile.drift.turb), 0.1, 40),
    temp: clamp(profile.base.temp + trend.temp + noise(profile.drift.temp), 22, 33),
  };
}

export function generateHistory(sensorId: string, hours = 168, stepMin = 30): Reading[] {
  const profile = SENSOR_PROFILES[sensorId];
  if (!profile) return [];
  const rand = mulberry32(sensorId.charCodeAt(1) * 1009 + sensorId.charCodeAt(2) * 31);
  const out: Reading[] = [];
  const total = Math.floor((hours * 60) / stepMin);
  const now = Date.now();
  for (let i = total; i >= 0; i--) {
    const t = now - i * stepMin * 60_000;
    const dayPhase = Math.sin((t / (24 * 3600_000)) * Math.PI * 2) * 0.5 + 0.5;
    out.push({
      ts: t,
      sensorId,
      ph: clamp(profile.base.ph + (dayPhase - 0.5) * profile.drift.ph * 4 + (rand() - 0.5) * profile.drift.ph * 2, 5, 9.5),
      tds: clamp(profile.base.tds + (dayPhase - 0.5) * profile.drift.tds * 6 + (rand() - 0.5) * profile.drift.tds * 3, 50, 2000),
      cl: clamp(profile.base.cl + (dayPhase - 0.5) * profile.drift.cl * 2 + (rand() - 0.5) * profile.drift.cl, 0, 3),
      turb: clamp(profile.base.turb + (dayPhase - 0.5) * profile.drift.turb * 4 + (rand() - 0.5) * profile.drift.turb * 2, 0.1, 40),
      temp: clamp(profile.base.temp + (dayPhase - 0.5) * profile.drift.temp * 3 + (rand() - 0.5) * profile.drift.temp, 22, 33),
    });
  }
  return out;
}
