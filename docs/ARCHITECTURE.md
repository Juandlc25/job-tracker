# Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Next.js 15 App Router                                                    │
│  Server Components (page.tsx + server-only)                              │
│       │  use case from DI container (reads)                              │
│       ▼                                                                  │
│  Client leaves ('use client')  ── Zustand selectors ── FSD verb slices   │
│       │  Server Actions (create / complete only)                         │
└───────┼──────────────────────────────────────────────────────────────────┘
        │ HTTP  X-Organization-Id
        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ JobTracker.Api  (.NET 9)                                                 │
│  Tenant middleware · sliding-window rate limit · OpenTelemetry           │
│       │                                                                  │
│       ▼  MediatR                                                         │
│  Application  (commands / queries / FluentValidation / Result)           │
│       │                                                                  │
│       ├──────── Domain (Job aggregate, Address VO, domain events)        │
│       │                                                                  │
│       ▼                                                                  │
│  Infrastructure  EF Core  +  IUnitOfWork  +  InsertOutboxInterceptor     │
└───────┼──────────────────────────────────────────────────────────────────┘
        │ same transaction
        ▼
┌───────────────────────────┐     Hangfire poll      ┌─────────────────────┐
│ PostgreSQL                │ ─────────────────────► │ ProcessOutboxJob    │
│  jobs.jobs / job_photos   │                        │  IPublisher         │
│  jobs.outbox_messages     │                        └──────────┬──────────┘
│  billing.invoices         │                                   │
│  hangfire.*               │                    ┌──────────────┴──────────┐
└───────────────────────────┘                    ▼                         ▼
                                      Billing (invoice,            Notifications
                                      idempotency key)             (SendGrid adapter)
```

## Domain vs integration events

Domain events (`JobCompletedDomainEvent`) are an in-module language: the aggregate records what happened so the application/infrastructure can react without the entity calling services. Integration events (`JobCompletedIntegrationEvent`) are the **open host service** of the Jobs module — a stable contract in `JobTracker.Modules.Jobs.IntegrationEvents` that Billing may reference. Billing never references Jobs.Domain.

## Outbox and at-least-once delivery

`InsertOutboxMessagesInterceptor` runs in `SavingChanges`. Outbox rows and the aggregate are committed together. Hangfire later publishes unprocessed rows. If the worker crashes after publish but before marking `processed_on`, the handler runs again. Invoice uniqueness on `idempotency_key = JobId + CompletedAt` makes that retry a no-op.

## SOLID (from this codebase)

| Principle | Where |
|-----------|--------|
| **S**ingle Responsibility | `CreateJobCommandHandler` only creates; `SearchJobsQueryHandler` only reads. Invoice generation lives in Billing. |
| **O**pen/Closed | New integration-event handlers register via MediatR. Jobs does not change when Billing grows. |
| **L**iskov | `IEmailSender` / `SendGridEmailSender` — the notification handler cannot tell it is a log stub. |
| **I**nterface Segregation | `IJobRepository` (writes + aggregate search) vs `IJobReadQuery` (projections). Handlers take only what they need. |
| **D**ependency Inversion | Application depends on `IJobRepository` and `IUnitOfWork`; Infrastructure implements them. |

## GRASP

| Principle | Where |
|-----------|--------|
| **Information Expert** | `Job.Complete` owns the transition rules and raises the event. The handler does not `job.Status = Completed`. |
| **Creator** | `Job.Create` / `Address.Create` / `Job.AddPhoto` (only the aggregate constructs `JobPhoto`). |
| **Controller** | Minimal API endpoints delegate to MediatR; they do not contain domain logic. |
| **Low Coupling** | Billing depends on `JobCompletedIntegrationEvent`, not on `Job`. |
| **High Cohesion** | The Jobs module owns scheduling, photos, and job status. Invoicing is not mixed in. |

## GoF and related patterns

| Pattern | Where | Problem solved |
|---------|--------|----------------|
| Repository | `IJobRepository` + `JobRepository` | Persistence behind a domain interface; handlers stay testable. |
| Unit of Work | `IUnitOfWork` + `JobsDbContext` | One commit for aggregate + outbox. |
| Observer | Domain events + MediatR `INotification` | Completing a job notifies Billing and email without the aggregate knowing them. |
| Builder | TypeScript `QueryBuilder<T>` | Type-safe, narrowing SQL construction. |
| Mediator | MediatR commands/queries | Endpoints do not new up handlers. |
| State | `Job` status methods + TS `transitionJob` overloads | Illegal transitions fail at compile time (TS) or as `Result` (C#). |
| Strategy | FluentValidation validators per command | Validation varies by use case without a god validator. |
| Factory | `Job.Create`, `Address.Create`, `Invoice.Create` | Invariants enforced at construction. |

## Bounded context and OHS

Jobs and Billing are separate bounded contexts. The published language is `JobTracker.Modules.Jobs.IntegrationEvents`. That assembly is the Open Host Service: other modules may take a dependency on it, never on Domain or Infrastructure. Architecture tests lock the inward dependency rule for Jobs.
