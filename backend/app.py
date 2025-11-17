# app.py
# FastAPI service (JSON ingest only, class-level mastery, class-level recommend stub)

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import List

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import (
    MetricsRecord,
    MetricsIngestReport,
    ClassMastery,
    ClassRecommendations,
)
import storage


API_KEY = os.getenv("API_KEY", "devkey")

app = FastAPI(
    title="Pipes & Persistence API",
    version="0.2.0",
    description=(
        "JSON ingest → SQLite metrics; class-level mastery analytics; "
        "class recommendations (stub to be implemented later).\n\n"
        "**Auth:** send header `X-API-Key`."
    ),
    contact={"name": "Team", "email": "team@example.com"},
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Vite dev server ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def require_api_key(x_api_key: str = Header(..., alias="X-API-Key")) -> bool:
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True


@app.on_event("startup")
def _startup() -> None:
    storage.init_db()


# ------------------------------- Ingest (JSON) ------------------------------- #

@app.post("/ingest/json", response_model=MetricsIngestReport, tags=["ingest"])
async def ingest_json(
    payload: List[MetricsRecord],
    _: bool = Depends(require_api_key),
):
    """
    Ingest an array of metrics records (JSON).
    - Required per record: class_id, student_id, flags (0/1), confidence (1..10)
    - timestamp: optional; if missing, set to current UTC time
    - Bad records are skipped; returns a summary report
    """
    rows_ok, rows_skipped = 0, 0
    errors: List[str] = []
    now_iso = datetime.now(timezone.utc).isoformat()

    with storage.connect() as con:
        for i, rec in enumerate(payload, start=1):
            try:
                ts = rec.timestamp.strip() if rec.timestamp else now_iso
                storage.insert_metric(
                    con=con,
                    class_id=rec.class_id.strip(),
                    student_id=int(rec.student_id),
                    stuck=int(rec.stuck),
                    got_it=int(rec.got_it),
                    pause=int(rec.pause),
                    example=int(rec.example),
                    confidence=int(rec.confidence),
                    timestamp=ts,
                )
                rows_ok += 1
            except Exception as e:
                rows_skipped += 1
                errors.append(f"item {i}: {e}")

    return MetricsIngestReport(rows_ok=rows_ok, rows_skipped=rows_skipped, errors=errors[:50])


# --------------------------- Class-level Mastery ----------------------------- #

@app.get("/mastery/{class_id}", response_model=ClassMastery, tags=["analytics"])
def get_class_mastery(
    class_id: str,
    _: bool = Depends(require_api_key),
):
    """
    Class-level aggregates computed from metrics:
      - rates (0..1) for stuck / got_it / pause / example
      - average confidence (1..10)
      - population (row count) and last timestamp
    """
    agg = storage.get_class_mastery_aggregate(class_id)
    return ClassMastery(
        class_id=class_id,
        population=agg["n"],
        rate_stuck=round(agg["rate_stuck"], 4),
        rate_got_it=round(agg["rate_got_it"], 4),
        rate_pause=round(agg["rate_pause"], 4),
        rate_example=round(agg["rate_example"], 4),
        avg_confidence=round(agg["avg_confidence"], 3),
        last_timestamp=agg["last_ts"],
    )


# ------------------------ Class-level Recommendations ------------------------ #

@app.get("/recommend/{class_id}", response_model=ClassRecommendations, tags=["recommend"])
def recommend_for_class(
    class_id: str,
    _: bool = Depends(require_api_key),
):
    """
    Placeholder: to be implemented later via an external recommender module.
    Current behavior: return an empty focus list with a human-readable note.
    """
    # TODO: integrate your external recommender (e.g., import module and call)
    return ClassRecommendations(class_id=class_id, focus=[], note="Recommender not yet implemented.")


# --------------------------------- Health ----------------------------------- #

@app.get("/health", tags=["ops"])
def health():
    return {"status": "ok"}
