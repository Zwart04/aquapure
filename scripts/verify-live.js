#!/usr/bin/env node
// Live verification — catches what curl CANNOT:
//  - React hydration error #418 (localStorage-in-render)
//  - sub-resource 404 (favicon) — curl -I / returns 200 but browser console 404s
//  - stuck "Loading..." (hydration never completes)
//
// Migration note (2026-08-28): migrated from puppeteer to playwright.
// Why: (a) Playwright is what the 7+ daily project verify-live.js copies were
// already on; (b) Hermes-agent itself uses Playwright for e2e; (c) cache:
// Playwright's ms-playwright/chromium is shared across all projects, while
// Puppeteer's chrome was a separate 652MB. (d) Multi-browser support
// (chromium/firefox/webkit) for future cross-browser QA.
//
// Usage: node verify-live.js <baseUrl>   (or VERIFY_BASE_URL env)
// Routes: default list below, override with VERIFY_ROUTES="a,b,c" (no leading slash issues handled)
//
// Playwright API differences from Puppeteer (verified 2026-08-28):
//   - launch: no `headless: 'new'` — pass `headless: true` (boolean)
//   - viewport: `setViewport({w,h})` → `setViewportSize({w,h})` on context
//   - waitUntil: `networkidle0` (no requests for 500ms) → `networkidle` (same semantics, Playwright renamed)
//   - page.goto: same options object
//   - page.evaluate: same
//   - new context API: `browser.newContext({viewport, deviceScaleFactor})` is the proper way
//   - fill: `page.type(sel, val)` (one key at a time) → `page.fill(sel, val)` (atomic)
//   - waitForNavigation: still works but is now `page.waitForURL` / `Promise.all([waitForLoadState, click])` in newer Playwright
//
// Install: `npm install --save-dev playwright@^1.62.1` (matches daily project standard version)
const { chromium } = require('playwright');

const base = process.argv[2] || process.env.VERIFY_BASE_URL || 'http://localhost:3000';
const routeArg = process.env.VERIFY_ROUTES;
const routes = routeArg
  ? routeArg.split(',').map((r) => (r.startsWith('/') ? r : '/' + r))
  : ['/', '/login', '/register', '/dashboard', '/tasks', '/vendors', '/budget', '/inventory', '/assets', '/finance', '/share', '/waha', '/settings', '/s/demo-household'];

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  } catch (e) {
    console.log('LAUNCH_FAIL', e.message);
    process.exit(2);
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));

  let totalErrors = 0;
  for (const r of routes) {
    errors.length = 0;
    try {
      await page.goto(base + r, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1500);
      const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 200));
      const stillLoading = bodyText.includes('Loading...') && bodyText.length < 50;
      const status = errors.length === 0 && !stillLoading ? 'OK' : 'FAIL';
      if (errors.length) totalErrors += errors.length;
      console.log(`${r} → ${status} errors=${errors.length}${stillLoading ? ' STILL_LOADING' : ''}`);
      if (errors.length) console.log('    ', errors.slice(0, 3).join(' | ').slice(0, 300));
    } catch (e) {
      console.log(`${r} → NAV_FAIL ${e.message.slice(0, 100)}`);
      totalErrors += 1;
    }
  }
  await browser.close();
  console.log(totalErrors === 0 ? 'VERIFY_PASS' : `VERIFY_FAIL total=${totalErrors}`);
  process.exit(totalErrors === 0 ? 0 : 1);
})().catch((e) => { console.log('LAUNCH_FAIL', e.message); process.exit(2); });
