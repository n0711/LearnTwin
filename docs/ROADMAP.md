# Roadmap

These are proposed next steps, not shipped features or delivery promises. See [known issues](../KNOWN_ISSUES.md) for existing limitations.

## 1. Verify and release the planner

- Complete mobile and keyboard interaction checks.
- Exercise export, replacement/cancellation, malformed imports, blocked storage and recovery.
- Run planner tests, lint and production build; record failures explicitly.
- PR #5 merged on 19 October 2026. Verify the current hosted build separately and collect feedback on the first-use workflow.
- Publish the static frontend and verify the actual production origin and backup transfer.

Acceptance: a user can record a course, assignment and application, reload, export a backup and restore it on another origin without losing the expected records.

## 2. Make classroom analytics reflect stored feedback

- Replace mock reflection data and simulated live updates with API-backed data.
- Define session boundaries and stable pseudonymous identifiers.
- Fix zero-valued random IDs and distinguish metric count from participant count.
- Add API integration checks for validation, persistence and aggregate semantics.

Acceptance: a synthetic student submission produces predictable values in the dashboard, with no simulated records mixed into real results.

## 3. Establish a deployment security model

- Define user identities, roles and per-class authorization.
- Replace the shared browser-visible key model for public multi-user operation.
- Specify record retention, deletion, database backup and recovery.
- Configure permitted deployment origins and HTTPS.

Acceptance: users cannot access another user's private records or another class without authorization.

## 4. Connect the learning-analytics library deliberately

- Reproduce and resolve the historical deterministic-recommender failure.
- Define the mapping from collected evidence to library inputs.
- Specify and implement the recommendation endpoint's output.
- Validate any mastery model on suitable data before making educational claims.

Acceptance: deterministic tests pass and documentation distinguishes feedback aggregates from modeled mastery.

## 5. Extend academic planning only with verified requirements

Possible later work includes configurable degree rules, deadline evidence, opt-in synchronization and university-system adapters. These need explicit data contracts and user controls. Automatic admission predictions and application submission are not current capabilities.
