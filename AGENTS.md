# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

CurateSOS is a zero-dependency Netlify dashboard (static HTML/CSS/JS + one serverless function). See `README.md` for full details.

### Running locally

- **Dev server:** `npm run dev` starts the Netlify CLI dev server on `http://localhost:8888`. The CLI must be installed globally (`npm install -g netlify-cli`).
- **Demo mode:** Without `NETLIFY_AUTH_TOKEN`, the dashboard automatically falls back to `public/sample-data.json`. This is sufficient for UI development and testing.
- **Live mode:** Set `NETLIFY_AUTH_TOKEN` in a `.env` file (copy from `.env.example`) to connect to real Netlify data.

### Validation / lint

- `npm run check` runs syntax checks on all JS files and validates the sample-data structure. There is no separate linter or test framework.
- `npm run build` is an alias for `npm run check` (static assets need no compilation).

### Key gotchas

- The Netlify CLI dev server binds to port **8888** (static server on 3999 internally). If port 8888 is occupied, the CLI will pick the next available port — check terminal output.
- The serverless function at `/api/netlify-dashboard` returns HTTP 503 when no auth token is set. The frontend handles this gracefully by loading sample data.
- There are **zero npm dependencies** — `package.json` has no `dependencies` or `devDependencies`. The only external tool is the Netlify CLI.
- The application code lives on the `cursor/netlify-business-dashboard-6df8` branch, not `main`.
