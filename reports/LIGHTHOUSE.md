# Lighthouse report

Run: 2026-10-23T12:21:16.386Z · Lighthouse 13.5.0 · local server (tools/serve.mjs) with gzip for text files, like a normal web host

Every run starts with a fresh browser session, so the intro plays each time (worst case).

## Mobile (Moto G Power, slow 4G, simulated)

Median of 3 runs. All runs: 99, 99, 99.

| Category | Score |
|---|---|
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

| Metric | Value |
|---|---|
| First Contentful Paint | 1.50 s |
| Largest Contentful Paint | 1.73 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0.000 |
| Speed Index | 1.50 s |
| Total page weight | 167 KB |

Audits below 90:

- Minify JavaScript (Est savings of 6 KiB)
- Network dependency tree

## Desktop

Median of 3 runs. All runs: 100, 100, 100.

| Category | Score |
|---|---|
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

| Metric | Value |
|---|---|
| First Contentful Paint | 0.36 s |
| Largest Contentful Paint | 0.38 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0.000 |
| Speed Index | 0.54 s |
| Total page weight | 167 KB |

Audits below 90:

- Minify JavaScript (Est savings of 6 KiB)
- Network dependency tree

Full reports: `reports/lighthouse-mobile.html` and `reports/lighthouse-desktop.html` (open in a browser).
