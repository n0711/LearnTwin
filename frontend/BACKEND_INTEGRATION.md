# Classroom backend integration

The implemented backend is Python/FastAPI with SQLite. Express, MongoDB, Firebase and Socket.IO are not required and are not implemented in this repository. The degree/PhD planner is independent of this API.

Follow the [root setup instructions](../README.md), starting uvicorn from `backend/`. Inspect the running schema at http://localhost:8000/docs or `/openapi.json`.

## Configuration

Backend process environment:

- `API_KEY`: shared development key, default `devkey`.
- `SQLITE_PATH`: database file, default `app.db` relative to the process working directory. Use a separate file for smoke tests if you need to preserve existing records.

Frontend `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:8000
VITE_API_KEY=devkey
```

The backend reads process variables directly; do not assume it loads a backend `.env` file. Restart the backend after changing its environment. Restart Vite after frontend environment changes.

CORS permits `http://localhost:5173` and `http://localhost:5174`. A frontend on a different origin requires a code/configuration change. CORS is not authentication.

## Endpoints

- `GET /health`: no key; returns `{"status":"ok"}`.
- `POST /ingest/json`: requires `X-API-Key`; accepts an array of metrics.
- `GET /mastery/{class_id}`: requires the key; returns class aggregates.
- `GET /recommend/{class_id}`: requires the key; returns a placeholder.
- `GET /docs` and `GET /openapi.json`: generated API documentation.

## Ingest example

Send this JSON array to `POST /ingest/json` using Swagger UI or your HTTP client:

```json
[
  {
    "class_id": "docs-demo",
    "student_id": 1,
    "stuck": 0,
    "got_it": 1,
    "pause": 0,
    "example": 0,
    "confidence": 8
  }
]
```

All fields shown are required. Each flag is an integer 0 or 1. Student IDs must be at least 1; confidence is an integer from 1 to 10. An optional timestamp string is accepted; omission/null uses current UTC. Supply consistent ISO 8601 UTC values because timestamps are stored as text, not strictly parsed dates.

The success report contains `rows_ok`, `rows_skipped` and `errors`. Pydantic validates the request before the handler runs: a schema-invalid record rejects the entire request with HTTP 422. The skipped-row report applies to failures encountered later during insertion. Check the report even after HTTP 200.

In bash, test a synthetic record with:

```sh
curl -sS http://localhost:8000/health
curl -sS -X POST http://localhost:8000/ingest/json \
  -H 'Content-Type: application/json' -H 'X-API-Key: devkey' \
  --data '[{"class_id":"docs-demo","student_id":1,"stuck":0,"got_it":1,"pause":0,"example":0,"confidence":8}]'
curl -sS -H 'X-API-Key: devkey' http://localhost:8000/mastery/docs-demo
curl -sS -H 'X-API-Key: devkey' http://localhost:8000/recommend/docs-demo
```

In Windows PowerShell use `curl.exe` with appropriate JSON quoting, or use the interactive `/docs` page.

On a fresh database, the example yields one metric row, got-it rate 1 and average confidence 8. Repeating ingestion adds rows; there is no deduplication.

## Aggregate semantics

The response contains `class_id`, `population`, four `rate_*` fields, `avg_confidence` and `last_timestamp`.

Population counts rows, not unique people. Rates are means of each binary flag, rounded to four decimals; confidence is rounded to three. Multiple flags may be set in a record, so rates need not sum to one. Unknown classes return zero population/rates/confidence and a null timestamp.

There is no time-window or session-number filter. Aggregates cover all rows with the same class ID. Timestamp ordering uses the stored strings.

## Frontend behavior

Student confidence 1–5 is multiplied by two for API submission. Reflection counts become one row per signal. Names and reflection session numbers are not sent as metric fields; the form currently logs them in the browser console.

Student IDs are randomly generated and are not stable identities. The random expression can produce zero, which the API rejects. Classroom codes are generated client-side.

The reflection dashboard reads mock data. The live dashboard simulates updates every three seconds. To verify actual submissions, query `/mastery/{class_id}`; do not use the dashboard as proof of integration.

## Troubleshooting

- Connection refused: confirm the backend is running on port 8000.
- HTTP 401: frontend and backend keys differ.
- HTTP 422: inspect the response detail for invalid input or a missing required key header.
- Browser CORS error: compare the frontend origin with the two configured origins.
- Import error for `schemas` or `storage`: start from `backend/` with `app:app`.
- SQLite write error: verify the selected database path and directory permissions.
- Dashboard numbers do not match submissions: dashboards are still demonstrations.

## Public deployment boundary

The frontend key is readable by users. There are no per-user roles, per-class permissions or authenticated session creation. Add those controls before using real classroom records on a public service. Run the backend with durable SQLite storage and backups, configure HTTPS and exact allowed origins, and exclude development reload mode.
