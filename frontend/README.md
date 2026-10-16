# LearnTwin frontend

React and Vite frontend for the degree/PhD planner and the earlier classroom prototype. See the [root README](../README.md) for branch status and complete setup.

## Development

Use Node.js 22.12+ and npm. From this directory:

```sh
npm ci
npm run dev -- --host localhost --port 5173
```

Use the URL printed by Vite. The planner does not need Python. Classroom submissions require the [FastAPI backend](BACKEND_INTEGRATION.md).

## Routes

- `#/planner`, or an empty hash: degree and PhD planner.
- `#/classroom`: classroom entry screen.
- `#/s/1234`: student form for class code 1234.
- `#/d/1234`: classroom dashboard for that code.

The dashboard reflection view uses mock data and the live view simulates signals. A successful student submission does not update either dashboard.

## Commands

```sh
npm test
npm run lint
npm run build
npm run preview
```

Tests use Node's built-in test runner on `tests/*.test.js`. Lint and build are independent checks. Preview serves the production output locally.

## Configuration

`src/api.js` reads `VITE_API_URL` and `VITE_API_KEY`. See `.env.example` for local defaults. Restart the development server after changes; rebuild production assets after changing build-time settings. Browser bundles expose these values.

The backend currently allows localhost ports 5173 and 5174. A different port or using 127.0.0.1 as the frontend hostname requires an appropriate backend CORS change.

## Static hosting

Build this directory and publish `dist/` at the root of an HTTPS origin. Hash routes need no server rewrite. Hosting under a subpath requires Vite base-path configuration and verification. Localhost development or HTTPS also supports the planner's use of `crypto.randomUUID()`.

Planner data remains on the user's browser, not the host. A preview deployment and a production deployment have different origins and therefore different records. Export a backup before changing origin and import it on the destination.

Before release, verify narrow-screen layout, keyboard access, reload persistence, export/import confirmation and cancellation, invalid-file handling, and all classroom navigation links.

## Source guide

- `src/App.jsx`: hash routes.
- `src/DegreePlanner.jsx`: planner UI and persistence.
- `src/planner.js`: calculations and validation.
- `src/StudentView.jsx`: classroom submissions.
- `src/DashboardView.jsx`, `src/LiveDashboard.jsx`, `src/mockData.js`: demonstration analytics.
- `src/api.js`: classroom HTTP client.
