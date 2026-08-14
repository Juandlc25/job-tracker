import "server-only";

import type { JobQueryPort } from "@/application/ports/job-query.port";
import {
  createGetJobUseCase,
  createSearchJobsUseCase,
} from "@/application/use-cases/search-jobs.use-case";
import { HttpJobQueryAdapter } from "@/infrastructure/jobs/http-job.adapter";
import { InMemoryJobQueryAdapter } from "@/infrastructure/jobs/in-memory-job.adapter";

function createJobQueryPort(): JobQueryPort {
  if (process.env.JOBS_DATA_SOURCE === "http" || process.env.API_URL) {
    return new HttpJobQueryAdapter();
  }
  return new InMemoryJobQueryAdapter();
}

const jobQueryPort = createJobQueryPort();

/**
 * Composition root for server-side use cases.
 * Pages import from here — never from adapters or Server Actions — so reads
 * stay outside the mutation boundary.
 */
export const container = {
  searchJobs: createSearchJobsUseCase(jobQueryPort),
  getJob: createGetJobUseCase(jobQueryPort),
  isHttp: process.env.JOBS_DATA_SOURCE === "http" || Boolean(process.env.API_URL),
};
