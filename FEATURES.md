# AquaPure Features

Eight heavy-weight features built for real-time water quality monitoring, AI contamination classification, canvas geospatial heatmap, and compliance reporting.

## 1. Live Sensor Dashboard
Eight simulated sensors stream pH, TDS, chlorine residual, turbidity, and temperature every 1.5 seconds. Each card shows the latest reading, a 60-second rolling sparkline per parameter, and a composite status badge (Safe / Marginal / Critical). Alert transitions trigger an in-app toast (shadcn-style) plus an auto-journal finance entry.

- Route: `/dashboard`
- File: `app/dashboard/page.tsx`
- Hook: `lib/use-telemetry.ts` (1.5s `setInterval` mock stream)
- Heavy categories: real-time tick loop, in-browser telemetry

## 2. Canvas Geospatial Heatmap
800x600 canvas renders eight sensor markers across the Jakarta / Bogor / Tangerang region with requestAnimationFrame ripple animation. A radial gradient composite encodes contamination risk per sensor. Hover surfaces a tooltip with live reading and region. PNG export button included.

- Route: `/heatmap`
- File: `components/geo-heatmap.tsx`
- Heavy categories: GPU browser compute, canvas animation, requestAnimationFrame

## 3. AI Contamination Classifier
Deterministic rule-based scoring engine reads five parameters, returns risk 0-100 plus a verdict (Safe / Marginal / Critical) and per-parameter reasoning. Slider-driven input with live preview, plus a saved classification history table.

- Route: `/classifier`
- File: `app/classifier/page.tsx`, `lib/classifier.ts`
- Heavy categories: AI/ML pipeline, deterministic rule scoring, persistence

## 4. Trend Predictor (24h Forecast)
Recharts composed chart visualises 7-day history plus linear-regression forecast with 1 std-dev confidence band. User selects sensor + parameter + horizon. Forecast updates instantly on selection.

- Route: `/forecast`
- File: `app/forecast/page.tsx`
- Heavy categories: predictive modelling (linear regression), Recharts

## 5. Alert Log + Notification Center
Persisted out-of-range readings with severity, sensor, message, timestamp. Filter by severity, export CSV. Per-row share links open `mailto:` (email mock) or `https://wa.me/?text=...` (WhatsApp deep-link, no WAHA API).

- Route: `/alerts`
- File: `app/alerts/page.tsx`, `lib/store.ts`
- Heavy categories: event logging, UTM-aware sharing, in-app toast integration

## 6. Compliance Report Generator
Pick a sensor + lookback window, generate a BPOM / Depkes-style PDF via jsPDF + autotable. Header, summary statistics, recent readings table, conclusion text, signature block. Bilingual EN/ID label support.

- Route: `/reports`
- File: `app/reports/page.tsx`
- Heavy categories: PDF generation, autosummary, auto-journal finance

## 7. Consumable Tracker (Cartridge / Chemical)
Track cartridge lifespan, chlorine tablets, pH buffer solution per sensor. Auto-decrement per live reading (telemetry hook calls `decrementConsumable`). Reorder toast when remaining drops below threshold. Add-item form persists to localStorage.

- Route: `/consumables`
- File: `app/consumables/page.tsx`
- Heavy categories: real-time decrementing, persistence, background worker

## 8. Auto Finance Journal + UTM Attribution
Auto-journal entries fire from alerts, consumable use, and report exports. Recharts area chart shows cumulative spend. `/analytics` reads `?utm_source=...` from URL on first visit, persists to `localStorage.source`, then charts visits by source via Recharts bar chart. No fbq, no gtag, no third-party tracker scripts.

- Routes: `/finance`, `/analytics`
- Files: `app/finance/page.tsx`, `app/analytics/page.tsx`, `lib/store.ts`
- Heavy categories: background event sourcing, attribution without pixels

## Stack

- Next.js 16 App Router + TypeScript + Tailwind v4 + custom AquaPure theme
- Recharts 2.x (composed chart, area chart, bar chart)
- jsPDF + jspdf-autotable (compliance reports)
- lucide-react icons (no emoji anywhere)
- Canvas 2D + requestAnimationFrame (heatmap, sparklines)
- localStorage as the only persistence layer (no backend, no DB)

## Notifications

- In-app toast (custom viewport in `lib/toast.tsx`)
- `mailto:` deep-link for share alerts
- `window.open('https://wa.me/?text=...')` for WhatsApp deep-link share

NO WAHA tab. NO WAHA API. NO QR scan. NO external notification service.

## Attribution

- URL params (`?utm_source=&utm_medium=&utm_campaign=`) read on first visit
- Persisted once to `localStorage.source`
- Visits recorded to `localStorage.visits` and charted in `/analytics`

NO Meta Pixel (`fbq`). NO Google Ads (`gtag`). NO `NEXT_PUBLIC_META_PIXEL_ID`. NO `NEXT_PUBLIC_GOOGLE_ADS_ID`.

## Heavy-weight categories (5/5)

1. AI/ML pipeline (classifier + linear regression forecast)
2. Real-time/WebSocket-style (1.5s tick loop + Recharts rolling windows)
3. Media processing / GPU browser (canvas heatmap, sparklines, ripple animation)
4. External API (mock-first — BPOM thresholds, sensor profiles, deterministic history)
5. Background workers/cron (auto-decrement consumable, auto-journal finance, auto-export report, UTM reader)
