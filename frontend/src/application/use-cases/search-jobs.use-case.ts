import "server-only";

import type { Job, JobStatus, PagedJobs } from "@/lib/models/job";
import type { JobQueryPort } from "@/application/ports/job-query.port";

export interface SearchJobsInput {
  search?: string;
  statuses?: JobStatus[];
  dateFrom?: string;
  dateTo?: string;
  assigneeId?: string;
  cursor?: string | null;
  pageSize?: number;
}

export function createSearchJobsUseCase(port: JobQueryPort) {
  return async function searchJobs(input: SearchJobsInput = {}): Promise<PagedJobs> {
    return port.search(input);
  };
}

export function createGetJobUseCase(port: JobQueryPort) {
  return async function getJob(id: string): Promise<Job | null> {
    return port.getById(id);
  };
}
