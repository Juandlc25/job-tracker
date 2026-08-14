import "server-only";

import type { Job, PagedJobs } from "@/lib/models/job";
import type { SearchJobsInput } from "@/application/use-cases/search-jobs.use-case";

export interface JobQueryPort {
  search(input: SearchJobsInput): Promise<PagedJobs>;
  getById(id: string): Promise<Job | null>;
}
