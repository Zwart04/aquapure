// AquaPure shared telemetry engine — drives the 1.5s tick loop in browser
"use client";

import { useEffect, useRef, useState } from "react";
import { SENSORS, tickReading, type Reading } from "./sensors";

export interface LiveStream {
  paused: boolean;
  togglePause: () => void;
  latest: Record<string, Reading>;
  series: Record<string, Reading[]>; // rolling 60-second window per sensor
  totalCount: number;
}

export function useTelemetry(intervalMs = 1500, windowSec = 60): LiveStream {
  const [paused, setPaused] = useState(false);
  const [latest, setLatest] = useState<Record<string, Reading>>(() =>
    Object.fromEntries(SENSORS.map((s) => [s.id, tickReading(s.id)]))
  );
  const [series, setSeries] = useState<Record<string, Reading[]>>(() =>
    Object.fromEntries(SENSORS.map((s) => [s.id, [tickReading(s.id)]]))
  );
  const [totalCount, setTotalCount] = useState(SENSORS.length);
  const prevRef = useRef<Record<string, Reading>>(latest);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      const prev = prevRef.current;
      const newLatest: Record<string, Reading> = {};
      const newSeries: Record<string, Reading[]> = {};
      for (const s of SENSORS) {
        const r = tickReading(s.id, prev[s.id]);
        newLatest[s.id] = r;
        const cutoff = Date.now() - windowSec * 1000;
        const existing = (series[s.id] || []).filter((x) => x.ts >= cutoff);
        newSeries[s.id] = [...existing, r];
      }
      prevRef.current = newLatest;
      setLatest(newLatest);
      setSeries(newSeries);
      setTotalCount((c) => c + SENSORS.length);
    }, intervalMs);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, intervalMs, windowSec]);

  return {
    paused,
    togglePause: () => setPaused((p) => !p),
    latest,
    series,
    totalCount,
  };
}
