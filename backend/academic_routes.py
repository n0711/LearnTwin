"""FastAPI routes for the optional local Rust-backed academic record database."""
from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from academic import parse_transcript, run_store


class CurrentCourse(BaseModel):
    code: str = Field(pattern=r"^[A-Z]{4}\d{3}$")
    title: str = Field(min_length=1, max_length=200)
    ects: int = Field(ge=1, le=30)


def make_academic_router(require_api_key):
    router = APIRouter(prefix="/academic", tags=["academic"], dependencies=[Depends(require_api_key)])

    async def parse(file: UploadFile):
        data = await file.read(5_000_001)
        try:
            return parse_transcript(data)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        finally:
            await file.close()

    @router.post("/preview-pdf")
    async def preview_pdf(file: UploadFile = File(...)):
        """Read and validate locally without writing to the database."""
        return await parse(file)

    @router.post("/import-pdf")
    async def import_pdf(file: UploadFile = File(...)):
        """Persist validated semester grades in the Rust SQLite store."""
        parsed = await parse(file)
        run_store('import', parsed)
        return run_store('summary')

    @router.get("/summary")
    def academic_summary():
        return run_store('summary')

    @router.post("/current")
    def sync_current(courses: list[CurrentCourse]):
        if len(courses) > 100 or len({c.code for c in courses}) != len(courses):
            raise HTTPException(status_code=422, detail="Duplicate or excessive current course records.")
        run_store('sync-current', [c.model_dump() for c in courses])
        return run_store('summary')

    return router
