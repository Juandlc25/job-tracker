-- Optimized tenant job search:
-- full-text + status IN (...) + date range + cursor pagination + photo count.
--
-- Why cursor > OFFSET:
-- OFFSET N still walks N rows to discard them. As the office staff pages deeper
-- the query gets linearly slower and concurrent inserts make page contents drift.
-- A (created_at, id) cursor seeks into the covering index and reads the next
-- pageSize rows. It is stable under inserts and O(pageSize) rather than O(offset).

-- Example bind values:
--   :org          uuid
--   :query        text        -- user search string
--   :statuses     text[]      -- e.g. ARRAY['Scheduled','InProgress']
--   :from         timestamptz
--   :to           timestamptz
--   :cursor_ts    timestamptz -- decoded from cursor
--   :cursor_id    uuid
--   :limit        int

SELECT
    j.id,
    j.title,
    j.description,
    j.status,
    j.street,
    j.city,
    j.state,
    j.zip_code,
    j.scheduled_date_utc,
    j.assignee_id,
    j.customer_id,
    j.created_at_utc,
    COUNT(p.id) AS photo_count
FROM jobs.jobs AS j
LEFT JOIN jobs.job_photos AS p ON p.job_id = j.id
WHERE j.organization_id = :org
  AND (:query IS NULL OR j.search_vector @@ websearch_to_tsquery('english', :query))
  AND (CARDINALITY(:statuses) = 0 OR j.status = ANY (:statuses))
  AND (CAST(:from AS timestamptz) IS NULL OR j.scheduled_date_utc >= :from)
  AND (CAST(:to AS timestamptz) IS NULL OR j.scheduled_date_utc <= :to)
  AND (
        CAST(:cursor_ts AS timestamptz) IS NULL
        OR (j.created_at_utc, j.id) < (:cursor_ts, :cursor_id)
      )
GROUP BY j.id
ORDER BY j.created_at_utc DESC, j.id DESC
LIMIT :limit;

-- Indexing strategy
-- 1. (organization_id, created_at_utc DESC, id DESC) — cursor walk per tenant
-- 2. (organization_id, status) — dashboard chips
-- 3. (organization_id, scheduled_date_utc) — calendar / date range
-- 4. GIN(search_vector) — full-text; generated column stays in sync without triggers
-- 5. Partial index on outbox processed_on_utc IS NULL — Hangfire poll stays cheap
