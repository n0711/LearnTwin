# Documentation

Start with the [project README](../README.md) for scope, branch status and setup.

## Users

- [Degree and PhD planner](DEGREE_PHD_PLANNER.md): first use, prioritisation, credits, backup and recovery.
- [ROS3 + VERA research evidence](ROS3_VERA_RESEARCH.md): optional and independently sourced PhD milestone; no planner-data migration.
- [Known issues](../KNOWN_ISSUES.md): current limitations and release checks.

## Developers

- [Architecture](ARCHITECTURE.md): browser planner, classroom service and Python library.
- [Frontend](../frontend/README.md): commands, routes and deployment.
- [Backend integration](../frontend/BACKEND_INTEGRATION.md): configuration, requests, errors and smoke checks.
- [Data formats](data_schemas.md): planner JSON, classroom metrics and research CSVs.
- [HTTP contract summary](api_contract.json): machine-readable endpoint summary, not an OpenAPI specification.
- [Contributing](../CONTRIBUTING.md): development and review workflow.
- [Roadmap](ROADMAP.md): remaining work and suggested acceptance criteria.

## Historical material

`INTEGRATION_LOG.md` and `TEAM_STATUS.txt` are historical coordination notes. Use implementation files and the guides above to determine current behavior. FastAPI's running `/openapi.json` is the authoritative generated HTTP schema.

The planner introduced in PR #5 is on `main` as of 19 October 2026. Deployment status must be checked separately.

- [Product scope and optional setup assistance](PRODUCT_SCOPE.md)
