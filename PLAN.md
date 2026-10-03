# AquaPure Field Intelligence rebuild plan

## Product scope

Workspace lapangan untuk pengukuran air, pertanian, input, hasil panen dan catatan emisi.

## Modules

- Lokasi
- Sensor
- Sampel air
- Ambang pengukuran
- Alert
- Tanaman
- Aktivitas lapangan
- Input pertanian
- Panen
- Aktivitas emisi
- Peta lokasi
- Integrasi sensor
- Laporan

## Delivery sequence

1. Consolidate records and tools into one navigation and one account/workspace model.
2. Implement server validation, roles, durable D1 records, audit, optimistic concurrency and restore.
3. Implement native tools that process the user's input; no demo data or synthetic provider fallback.
4. Build and test against an isolated Cloudflare database.
5. Publish the single application, verify HTTPS/API, and preserve prior Git history before removing source duplicates.

## Validation

Backend integration covers actual D1 write/read for the product's resources. Auth, roles, concurrency, order stock, recovery, locked letters and form responses have automated tests. Native browser processing and mobile layout are checked separately. Provider availability and device codec support are reported honestly in the UI.
