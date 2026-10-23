# Frederick PDF import and degree evaluation

This optional **local-only** service uses FastAPI for PDF ingestion, a Rust CLI for database operations and SQLite for local persistence. The original PDF, name, DOB and student number are not stored.

## Prerequisites

Windows: Node.js 22.12+, Python 3.10+ and the Rust toolchain (rustup; install the C++ Build Tools if Cargo requests them). Use `npm.cmd` if PowerShell blocks `npm.ps1`.

## Start Rust database + FastAPI

From the LearnTwin checkout, in a PowerShell terminal:

```powershell
cd backend\academic_store
cargo build --release
cd ..
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r ..\requirements.txt
$env:API_KEY = "devkey"
.\.venv\Scripts\python.exe -m uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

In a second PowerShell terminal from the checkout:

```powershell
cd frontend
npm.cmd ci
npm.cmd run dev -- --host localhost --port 5173
```

Open http://localhost:5173, select **Degree**, choose a text-readable Frederick Academic Record PDF, click **Review PDF before saving**, verify the transcript facts, then **Confirm and save transcript**. Failed attempts with zero earned ECTS are marked `Failed`; passed classes are marked `Passed`. Each semester's reported GPA and cumulative GPA are preserved verbatim from the record.

For Fall 2026 and other current enrollments, edit courses in the Degree tab: enter the verified ECTS and choose **In progress**, then press **Sync current courses to database**. These are not included in earned ECTS.

## Behaviour and limitations

- Imports are idempotent by PDF SHA-256 fingerprint. Multiple dated transcript snapshots can be stored; the newest by issue date is displayed.
- Academic data live in `backend/academic_records.sqlite3` by default. Back up this private file; it is ignored by Git.
- Course history and GPA snapshots are kept in SQLite separately from the existing browser-only planner, which continues to work. The existing planner's Overview calculation does not automatically read the new database.
- The **240 ECTS** degree target is a *provisional estimate*, configurable with `DEGREE_TARGET_ECTS`. It does **not** verify degree requirements, substitutions, retakes, graduation eligibility or predicted final GPA.
- PDFs must have selectable text and use the supported Frederick record layout. Scanned/image-only PDFs and unfamiliar exports fail with a descriptive error rather than silently inventing values.
- The API paths are `POST /academic/preview-pdf`, `POST /academic/import-pdf`, `POST /academic/current` and `GET /academic/summary`; they require `X-API-Key`. There is no cloud sync or user authentication: **do not expose the current shared-key API to the public internet**. Keep FastAPI bound to 127.0.0.1.
- The Rust binary must be built locally before the academic endpoints can save data. Without it, API requests return 503.

## Verify

```powershell
# From repository root (after installing Python requirements):
py -3 -m pytest tests/test_academic.py

# From backend/academic_store:
cargo test

# From frontend:
npm.cmd test
npm.cmd run lint
npm.cmd run build
```
