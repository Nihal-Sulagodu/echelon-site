# Lighthouse report

Run: 2026-10-28T05:58:58.034Z · Lighthouse 13.5.0 · local server (tools/serve.mjs) with gzip for text files, like a normal web host

Every run starts with a fresh browser session, so the intro plays each time (worst case).

## Mobile (Moto G Power, slow 4G, simulated)

Median of 3 runs. All runs: 92, 93, 97.

| Category | Score |
|---|---|
| Performance | 93 |
| Accessibility | 100 |
| Best Practices | 96 |
| SEO | 100 |

| Metric | Value |
|---|---|
| First Contentful Paint | 1.05 s |
| Largest Contentful Paint | 2.24 s |
| Total Blocking Time | 252 ms |
| Cumulative Layout Shift | 0.000 |
| Speed Index | 2.56 s |
| Total page weight | 1916 KB |

Audits below 90:

- Total Blocking Time (250 ms)
- Max Potential First Input Delay (190 ms)
- Browser errors were logged to the console
- Time to Interactive (4.1 s)
- Minimize main-thread work (3.1 s)
- Minify JavaScript (Est savings of 8 KiB)
- Forced reflow
- LCP request discovery
- Network dependency tree

## Desktop

Median of 3 runs. All runs: 99, 100, 100.

| Category | Score |
|---|---|
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 96 |
| SEO | 100 |

| Metric | Value |
|---|---|
| First Contentful Paint | 0.28 s |
| Largest Contentful Paint | 0.57 s |
| Total Blocking Time | 40 ms |
| Cumulative Layout Shift | 0.000 |
| Speed Index | 1.09 s |
| Total page weight | 1035 KB |

Audits below 90:

- Browser errors were logged to the console
- Minify JavaScript (Est savings of 8 KiB)
- LCP request discovery
- Network dependency tree

Full reports: `reports/lighthouse-mobile.html` and `reports/lighthouse-desktop.html` (open in a browser).
