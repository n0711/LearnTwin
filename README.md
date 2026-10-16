# LearnTwin

LearnTwin is an open-source workspace for degree progress, study planning and PhD application preparation, alongside a classroom-feedback prototype.

Track verified course credits, prioritise assignments, prepare thesis milestones and organise application requirements in one browser-based workspace. The project began as a DigiEduHack 2025 prototype and also includes a Python learning-analytics library.

> **Branch status:** The degree and PhD planner is introduced in [PR #5](https://github.com/n0711/LearnTwin/pull/5), on `feature/degree-phd-planner`. Until that PR is merged, `main` contains the earlier classroom workspace. These instructions describe the planner branch.

## What works today

- **Degree planning:** editable remaining-credit baseline, course status and verified ECTS.
- **Study planning:** assignments, due dates, effort estimates and up to five prioritised next actions.
- **Thesis preparation:** research question, confirmed supervisor, next milestone and notes.
- **PhD preparation:** programme links, deadlines, application status and document checklists.
- **Local records:** browser storage, validated JSON backup/import and a text weekly-plan export.
- **Classroom API:** JSON feedback ingestion and class-level aggregates stored in SQLite.

The classroom reflection dashboard uses mock data; its live dashboard simulates signals. Student submissions reach the API, but the dashboards do not yet display those stored submissions. The HTTP recommendation endpoint is a stub.

There is no AI chat, PDF/video ingestion, automatic degree audit, university integration, cloud sync or application submission. Planner records and checklist completion are user-entered evidence, not admission or funding predictions.

## Start the planner

Prerequisites: Git and Node.js 22.12+ with npm. The Python backend is unnecessary for the planner.

```sh
git clone --branch feature/degree-phd-planner https://github.com/n0711/LearnTwin.git
cd LearnTwin/frontend
npm ci
npm run dev -- --host localhost --port 5173
```

Open the URL printed by Vite, normally http://localhost:5173. Review the seeded courses and baseline before adding your own records. Export a backup regularly.

For an existing checkout, switch branches only after saving any local work. After PR #5 merges, use `main` instead.

## Run the optional classroom backend

Use Python 3.10+ and a separate terminal. Run from the repository root.

**Linux / macOS / WSL**

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cd backend
API_KEY=devkey ../.venv/bin/python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

**Windows PowerShell**

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:API_KEY = "devkey"
cd backend
..\.venv\Scripts\python.exe -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

The working directory matters: the backend uses local imports and defaults to `app.db` in that directory. Check http://localhost:8000/health and use http://localhost:8000/docs for interactive API documentation. The API root `/` has no route.

In `frontend/.env`, match the backend settings:

```dotenv
VITE_API_URL=http://localhost:8000
VITE_API_KEY=devkey
```

Restart Vite after editing environment variables. `devkey` is for local development; `VITE_*` values are visible to browser users and cannot protect a public multi-user service.

## Documentation

- [Documentation index](docs/README.md)
- [Degree and PhD planner guide](docs/DEGREE_PHD_PLANNER.md)
- [Architecture and implementation boundaries](docs/ARCHITECTURE.md)
- [Classroom API and integration](frontend/BACKEND_INTEGRATION.md)
- [Data formats](docs/data_schemas.md)
- [Frontend development](frontend/README.md)
- [Known issues](KNOWN_ISSUES.md)
- [Contributing](CONTRIBUTING.md)
- [Roadmap](docs/ROADMAP.md)

## Prepared desktop bundle

The Fun and Games bundle includes a prebuilt planner. With Node.js installed,
run its `Start-LearnTwin.cmd`; no npm dependency installation is required to use
that prepared build. In a source checkout, run `npm ci` and `npm run build` in
`frontend/`, then `node serve-built.mjs`. The server binds to loopback on port
5173 and serves only `dist/`.

## Checks and production build

From `frontend/`:

```sh
npm test
npm run lint
npm run build
npm run preview
```

These are separate checks; a successful build does not establish that lint or all tests pass. The static output is `frontend/dist/`. Serve it at the root of an HTTPS origin; the planner uses hash routes. Preview is a local build check, not a production server.

From the repository root, with Python dependencies installed:

```sh
python -m pytest
```

Use your virtual environment's Python executable if it is not activated. See [known issues](KNOWN_ISSUES.md) before interpreting existing failures.

## Data and privacy

Planner records stay in localStorage for the current browser profile and origin. Changing host, protocol or port uses a different storage area. Clearing site data can remove records. JSON exports contain your entered notes and application information; keep them private.

Classroom feedback is stored separately in SQLite. The current shared-key prototype lacks user accounts and per-class access control. Use synthetic classroom data during development.

## License

[MIT](LICENSE).

