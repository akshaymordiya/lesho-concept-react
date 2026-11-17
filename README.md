# Lesho

Local-commerce discovery and lead generation: social in format, commerce-first in purpose.

## Repository layout

| Path | What it is | Status |
| --- | --- | --- |
| `concept/` | Interactive React prototype with mock data. The visual and behavioural reference for the product. | Complete |
| `docs/` | Product, design, architecture, data model, API, security and task documentation. Start at `docs/README.md`. | Complete, v1 |
| `backend/` | Production API and workers. | Not started. See `docs/06-backend-tasks.md` |
| `frontend/` | Production client applications. | Not started. See `docs/07-frontend-tasks.md` |

## Run the concept prototype

```bash
cd concept
npm install
npm run dev      # http://localhost:5180
```

## Where to start

- Building the backend: read `docs/README.md`, then `docs/02-architecture.md`, `docs/03-data-model.md`, `docs/04-api-conventions.md`, then work through `docs/06-backend-tasks.md` in order.
- Building the frontend: read `docs/01-design-system.md`, run the prototype, then work through `docs/07-frontend-tasks.md` in order.
- Each feature area has its own file in `docs/modules/` with rules, endpoints, payloads, real-time behaviour and edge cases.
