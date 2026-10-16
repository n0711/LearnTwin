# Known issues and implementation limits

This list separates source-confirmed behavior from historical test reports. It is not a claim that all checks have been rerun.

## Planner

- Records are browser-local, with no accounts or cross-device sync. Backups are manual.
- ECTS is a baseline calculation, not an official degree evaluation.
- The initial course list and 60-ECTS baseline are seeded planning defaults, not university-verified records.
- Application deadlines and eligibility/funding checkboxes are entered by the user.
- Browser interaction, mobile layout and accessibility remain release checks for PR #5.
- The weekly text export labels a numeric zero-hour estimate as "not estimated" because it uses a truthiness fallback.
- There is no multi-tab conflict handling; avoid editing the same plan in multiple tabs simultaneously.

## Classroom

- Reflection dashboards use mock data. Live dashboards simulate updates rather than displaying API submissions.
- Student submissions use random IDs, which can be zero and trigger validation failure. IDs are not stable participant identities.
- The reflection form requests a name and logs it locally; do not treat its "Anonymous" label as a verified privacy guarantee.
- The UI does not use insertion-report counts to distinguish partial ingestion from complete success.
- Session codes are client-generated, without authenticated server session management.
- The shared API key is visible in the browser bundle. There is no per-user or per-class authorization.
- CORS allows only localhost ports 5173 and 5174.
- The HTTP recommendation endpoint remains a stub.
- Timestamps are stored as strings; class IDs are trimmed without a second nonempty check.
- Aggregate population counts metric rows, not distinct students, and includes all records for a class.

## Python library: historical test report

The previous known-issues document reported a failure in
`tests/test_determinism.py::test_recommender_deterministic_sort`,
involving recommender wiring and defaults (`bkt`, `catalog`).
Reproduce it with `python -m pytest` in the current checkout before treating it as resolved or asserting the full suite passes.

## Data demo

`scripts/demo_on_sample_data.py` expects a classroom-summary CSV that is not supplied. The existing research CSVs use another schema. See [data formats](docs/data_schemas.md).

For proposed fixes and acceptance criteria, see the [roadmap](docs/ROADMAP.md).
