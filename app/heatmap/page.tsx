"use client";

import { GeoHeatmap } from "@/components/geo-heatmap";
import { useApp } from "@/lib/app-context";
import { useTelemetry } from "@/lib/use-telemetry";
import { Map } from "lucide-react";

export default function HeatmapPage() {
  const { t } = useApp();
  const { latest } = useTelemetry();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Map className="h-5 w-5 text-aqua-600" />
          {t.heatmap.title}
        </h1>
        <p className="text-sm text-[color:var(--color-muted)] mt-1 max-w-2xl">{t.heatmap.desc}</p>
      </div>
      <GeoHeatmap latest={latest} />
    </div>
  );
}
