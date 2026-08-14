-- JobTracker Jobs + Billing schemas
-- PostgreSQL 16. UUID PKs, tenant isolation, owned Address columns on jobs.

CREATE SCHEMA IF NOT EXISTS jobs;
CREATE SCHEMA IF NOT EXISTS billing;

CREATE TABLE IF NOT EXISTS jobs.jobs (
    id uuid PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    status text NOT NULL,
    street text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    latitude numeric(9, 6) NOT NULL,
    longitude numeric(9, 6) NOT NULL,
    scheduled_date_utc timestamptz,
    assignee_id uuid,
    customer_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    notes text,
    started_at_utc timestamptz,
    completed_at_utc timestamptz,
    signature_url text,
    cancelled_at_utc timestamptz,
    cancellation_reason text,
    created_at_utc timestamptz NOT NULL,
    updated_at_utc timestamptz NOT NULL,
    CONSTRAINT jobs_status_check CHECK (status IN ('Draft', 'Scheduled', 'InProgress', 'Completed', 'Cancelled'))
);

CREATE TABLE IF NOT EXISTS jobs.job_photos (
    id uuid PRIMARY KEY,
    job_id uuid NOT NULL REFERENCES jobs.jobs (id) ON DELETE CASCADE,
    url text NOT NULL,
    captured_at_utc timestamptz NOT NULL,
    caption text
);

CREATE TABLE IF NOT EXISTS jobs.outbox_messages (
    id uuid PRIMARY KEY,
    type text NOT NULL,
    content jsonb NOT NULL,
    occurred_on_utc timestamptz NOT NULL,
    processed_on_utc timestamptz,
    error text
);

CREATE TABLE IF NOT EXISTS billing.invoices (
    id uuid PRIMARY KEY,
    job_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    completed_at_utc timestamptz NOT NULL,
    idempotency_key text NOT NULL UNIQUE,
    amount numeric(12, 2) NOT NULL,
    created_at_utc timestamptz NOT NULL
);

-- Multi-tenant listing
CREATE INDEX IF NOT EXISTS ix_jobs_organization_id
    ON jobs.jobs (organization_id);

-- Tenant + status filter (the common office dashboard query)
CREATE INDEX IF NOT EXISTS ix_jobs_organization_id_status
    ON jobs.jobs (organization_id, status);

-- Date-range queries per tenant
CREATE INDEX IF NOT EXISTS ix_jobs_organization_id_scheduled_date
    ON jobs.jobs (organization_id, scheduled_date_utc);

-- Cursor pagination (created_at, id) DESC
CREATE INDEX IF NOT EXISTS ix_jobs_organization_id_created_at_id
    ON jobs.jobs (organization_id, created_at_utc DESC, id DESC);

-- Full-text search on title + description
ALTER TABLE jobs.jobs
    ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
    ) STORED;

CREATE INDEX IF NOT EXISTS ix_jobs_search_vector
    ON jobs.jobs USING gin (search_vector);

CREATE INDEX IF NOT EXISTS ix_job_photos_job_id
    ON jobs.job_photos (job_id);

CREATE INDEX IF NOT EXISTS ix_outbox_unprocessed
    ON jobs.outbox_messages (occurred_on_utc)
    WHERE processed_on_utc IS NULL;

-- Normalization vs denormalization (see sql/003_analysis.md):
-- Address is stored as owned columns on jobs (1NF still holds: one job, one address).
-- We do NOT store customer_name here; Contacts is another bounded context.
-- Photo count is computed at read time (COUNT) rather than a denormalized column,
-- because the write path already goes through the Job aggregate.
