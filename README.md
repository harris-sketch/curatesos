# CurateSOS Netlify Business Command Center

An institutional-grade dashboard for monitoring Netlify-powered business properties, release quality, forms intake, source-control coverage, and operational risk from one internal view.

The app is intentionally dependency-light:

- Static dashboard assets live in `public/`
- A Netlify Function in `netlify/functions/netlify-dashboard.mjs` securely proxies the Netlify API
- `netlify.toml` publishes the static app and routes `/api/netlify-dashboard` to the function
- Demo data is included so the interface renders before credentials are configured

## What it shows

- Portfolio health score based on the latest deploy posture
- Sites monitored, deploy success rate, active forms, and connected tooling
- Recent deploy activity with direct links back to Netlify
- Alerts for failed deploys and stale deploy activity
- Connected system status for sites, deploys, forms, and source control
- Searchable production property cards
- Operator recommendations for the next business action

## Connect to Netlify

Create a Netlify personal access token with read access to the account/sites you want this internal dashboard to monitor. Add the token as an environment variable in Netlify, never in client-side code.

Required:

```bash
NETLIFY_AUTH_TOKEN=ntl_your_token_here
```

Optional filters:

```bash
NETLIFY_ACCOUNT_SLUG=your-team-slug
NETLIFY_SITE_IDS=curatedportal
NETLIFY_SITE_URLS=curatedportal.netlify.app
NETLIFY_SITE_LIMIT=24
NETLIFY_DETAIL_LIMIT=8
```

For `curatedportal.netlify.app`, set `NETLIFY_SITE_URLS=curatedportal.netlify.app`. You can also use `NETLIFY_SITE_IDS=curatedportal` if that is the Netlify site name. `NETLIFY_DETAIL_LIMIT` controls how many sites receive deeper deploy and forms enrichment, which keeps API usage predictable for larger accounts.

## Run locally

Install or use the Netlify CLI, then run:

```bash
npm run dev
```

For local live data, copy `.env.example` to `.env` and provide your Netlify values. If no token is configured, the dashboard falls back to `public/sample-data.json` and clearly marks itself as demo mode.

## Verify

```bash
npm run check
```

This validates JavaScript syntax and confirms the dashboard sample data shape.

## Customize for your business

- Update the brand copy in `public/index.html`
- Tune visual design tokens in `public/styles.css`
- Add or revise Netlify-derived metrics in `netlify/functions/netlify-dashboard.mjs`
- Replace `public/sample-data.json` with representative non-sensitive fixtures for demos