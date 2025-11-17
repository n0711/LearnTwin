# schemas.py
# Pydantic (v2) models for the current API:
# - JSON ingest of metrics records
# - Class-level mastery aggregates
# - Class-level recommendations (stub)

from typing import List, Optional
from pydantic import BaseModel, Field


class MetricsRecord(BaseModel):
    class_id: str = Field(..., min_length=1)
    student_id: int = Field(..., ge=1)
    stuck: int = Field(..., ge=0, le=1)
    got_it: int = Field(..., ge=0, le=1)
    pause: int = Field(..., ge=0, le=1)
    example: int = Field(..., ge=0, le=1)
    confidence: int = Field(..., ge=1, le=10)
    # If omitted by client, server fills current UTC ISO timestamp.
    timestamp: Optional[str] = Field(
        default=None, description="ISO8601 date-time; auto-filled by server if omitted"
    )


class MetricsIngestReport(BaseModel):
    rows_ok: int
    rows_skipped: int
    errors: List[str] = Field(default_factory=list)


class ClassMastery(BaseModel):
    class_id: str
    population: int = Field(..., description="Number of metric rows considered")
    rate_stuck: float = Field(..., ge=0.0, le=1.0)
    rate_got_it: float = Field(..., ge=0.0, le=1.0)
    rate_pause: float = Field(..., ge=0.0, le=1.0)
    rate_example: float = Field(..., ge=0.0, le=1.0)
    avg_confidence: float = Field(..., ge=0.0, le=10.0)
    last_timestamp: Optional[str] = None


class ClassRecommendations(BaseModel):
    class_id: str
    focus: List[str] = Field(
        default_factory=list,
        description="Placeholder list; produced by external recommender later",
    )
    note: Optional[str] = Field(default="Recommender not yet implemented.")
