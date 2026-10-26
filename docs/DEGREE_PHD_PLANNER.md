# Degree and PhD planner

The default LearnTwin screen now manages degree progress, assignments, thesis preparation and PhD applications. The earlier classroom workspace is retained at `#/classroom`; existing `#/s/<code>` and `#/d/<code>` links still work.

## Run

From `frontend/`:

```sh
npm ci
npm run dev
```

Open the local URL Vite prints. The planner does not require the Python backend. Classroom features retain their existing backend dependency.

```sh
npm test
npm run build
npm run preview
```

`frontend/dist/` is the static production build. Serve it at the root of a web origin. Hash routing does not require server-side route rewrites.

## First use

1. Review the five seeded Fall 2026 courses and the editable 60-ECTS remaining baseline. Course credit values and results are deliberately blank/unconfirmed. Add other remaining courses as their details are confirmed.
2. Enter actual assignments, due dates, source notes and estimates of remaining effort. Mark a task Done only after completing the work.
3. Record the thesis question, confirmed supervisor and next ACSC489 milestone for the transition to ACSC490.
4. Add PhD programmes using their official sources. Record verified deadlines, eligibility and funding evidence in notes, then track documents and application status.
5. Review Overview for the five highest-priority unfinished assignments, overdue work, missing information, capacity and upcoming application deadlines. Export the weekly plan to share it with an adviser or ChatGPT.

## Meaning of the results

- Remaining ECTS is the starting baseline minus credits explicitly recorded as Passed in this planner, floored at zero. It is not a complete degree audit: prerequisites, compulsory/elective requirements, institutional credit rules and graduation eligibility are not verified.
- Unknown credits are not counted. Planned/in-progress courses do not reduce remaining credits.
- Assignment priority is due date, then remaining effort, then title. Undated work follows dated work. Workload includes overdue and unfinished work due within seven days.
- The thesis panel provides suggestions, not verified university requirements.
- Application checklist completion does not establish admission eligibility, funding or acceptance probability. No programmes, deadlines, grades, completed assignments or submitted applications are fabricated.

## Storage and privacy

Records are stored under `learntwin.planner.v1` in localStorage on the current browser and origin. There is no cloud account, cross-device sync, university portal access, Moodle/PHP/MCP integration, email sending, application submission or automatic retrieval of deadlines. Anyone using the same browser profile can read the records. Use an appropriate private device and avoid storing sensitive identity documents.

Export backup creates a JSON copy. Import validates schema, IDs, date values and references before requesting confirmation to replace existing data. A damaged saved record is not automatically overwritten; the recovery export preserves the raw saved copy. If browser storage fails, export your current records before closing. Clearing browser storage or changing the hosting origin loses access to that origin's records unless you restore a backup.

The separately scheduled ChatGPT weekly plan cannot read browser-local records. Use Export plan or Export backup and supply it to the conversation to update its context. Document links can be stored in notes; document files themselves are not uploaded.

## Verification

`npm test` covers scheduling order, completed-task exclusion, missing estimates, the five-action limit, credits, calendar-day arithmetic, backup validation/round-trip and safe external URL protocols. `npm run build` checks the production bundle. Browser interaction/visual verification is still required before a production release.


## PhD application management workspace

On **PhD applications**, add an institution and the official vacancy or programme page. A blank deadline means unverified or unknown, not an automatically inferred rolling deadline. Existing programme records, statuses, checkboxes, notes and links continue to work.

For each programme, record:

- **Research match:** country, research topic, potential group/supervisor, a *subjective* 1–5 fit rating (or Unrated) and your own priority.
- **Eligibility:** a user-selected review state, a requirements source URL, concrete entry requirements and evidence or gaps in notes. “Self-assessed eligible” is not institutional confirmation.
- **Funding:** advertised funding category, source verification state, official source URL, date checked, stipend/salary, fee coverage and duration. Amounts are free-text so the app does not convert currencies or infer living costs.
- **Action plan:** next concrete task, target date, the existing six-item preparation checklist, relevant contacts and document links.

Use the sortable, filterable **Compare programmes** table to shortlist by application deadline, priority, fit or checklist completion, and filter by funding, eligibility and application status. PhD next actions with a description and target date also appear on **Overview** (up to five), and in the text weekly-plan export; closed applications and empty actions are excluded. Undated programmes sort after dated ones. An unscored research fit sorts below scored programmes. The completion number counts the original six checklist items **only**; it never represents probability of admission.

The **Fully funded with recorded verification** count requires all three: the user selected Fully funded, marked the evidence Verified and entered a valid HTTP(S) funding-source URL. This is a record of the user's review, not automated verification or a guarantee of sufficient funding. Recheck deadlines, eligibility and pay directly with the institution before applying.

### Backward compatibility

Existing planner backups remain **version 1**. PhD metadata is an optional `phd` object on each application, and an old application with no `phd` value gets blank/Unknown defaults **only when displayed**. The saved record is not rewritten merely to display it. Editing a new field stores that object's data; original fields are preserved. Exports round-trip both legacy and enriched applications. Import rejects malformed enums, dates, unsupported URLs and invalid metadata without replacing the existing browser records.

The academic transcript importer is a separate local Rust/SQLite + FastAPI service. PhD application records still live in browser storage; they do not automatically sync to the academic database. Do not put personal transcripts, addresses, identification documents, referee details or private application notes into the public repository.

### Verification

From `frontend/`:

```sh
npm test
npm run lint
npm run build
```

`tests/phd.test.js` covers legacy backups, metadata validation, source-confirmed funding, checklist semantics, sorting/filtering and JSON round trips. Browser-based keyboard/mobile testing and checking the user's own official programme sources are still required.

## Optional ROS3-Limassol research milestone

[Issue #12](https://github.com/n0711/LearnTwin/issues/12) requests optional
research evidence for PhD preparation. If useful for a relevant application,
append the note below to **References, document links, contact notes and
decisions** without replacing existing text. This documentation-only update
does not seed applications, migrate storage or read/change browser records.

### Suggested note

ROS3-Limassol research-software milestone - 25 October 2026.

Original idea: Christos Paparistodemou. Project lead/manuscript author: Charalampos
Nadiotis.

PR #12 merged a read-only, bounded offline JSON evidence exporter for
receiver-observation recordings. It validates the full JSONL input, fingerprints its
exact bytes with SHA-256, counts accepted/rejected observations and silence ticks, and
retains the last 256 observed state changes with exact aggregate counters.

At tested commit 005f0fcc40b2efeb397704589af871ea9bc38759, GitHub Actions run
40226507393 passed all five jobs: Linux/Python 3.10 and 3.12, Windows/Python 3.12, ROS 2
Humble and ROS 2 Jazzy. Separate run 40226507353 passed Rust formatting, Clippy, tests,
build and Python/Rust parity checks.

Evidence status: automated software/ROS integration checks using synthetic observations.
Reports describe receiver-arrival observations; silence ticks are not proven packet
losses, and observed transitions are limited to recorded ticks. SHA-256 identifies input
bytes, not authenticity or provenance.

Physical hardware/field validation remains pending. These results do not establish
packet delivery ratio, one-way delay, network jitter, sensor capture freshness, field
reliability or vehicle safety.

Evidence: [merged PR #12](https://github.com/n0711/ROS3-Limassol/pull/12),
[five-job CI run](https://github.com/n0711/ROS3-Limassol/actions/runs/40226507393)
and [Rust run](https://github.com/n0711/ROS3-Limassol/actions/runs/40226507353).
The [evidence guide](https://github.com/n0711/ROS3-Limassol/blob/2f071da0ec5891ef6dc42c02fa5fab3b9cdbbefb/robotics/ros3_limassol/docs/EVIDENCE.md)
defines report semantics. These passing runs apply to their tested commit,
not every later commit on main.

### Suggested next concrete action

Prepare a documented Humble/Jazzy hardware or field study with independent
outage/recovery ground truth, raw JSONL recordings, evidence JSON, software/ROS
versions, clock assumptions, timeout/tick settings and repeat counts. Keep
execution pending until actual results are recorded. This proposed action is
not a scheduled or completed experiment; leave its target date unset unless
chosen.

This note does not justify changes to eligibility/funding verification,
application status, checklist completion or research-fit scores. Do not create
a fake programme entry or replace a whole planner backup to add the note.
