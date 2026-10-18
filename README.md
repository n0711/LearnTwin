# LearnTwin

*Make understanding visible.*

LearnTwin lets students tell a teacher, live and anonymously, how a lesson is
landing. Students join a session with a short code and tap a signal (**Stuck**,
**Got it**, **Pause**, **Example?**) along with how confident they feel. The
teacher opens a dashboard for the same code and sees the class at a glance:
signal mix, average confidence, and tips when confusion spikes.

It was built as an MVP during DigiEduHack 2025 and is published as open source.

The longer-term idea is a full "learning twin": one AI-assisted workspace where
learners keep their course material, ask questions about their own notes, and
get study paths and progress feedback. That part is not built yet.

## What works today

| Part | State |
| --- | --- |
| Student view: join by code, send signals and confidence | working, posts to the backend |
| Backend: ingest signals, store them in SQLite, class-level aggregates | working |
| Teacher dashboards: live view, class analytics, session comparison, CSV export | working UI, but driven by simulated data, not yet by the backend |
| Recommendations (`/recommend`) | stub that returns an empty list |
| `learntwin` Python package: Bayesian Knowledge Tracing and a recommender | early, see [Known issues](KNOWN_ISSUES.md) |

## Architecture

```text
frontend/ (React + Vite, port 5173)
    |  X-API-Key header
    v
backend/  (FastAPI + uvicorn, port 8000)  -->  SQLite (backend/app.db)
```

Backend endpoints (all except `/health` need the `X-API-Key` header):

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/ingest/json` | store a list of signal records (`class_id`, `student_id`, the four 0/1 flags, `confidence` 1 to 10, optional `timestamp`) |
| `GET` | `/mastery/{class_id}` | rates of each signal, average confidence, record count, last timestamp |
| `GET` | `/recommend/{class_id}` | placeholder |
| `GET` | `/health` | liveness check |

Interactive API docs are at `http://localhost:8000/docs` while the backend runs.

## Run it locally

You need Python 3.10 or newer and Node.js 20.19 or newer (Vite 7). Use two
terminals.

### Backend

PowerShell:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:API_KEY = "devkey"
cd backend
python -m uvicorn app:app --reload --port 8000
```

macOS or Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export API_KEY=devkey
cd backend
python -m uvicorn app:app --reload --port 8000
```

`API_KEY` defaults to `devkey` when unset. The database file comes from
`SQLITE_PATH` and defaults to `app.db` in the folder you start from.

### Frontend

```bash
cd frontend
npm install
npm run dev -- --host localhost --port 5173
```

Open http://localhost:5173. The frontend reads the backend address and key from
`frontend/.env` (`VITE_API_URL`, `VITE_API_KEY`). See `frontend/.env.example`.

Try it: on the home page, click **Create New Session** as the teacher, then open
a second tab, enter the same code under **For Students**, and send a few
signals.

## Repository layout

```text
backend/        FastAPI app, SQLite storage, request and response schemas
frontend/       React + Vite UI (student view, teacher dashboards)
learntwin/      Python package: BKT model and recommender (work in progress)
sample_data/    example users, items, and interactions as CSV
scripts/        demo and latency helpers
tests/          pytest suite
docs/           API contract, data schemas, integration notes
```

## Tests

```bash
python -m pytest
```

The suite does not pass yet. Two test modules currently fail to load and one
recommender test is known to fail. See [`KNOWN_ISSUES.md`](KNOWN_ISSUES.md).
Those are good first contributions.

## Contributing

This started as a hackathon prototype and is growing into a more robust
open-source tool.

1. Fork the repo.
2. Create a feature branch.
3. Open a PR with a clear description and, for UI changes, screenshots.

## License

MIT. See [`LICENSE`](LICENSE).
