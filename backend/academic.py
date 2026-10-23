"""Local Frederick transcript ingestion. No PDFs or student identity data are retained."""
from __future__ import annotations

import hashlib
import io
import json
import os
from pathlib import Path
import re
import subprocess

from fastapi import HTTPException
from pypdf import PdfReader

TERM = re.compile(r"Semester\s*:\s*((?:Spring|Fall|Summer)\s+20\d{2})", re.I)
COURSE = re.compile(
    r"(?m)^\s*(?P<earned>\d)(?P<attempted>\d)(?P<code>[A-Z]{4}\d{3})\s+"
    r"(?P<title>[A-Z0-9 &/(),.\-]+?)\s+(?P<grade>\d{1,2}[,.]\d{2})\s+"
    r"\d+[,.]\d{2}/\d+\s*$"
)
SUMMARY = re.compile(
    r"Semester\s+ECTS:\s*Semester\s+GPA:\s*(\d+)\s+"
    r"(\d{1,2}[,.]\d{1,2})\s+(\d{1,2}[,.]\d{1,2})", re.I
)


def parse_transcript(data: bytes) -> dict:
    if not data.startswith(b"%PDF-") or len(data) > 5_000_000:
        raise ValueError("Choose a PDF transcript of 5 MB or less.")
    try:
        reader = PdfReader(io.BytesIO(data), strict=False)
        if len(reader.pages) == 0 or len(reader.pages) > 40:
            raise ValueError("The PDF must have 1–40 pages.")
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError("Could not read the PDF. Scanned PDFs need a text layer.") from exc
    if "ACADEMIC RECORD" not in text.upper():
        raise ValueError("This does not appear to be a Frederick Academic Record.")
    chunks = TERM.split(text)
    if len(chunks) < 3:
        raise ValueError("No semester records were recognized. Check the transcript format.")
    match = re.search(r"Transferr?ed\s+ECTS\s*:\s*(\d+)", text, re.I)
    transferred = int(match.group(1)) if match else 0
    courses, history = [], []
    for pos in range(1, len(chunks), 2):
        term, block = chunks[pos].strip(), chunks[pos + 1]
        rows = list(COURSE.finditer(block))
        visible_codes = re.findall(r"[A-Z]{4}\\d{3}", block)
        if not rows or sorted(visible_codes) != sorted(row['code'] for row in rows):
            raise ValueError(f"Some course rows in {term} could not be recognized. Nothing imported.")
        for row in rows:
            attempted, earned = int(row['attempted']), int(row['earned'])
            if attempted < 1 or earned > attempted:
                raise ValueError(f"Invalid attempted/earned credits for {row['code']}.")
            courses.append({
                'term': term, 'code': row['code'], 'title': row['title'].strip(),
                'attempted': attempted, 'earned': earned,
                'grade': float(row['grade'].replace(',', '.')),
                'status': 'Passed' if earned else 'Failed',
            })
        summary = SUMMARY.search(block)
        if not summary:
            raise ValueError(f"GPA/ECTS summary not recognized for {term}. Nothing imported.")
        history.append({
            'term': term,
            'cumulative_ects': int(summary.group(1)),
            'semester_gpa': float(summary.group(2).replace(',', '.')),
            'cumulative_gpa': float(summary.group(3).replace(',', '.')),
        })
        if sum(r['earned'] for r in courses) + transferred != history[-1]['cumulative_ects']:
            raise ValueError(f"Cumulative ECTS do not reconcile for {term}; import cancelled.")
    if len({(c['term'], c['code']) for c in courses}) != len(courses):
        raise ValueError("Duplicate course rows were detected; import cancelled.")
    issue_dates = re.findall(r"(\d{2})/(\d{2})/(20\d{2})", text)
    issued = f"{issue_dates[-1][2]}-{issue_dates[-1][1]}-{issue_dates[-1][0]}" if issue_dates else ''
    return {
        'id': hashlib.sha256(data).hexdigest(), 'issued': issued,
        'transferred_ects': transferred, 'earned_ects': history[-1]['cumulative_ects'],
        'cumulative_gpa': history[-1]['cumulative_gpa'],
        'courses': courses, 'history': history,
    }


def run_store(action: str, payload: dict | list | None = None) -> dict:
    root = Path(__file__).resolve().parent
    default = root / 'academic_store' / 'target' / 'release' / ('academic_store.exe' if os.name == 'nt' else 'academic_store')
    binary = Path(os.environ.get('LEARNTWIN_STORE_BIN', str(default)))
    if not binary.is_file():
        raise HTTPException(status_code=503, detail='Rust academic database not built; run cargo build --release in backend/academic_store.')
    try:
        result = subprocess.run(
            [str(binary), action], input=json.dumps(payload if payload is not None else {}),
            text=True, capture_output=True, timeout=12, cwd=root,
            env={**os.environ, 'LEARNTWIN_DB': os.environ.get('LEARNTWIN_DB', str(root / 'academic_records.sqlite3'))},
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise HTTPException(status_code=503, detail='Local academic database unavailable.') from exc
    if result.returncode:
        raise HTTPException(status_code=500, detail='Rust academic database operation failed.')
    try:
        return json.loads(result.stdout)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail='Rust academic database returned invalid JSON.') from exc
