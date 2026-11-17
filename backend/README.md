# Lesho backend

Not started. This directory will hold the production API and background workers.

Before writing code, read in this order:

1. `../docs/00-overview.md` — what the product is and is not.
2. `../docs/02-architecture.md` — services, real-time strategy, atomic operations, jobs.
3. `../docs/03-data-model.md` — technology-independent schema.
4. `../docs/04-api-conventions.md` — request, response, error, pagination and idempotency rules.
5. `../docs/05-security.md` — what must be true before anything ships.
6. `../docs/modules/` — one file per feature area with endpoints and payloads.
7. `../docs/06-backend-tasks.md` — the ordered task list. Work top to bottom.

The database engine (document or relational) and the implementation language are not decided. The docs are written so either choice works; `docs/03-data-model.md` notes where the two differ.
