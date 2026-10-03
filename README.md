# AquaPure

Dashboard pengukuran kualitas air, lokasi sensor, dan laporan lokal; data contoh bukan feed sensor aktif.

- [Open application](https://aquapure-app.zwart.qzz.io)
- [Project catalog](https://projects-app.zwart.qzz.io)
- [Source](https://github.com/Zwart04/aquapure)

## Development

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

## Validation

```sh
npm run typecheck
npm run build
```

Production builds check TypeScript rather than suppressing errors. GitHub Actions repeats the build and type check.

## Free deployment

```sh
npx wrangler login
npm run build
npm run typecheck
npx wrangler deploy
```

The deployment configuration is `wrangler.jsonc`. Use your own Cloudflare account and domain when forking. `aquapure-app.zwart.qzz.io` belongs to the Zwart04 deployment.

## Data and integrations

This edition is a browser workspace. Example records are demonstration data. Local storage belongs to this browser and is not a shared database or secure server account. Export important records before clearing browser data. A configured AI provider, WhatsApp server, or other external integration is required for those services; a hosted page alone does not activate them.

The free deployment contains no paid provider keys. It uses Cloudflare Workers with static assets or OpenNext as appropriate. Cloudflare free-plan limits apply. Original documentation is retained under `docs/README-before-rebuild.md` when present as historical material, not a validation record.
