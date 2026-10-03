# AquaPure

> Real-time water quality monitoring OS for PDAM, refill water depots, and small aquaculture operations in Indonesia. Live IoT-style telemetry, AI contamination classifier, canvas geospatial heatmap, and BPOM-style compliance reports — entirely local-first in your browser.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#)

[Live Demo](https://aquapure.zwart.qzz.io) - [Repository](https://github.com/Zwart04/aquapure) - [Features](./FEATURES.md)

## Overview

AquaPure simulates a network of eight water-quality sensors spread across Jakarta, Bogor, and Tangerang. A 1.5 second tick loop streams pH, TDS, chlorine residual, turbidity, and temperature into your browser. An AI contamination classifier scores every reading, a canvas heatmap visualises contamination risk across the city, and a linear-regression forecaster projects the next 24 hours. Compliance reports export as PDF.

The app is local-first: everything runs in the browser, data persists in `localStorage`, no backend, no database, no third-party trackers.

## Features

- Live Sensor Dashboard: 8 sensors x 5 parameters streaming every 1.5s with rolling sparklines and composite status badges
- Canvas Geospatial Heatmap: animated ripple + radial gradient overlay across Jakarta / Bogor / Tangerang with PNG export
- AI Contamination Classifier: deterministic rule-based scoring engine returning risk 0-100 with reasoning
- Trend Forecast: 7-day history + linear regression forecast with 1 std-dev confidence band
- Alert Log + Notification Center: severity filtering, CSV export, mailto and wa.me share-link per row
- Compliance Reports: BPOM / Depkes-style PDF (jsPDF + autotable) with summary stats, recent readings, conclusion
- Consumable Tracker: cartridge / chemical inventory per sensor with auto-decrement + reorder toast
- Auto Finance Journal + UTM Attribution: source-tagged entries (auto-alert, auto-consumable, auto-export) + visits-by-source charted without any third-party script

See [FEATURES.md](./FEATURES.md) for the full breakdown.

## Tech Stack

| Layer | Library |
| --- | --- |
| Framework | Next.js 16 (App Router, `output: export`) |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS v4 (CSS-first, `@theme` block) |
| Charts | Recharts 2.x (composed chart, area chart, bar chart) |
| PDF | jsPDF + jspdf-autotable |
| Icons | lucide-react |
| State | localStorage + React hooks (no backend) |

## Getting Started

Prerequisites:

- Node.js 20+
- npm 10+

Install:

```bash
npm install
```

Develop:

```bash
npm run dev
```

Production build (static export):

```bash
npm run build
```

The static site lands in `out/`.

## Project Structure

```
aquapure/
+- app/                     # Next.js App Router pages
|  +- page.tsx              # Landing page
|  +- dashboard/            # Live sensor stream
|  +- heatmap/              # Canvas geospatial heatmap
|  +- classifier/           # AI contamination classifier
|  +- forecast/             # Trend predictor
|  +- alerts/               # Alert log + notification center
|  +- reports/              # PDF compliance reports
|  +- consumables/          # Cartridge / chemical inventory
|  +- finance/              # Auto-journal entries
|  +- analytics/            # UTM attribution chart
|  +- login/                # Local-first auth
+- components/
|  +- shell.tsx             # Navigation + footer
|  +- sparkline.tsx         # Canvas 60s sparkline
|  +- geo-heatmap.tsx       # Canvas heatmap with ripple
+- lib/
|  +- sensors.ts            # Sensor metadata + tick generator
|  +- classifier.ts         # Rule-based scoring + linear forecast
|  +- store.ts              # localStorage store
|  +- app-context.tsx       # Lang + theme + user context
|  +- toast.tsx             # In-app toast viewport
|  +- i18n.ts               # EN / ID bilingual dict
|  +- use-telemetry.ts      # 1.5s tick loop hook
+- public/
|  +- icon.svg              # Favicon
+- FEATURES.md              # Feature spec
+- README.md
+- package.json
+- next.config.js
+- tsconfig.json
```

## Demo Account

The local-first auth accepts any valid email plus a six-character password. For instant sign-in use:

- Email: `demo@aquapure.id`
- Password: `aquapure`

Both are demo-only and stored in your browser only.

## Deployment

This project exports a static site (`next.config.js` sets `output: "export"`). Deploy `out/` to any static host (Cloudflare Pages, Vercel, Netlify, GitHub Pages, etc).

For Cloudflare Pages via Wrangler:

```bash
npm run build
wrangler pages deploy out --project-name=aquapure --branch=main --commit-dirty=true
wrangler pages domain add --project-name=aquapure aquapure.zwart.qzz.io
```

## Roadmap

- Wire a real WebSocket source for production deployments (replace `lib/use-telemetry.ts` mock interval)
- Optional IndexedDB queue for offline reading sync (the spec is already in `FEATURES.md`)
- More regional presets (Bandung, Surabaya, Medan) by editing `SENSORS` in `lib/sensors.ts`
- Optional CSV bulk import for historical lab readings (skeleton in `lib/sensors.ts#generateHistory`)

## License

MIT - see [LICENSE](LICENSE).

---

AquaPure - real-time water quality OS. No backend. No tracking. No pixels.
