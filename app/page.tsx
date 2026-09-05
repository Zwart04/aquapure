"use client";

import Link from "next/link";
import { useApp } from "@/lib/app-context";
import { Droplets, Brain, LineChart, Map, Cpu, Bell, FileText, Boxes, Wallet, BarChart3 } from "lucide-react";

const FEATURES = [
  { icon: Cpu, key: "f1Title", descKey: "f1Desc" },
  { icon: Map, key: "f2Title", descKey: "f2Desc" },
  { icon: Brain, key: "f3Title", descKey: "f3Desc" },
  { icon: LineChart, key: "f4Title", descKey: "f4Desc" },
  { icon: Bell, key: "f5Title", descKey: "f5Desc" },
  { icon: FileText, key: "f6Title", descKey: "f6Desc" },
  { icon: Boxes, key: "f7Title", descKey: "f7Desc" },
  { icon: Wallet, key: "f8Title", descKey: "f8Desc" },
] as const;

const ROUTES = [
  { href: "/dashboard", icon: Cpu, label: "Live Stream" },
  { href: "/heatmap", icon: Map, label: "Heatmap" },
  { href: "/classifier", icon: Brain, label: "AI Classifier" },
  { href: "/forecast", icon: LineChart, label: "Forecast" },
  { href: "/alerts", icon: Bell, label: "Alerts" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/consumables", icon: Boxes, label: "Consumables" },
  { href: "/finance", icon: Wallet, label: "Finance" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
];

export default function HomePage() {
  const { t } = useApp();
  return (
    <div className="space-y-12">
      <section className="grid lg:grid-cols-2 gap-8 items-center py-8">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-aqua-100 text-aqua-800 dark:bg-aqua-900/40 dark:text-aqua-200">
            <Droplets className="h-3.5 w-3.5" />
            {t.home.heroBadge}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            {t.home.heroTitle}
          </h1>
          <p className="text-[color:var(--color-muted)] text-lg leading-relaxed max-w-xl">
            {t.home.heroDesc}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 h-11 rounded-lg bg-aqua-600 text-white font-medium hover:bg-aqua-700">
              <Cpu className="h-4 w-4" />
              {t.home.ctaPrimary}
            </Link>
            <Link href="/classifier" className="inline-flex items-center gap-2 px-5 h-11 rounded-lg border border-[color:var(--color-border)] font-medium hover:bg-aqua-50 dark:hover:bg-aqua-900/30">
              <Brain className="h-4 w-4" />
              {t.home.ctaSecondary}
            </Link>
          </div>
          <div className="flex gap-2 pt-2 flex-wrap">
            {ROUTES.map((r) => {
              const I = r.icon;
              return (
                <Link key={r.href} href={r.href} className="text-xs px-2 py-1 rounded-full border border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:text-aqua-700 hover:border-aqua-300 inline-flex items-center gap-1">
                  <I className="h-3 w-3" />
                  {r.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            {FEATURES.slice(0, 4).map((f, i) => {
              const I = f.icon;
              return (
                <div key={i} className="rounded-lg bg-aqua-50/50 dark:bg-aqua-900/20 border border-aqua-100 dark:border-aqua-900/40 p-4">
                  <I className="h-5 w-5 text-aqua-600 mb-2" />
                  <div className="text-sm font-medium leading-snug">{t.home[f.key as keyof typeof t.home]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-5">{t.home.featureMatrix}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => {
            const I = f.icon;
            return (
              <div key={i} className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-5">
                <I className="h-5 w-5 text-aqua-600 mb-3" />
                <div className="font-medium leading-snug">{t.home[f.key as keyof typeof t.home]}</div>
                <div className="mt-2 text-sm text-[color:var(--color-muted)] leading-relaxed">{t.home[f.descKey as keyof typeof t.home]}</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
