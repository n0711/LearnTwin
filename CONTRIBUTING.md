# Contributing to LearnTwin

Start with the [README](README.md) and [architecture](docs/ARCHITECTURE.md). Keep changes focused and describe observable behavior.

## Choose the right base

The planner was merged into `main` in PR #5 on 19 October 2026. Start new work from current `main` and state which component your change targets. Preserve uncommitted local work before switching branches.

## Development workflow

1. Create a focused branch in your fork or an authorized checkout.
2. Install the frontend with `npm ci`; install Python dependencies in a fresh virtual environment as described in the README.
3. Make the change and update the corresponding guide.
4. Run checks relevant to the changed component.
5. Open a pull request explaining the problem, resulting behavior, validation and remaining limitations.

Frontend checks, from `frontend/`:

```sh
npm test
npm run lint
npm run build
```

Python check, from the repository root with the virtual environment active:

```sh
python -m pytest
```

Also run `git diff --check`. Record existing failures separately from regressions; do not report unrun checks as passed.

## Review expectations

- For planner logic, cover meaningful boundary cases such as unknown credits, missing dates, completed tasks and invalid backups.
- For UI changes, check mobile widths, keyboard navigation, storage/reload, import cancellation and errors.
- For classroom integration, verify HTTP payloads and stored aggregates. Mock dashboard output is not evidence of backend behavior.
- Keep planner backups, student data, personal application records, databases, credentials, virtual environments and generated builds out of changes.
- Preserve unknown values instead of inventing grades, dates, funding, completed work or eligibility.
- Describe planned behavior as planned. Keep setup commands aligned with the files and scripts that actually exist.

## Reports

Use a repository issue with reproduction steps, expected/actual results, branch or commit and relevant runtime versions. Remove personal data and credentials from logs and screenshots. Use synthetic examples for API and backup problems.

## License

Contributions are made under the repository's [MIT license](LICENSE).
