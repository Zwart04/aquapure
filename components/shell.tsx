"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/app-context";
import { Droplets, LayoutDashboard, Map, Sparkles, TrendingUp, Bell, FileText, Boxes, Wallet, BarChart3, Sun, Moon, LogOut, LogIn } from "lucide-react";
import { useState, type ReactNode } from "react";
import { signOut } from "@/lib/store";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/heatmap", icon: Map, key: "heatmap" },
  { href: "/classifier", icon: Sparkles, key: "classifier" },
  { href: "/forecast", icon: TrendingUp, key: "forecast" },
  { href: "/alerts", icon: Bell, key: "alerts" },
  { href: "/reports", icon: FileText, key: "reports" },
  { href: "/consumables", icon: Boxes, key: "consumables" },
  { href: "/finance", icon: Wallet, key: "finance" },
  { href: "/analytics", icon: BarChart3, key: "analytics" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { t, lang, setLang, theme, setTheme, user, setUser, mounted } = useApp();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b backdrop-blur bg-[color:var(--color-bg)]/80">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-semibold text-aqua-700 dark:text-aqua-300">
            <Droplets className="h-5 w-5" />
            <span>{t.appName}</span>
          </Link>
          <span className="hidden md:block text-xs text-[color:var(--color-muted)] ml-2">{t.tagline}</span>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "id" : "en")}
            className="text-xs px-2 py-1 rounded border border-[color:var(--color-border)] hover:bg-aqua-50 dark:hover:bg-aqua-900/30"
            aria-label="Toggle language"
          >
            {lang === "en" ? "EN/ID" : "ID/EN"}
          </button>
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded hover:bg-aqua-50 dark:hover:bg-aqua-900/30"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {mounted && user ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs text-[color:var(--color-muted)]">{user.name}</span>
              <button
                type="button"
                onClick={() => { signOut(); setUser(null); }}
                className="text-xs px-2 py-1 rounded border border-[color:var(--color-border)] hover:bg-aqua-50 dark:hover:bg-aqua-900/30 inline-flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t.nav.logout}
              </button>
            </div>
          ) : mounted ? (
            <Link href="/login" className="text-xs px-2 py-1 rounded bg-aqua-600 text-white hover:bg-aqua-700 inline-flex items-center gap-1">
              <LogIn className="h-3.5 w-3.5" />
              {t.nav.login}
            </Link>
          ) : null}
        </div>
        <nav className="border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)]/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
            <div className="flex gap-1 h-10 items-center text-sm">
              {NAV.map((n) => {
                const Icon = n.icon;
                const active = pathname === n.href || pathname?.startsWith(n.href + "/");
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`inline-flex items-center gap-1.5 px-3 h-7 rounded-md whitespace-nowrap ${active ? "bg-aqua-600 text-white" : "text-[color:var(--color-muted)] hover:bg-aqua-50 dark:hover:bg-aqua-900/30"}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.nav[n.key as keyof typeof t.nav]}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
      <footer className="border-t border-[color:var(--color-border)] py-4 text-center text-xs text-[color:var(--color-muted)]">
        {t.footer}
      </footer>
    </div>
  );
}
