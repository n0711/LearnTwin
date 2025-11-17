# storage.py
# SQLite persistence for metrics + class-level aggregates.

from __future__ import annotations

import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Dict


DB_PATH = os.getenv("SQLITE_PATH", "app.db")

SCHEMA_SQL = """
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS students (
  student_id INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS classes (
  class_id TEXT PRIMARY KEY
);

-- Metrics table: binary flags + confidence score + timestamp
CREATE TABLE IF NOT EXISTS metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id TEXT NOT NULL,
  student_id INTEGER NOT NULL,
  stuck INTEGER NOT NULL CHECK (stuck IN (0,1)),
  got_it INTEGER NOT NULL CHECK (got_it IN (0,1)),
  pause INTEGER NOT NULL CHECK (pause IN (0,1)),
  example INTEGER NOT NULL CHECK (example IN (0,1)),
  confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 10),
  timestamp TEXT NOT NULL,
  FOREIGN KEY(student_id) REFERENCES students(student_id),
  FOREIGN KEY(class_id) REFERENCES classes(class_id)
);

CREATE INDEX IF NOT EXISTS idx_metrics_class_student ON metrics(class_id, student_id);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
"""


def _ensure_parent_dir(path: str) -> None:
    p = Path(path)
    if p.parent and not p.parent.exists():
        p.parent.mkdir(parents=True, exist_ok=True)


@contextmanager
def connect():
    _ensure_parent_dir(DB_PATH)
    con = sqlite3.connect(DB_PATH, timeout=10.0)
    con.row_factory = sqlite3.Row
    try:
        yield con
        con.commit()
    finally:
        con.close()


def init_db() -> None:
    with connect() as con:
        con.executescript(SCHEMA_SQL)


# -------------------------- upserts & inserts -------------------------------- #

def upsert_student(con: sqlite3.Connection, student_id: int) -> None:
    con.execute(
        "INSERT OR IGNORE INTO students(student_id) VALUES (?)",
        (int(student_id),),
    )


def upsert_class(con: sqlite3.Connection, class_id: str) -> None:
    con.execute(
        "INSERT OR IGNORE INTO classes(class_id) VALUES (?)",
        (class_id,),
    )


def insert_metric(
    con: sqlite3.Connection,
    class_id: str,
    student_id: int,
    stuck: int,
    got_it: int,
    pause: int,
    example: int,
    confidence: int,
    timestamp: str,
) -> None:
    upsert_class(con, class_id)
    upsert_student(con, student_id)
    con.execute(
        """
        INSERT INTO metrics (class_id, student_id, stuck, got_it, pause, example, confidence, timestamp)
        VALUES (?,?,?,?,?,?,?,?)
        """,
        (class_id, int(student_id), int(stuck), int(got_it), int(pause), int(example), int(confidence), timestamp),
    )


# -------------------------- aggregates --------------------------------------- #

def get_class_mastery_aggregate(class_id: str) -> Dict:
    """
    Returns:
      {
        "n": int,
        "rate_stuck": float,
        "rate_got_it": float,
        "rate_pause": float,
        "rate_example": float,
        "avg_confidence": float,
        "last_ts": str|None
      }
    Aggregates are computed over all rows for the class:
    - rates are averages of 0/1 flags
    - avg_confidence is numeric average (1..10)
    """
    with connect() as con:
        row = con.execute(
            """
            SELECT
              COUNT(*) AS n,
              AVG(CAST(stuck     AS REAL)) AS rate_stuck,
              AVG(CAST(got_it    AS REAL)) AS rate_got_it,
              AVG(CAST(pause     AS REAL)) AS rate_pause,
              AVG(CAST(example   AS REAL)) AS rate_example,
              AVG(CAST(confidence AS REAL)) AS avg_confidence,
              MAX(timestamp) AS last_ts
            FROM metrics
            WHERE class_id = ?;
            """,
            (class_id,),
        ).fetchone()

        if row is None or row["n"] is None or int(row["n"]) == 0:
            return {
                "n": 0,
                "rate_stuck": 0.0,
                "rate_got_it": 0.0,
                "rate_pause": 0.0,
                "rate_example": 0.0,
                "avg_confidence": 0.0,
                "last_ts": None,
            }

        return {
            "n": int(row["n"]),
            "rate_stuck": float(row["rate_stuck"] or 0.0),
            "rate_got_it": float(row["rate_got_it"] or 0.0),
            "rate_pause": float(row["rate_pause"] or 0.0),
            "rate_example": float(row["rate_example"] or 0.0),
            "avg_confidence": float(row["avg_confidence"] or 0.0),
            "last_ts": row["last_ts"],
        }
