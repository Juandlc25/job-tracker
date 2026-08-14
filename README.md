# JobTracker

Multi-tenant roofing job manager for the Senior Fullstack take-home (Next.js 15 + .NET 9 modular monolith + PostgreSQL).

## Setup

### .NET 9 SDK (this machine)

The SDK was installed with Homebrew (`dotnet@9`). It is keg-only, so put it on `PATH` before the existing .NET 8 muxer:

```bash
export DOTNET_ROOT="/opt/homebrew/opt/dotnet@9/libexec"
export PATH="$DOTNET_ROOT:$PATH"
dotnet --version   # 9.0.x
```

Add those two `export` lines to `~/.zshrc` if you want them in every terminal.

`backend/global.json` pins the solution to the 9.0 feature band.

### Fastest path — frontend only

The Next.js app ships with an in-memory adapter so you can demo the UI without PostgreSQL:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000/jobs](http://localhost:3000/jobs).

### Full stack — Docker Compose

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:5080/health
- Hangfire dashboard: http://localhost:5080/hangfire

Set `API_URL` / `JOBS_DATA_SOURCE=http` so the Next.js server talks to the API.

### Full stack — local processes

```bash
docker compose up postgres -d
cd backend && dotnet run --project src/JobTracker.Api
# other terminal
cd frontend && API_URL=http://localhost:5080 npm run dev
```

### Tests

```bash
cd frontend && npm test && npx playwright install && npm run e2e
cd backend && dotnet test
```

## What the system does

Office staff create, filter, and complete roofing jobs. Completing a job is a domain operation on the `Job` aggregate. That raises `JobCompletedDomainEvent`, which the outbox interceptor turns into `JobCompletedIntegrationEvent` in the **same database transaction**. Hangfire polls the outbox and:

1. Billing creates an invoice (idempotent on `JobId + CompletedAt`)
2. Notifications emails the customer (SendGrid-shaped adapter; logs locally)

## Architectural decisions

- **Modular monolith, not microservices.** Jobs and Billing share a process and a PostgreSQL instance, isolated by schema (`jobs`, `billing`). Cheaper to operate; still enforces bounded-context boundaries with architecture tests.
- **CQRS inside the module.** Writes go through aggregates + `IJobRepository`. Reads use `IJobReadQuery` with `AsNoTracking` projections. One database, two models.
- **Outbox instead of in-process publish after SaveChanges.** If the process dies after commit, Hangfire retries unprocessed rows (at-least-once). Handlers are idempotent so duplicates are safe.
- **Server Components fetch; Server Actions mutate.** `/jobs/page.tsx` imports `server-only` and calls a use case from the DI container. Create/complete are the only Server Actions.
- **Zustand holds UI state**, including an optimistic copy of the current page's jobs. It is not a second API cache: the server hydrates it, and mutations update it. Derived lists come from selectors, not `useEffect`.

## What I would improve with more time

- Real SendGrid + identity (JWT with `organization_id` claim) instead of `X-Organization-Id`
- EF Core migrations instead of `EnsureCreated` + SQL
- Split Billing into Domain / Application / Infrastructure like Jobs
- OpenTelemetry collector in Compose and traces on the Next.js fetch path
- Cursor pagination wired through the UI ("Load more")
- Playwright against the HTTP adapter, not only the in-memory store

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the diagram, SOLID/GRASP, GoF patterns, and DDD notes.
