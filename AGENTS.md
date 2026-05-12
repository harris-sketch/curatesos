# Agents

## Cursor Cloud specific instructions

### Project overview

CurateSOS is a zero-dependency static Netlify dashboard. It serves vanilla HTML/CSS/JS from `public/` and has one Netlify Function at `netlify/functions/netlify-dashboard.mjs` that proxies the Netlify API.

### Running the dev server

```bash
npm run dev
```

This wraps `netlify dev --dir public` and starts a local server at **http://localhost:8888** with the Netlify Function available at `/api/netlify-dashboard`. Without a `NETLIFY_AUTH_TOKEN` env var, the dashboard automatically falls back to demo mode using `public/sample-data.json`.

### Lint / validation

```bash
npm run check
```

Runs `node --check` on JS files and validates `sample-data.json` structure via `scripts/validate-dashboard.mjs`. There is no separate linter (ESLint, Prettier, etc.) configured.

### Build

```bash
npm run build
```

This just runs `npm run check` — there is no compilation or bundling step for the static frontend.

### Key caveats

- The Netlify CLI must be installed globally (`npm install -g netlify-cli`) since there are no `devDependencies` in `package.json`.
- `netlify dev` will print an error about not being able to open a browser in headless/container environments — this is harmless and the server still starts correctly on port 8888.
- The app has **no `node_modules` or lockfile** — there are zero npm dependencies. The only external tool is the Netlify CLI.
- To test with live Netlify data, copy `.env.example` to `.env` and add a valid `NETLIFY_AUTH_TOKEN`. Otherwise, demo mode works out of the box.
