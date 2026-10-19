# Architecture

LearnTwin contains three related but separate components. They do not currently share a unified user identity or database.

## Browser planner

`frontend/src/App.jsx` selects the planner by default. `DegreePlanner.jsx` owns the forms, UI state, import/export and browser persistence. `planner.js` implements initial records, validation, assignment ordering, credit calculations and safe URL handling.

Records use localStorage key `learntwin.planner.v1`. The planner does not call the Python backend. It works without that service once the frontend is loaded; no service worker or installable offline application is supplied.

Assignments are ordered by due date, then descending remaining effort, then title. Undated work follows dated work. Overview shows at most five unfinished assignments. The workload includes overdue work and work due within seven days; it is not calendar scheduling.

The remaining-credit estimate subtracts explicitly passed credits from an editable baseline and floors the result at zero. It does not evaluate prerequisites, degree rules or admission eligibility.

## Classroom prototype

`StudentView.jsx` sends arrays through `api.js` to FastAPI's `POST /ingest/json`. The API validates records with Pydantic, and `storage.py` persists them in SQLite.

`GET /mastery/{class_id}` aggregates all recorded rows for a class. Despite the route name, these are feedback averages, not Bayesian mastery probabilities. Population means metric rows, not distinct students.

`DashboardView.jsx` reads reflection data from `mockData.js`. `LiveDashboard.jsx` generates simulated updates on a timer. Neither dashboard currently consumes the stored class aggregates. Creating a classroom session generates a browser-side code; it does not create an authenticated server session.

`GET /recommend/{class_id}` returns an empty focus list and a placeholder note.

## Python learning-analytics library

`learntwin/` contains Bayesian Knowledge Tracing and recommendation implementations, compatibility exports and tests. `tests/` and `learntwin/tests/` exercise Python behavior. This library is separate from the classroom metrics aggregation and has not been connected to the HTTP recommendation endpoint.

`sample_data/` contains research CSV inputs. These are not the JSON payload accepted by the HTTP ingestion endpoint.

## Configuration and deployment boundaries

- Frontend: React, Vite, npm lockfile and static output in `frontend/dist/`.
- Backend: FastAPI, uvicorn and Pydantic from `requirements.txt`; Python 3.10+ from package metadata.
- `API_KEY`: backend process setting, default `devkey`.
- `SQLITE_PATH`: backend database path, default `app.db` relative to the working directory.
- `VITE_API_URL` and `VITE_API_KEY`: frontend build-time settings with localhost/devkey fallbacks.
- CORS currently permits only `http://localhost:5173` and `http://localhost:5174`.

Deploying the static planner does not deploy the classroom service. Public classroom operation needs authentication, access control, appropriate origins and durable database management. The shared browser-visible API key does not provide individual authorization.
