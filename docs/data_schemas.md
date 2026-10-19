# Data formats

LearnTwin has three separate formats. A planner backup is not an API payload, and the research CSVs are not accepted by the JSON endpoint.

## Planner backup: version 1

Export from the planner to obtain the complete JSON structure. Top-level fields are:

- `version`: number 1.
- `baseline`: remaining ECTS at the start of tracking.
- `capacity`: available study hours for the week.
- `courses`: records with `id`, `title`, `credits`, `status`, `notes`.
- `tasks`: records with `id`, `title`, `course`, `due`, `hours`, `status`, `notes`.
- `apps`: records with `id`, `university`, `program`, `url`, `deadline`, `status`, `notes`, `checks`.
- `thesis`: strings `topic`, `supervisor`, `milestone`, `notes`.

IDs must be nonempty and unique within each collection. Task `course` must reference an existing course ID. Collections are limited to 2,000 records each. Unknown credits/hours use an empty string, not null; known amounts may be numbers or numeric strings from 0 to 10,000. Baseline and capacity must be finite numbers in that range. The capacity UI caps values at 168 hours.

Dates are empty strings or valid calendar dates in `YYYY-MM-DD` format. Status values are case-sensitive:

- Courses: `Planned`, `In progress`, `Passed`.
- Tasks: `To do`, `In progress`, `Done`.
- Applications: `Researching`, `Preparing`, `Submitted`, `Interview`, `Offer`, `Closed`.

Every application's `checks` object must contain Boolean values for `Eligibility verified`, `Funding verified`, `CV ready`, `Statement ready`, `Transcript ready`, and `References ready`.

The UI rejects files over 3,000,000 bytes. Validation runs before replacement confirmation. Imports replace the current dataset, rather than merging it. Only HTTP/HTTPS programme URLs are rendered as external links. See `frontend/src/planner.js` for exact string-length constraints.

## Classroom metrics JSON

`POST /ingest/json` accepts an array of objects with:

- `class_id`: nonempty string, trimmed during insertion.
- `student_id`: integer at least 1.
- `stuck`, `got_it`, `pause`, `example`: required integer flags 0 or 1.
- `confidence`: required integer 1–10.
- `timestamp`: optional string or null; omission/null is filled with current UTC.

Timestamps are strings, not strictly validated date-time objects. Whitespace-only class IDs are not explicitly rejected after trimming. Use normalized IDs and UTC ISO 8601 timestamps in clients.

SQLite stores students, classes and metrics. It does not store planner records, document files, a name field or the frontend's reflection session number. See the [integration guide](../frontend/BACKEND_INTEGRATION.md) for error handling and aggregation.

## Research CSVs

The original sample format under `sample_data/` is:

- `users.csv`: `user_id` (string).
- `items.csv`: `item_id`, `skill_id` (strings).
- `interactions.csv`: `user_id`, `item_id`, `skill_id`, `correct` (0/1), `ts` (optional ISO 8601 timestamp).

These files belong to the learning-analytics experiments, not classroom ingestion. The separate `scripts/demo_on_sample_data.py` expects a `demo_class.csv` with `student_id`, `student_name`, `avg_score`, `attendance_rate`, and `last_activity_days_ago`; that file is not currently supplied. Its fallback to a different CSV should not be treated as a validated demonstration of the research schemas.
