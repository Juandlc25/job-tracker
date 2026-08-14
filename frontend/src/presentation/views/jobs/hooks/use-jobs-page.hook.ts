"use client";

import { useEffect, useMemo } from "react";
import type { Job } from "@/lib/models/job";
import { useJobsStore, useFilteredJobs } from "@/lib/store/jobs-store";
import { useCreateJob } from "../features/create-job";
import { useCompleteJob } from "../features/complete-job";
import { useFilterJobs } from "../features/filter-jobs";

export function useJobsPage(initialJobs: Job[], totalCount: number) {
  const hydrate = useJobsStore((state) => state.hydrate);
  const create = useCreateJob();
  const complete = useCompleteJob();
  const filters = useFilterJobs();
  const jobs = useFilteredJobs();

  useEffect(() => {
    hydrate(initialJobs, totalCount, null);
  }, [hydrate, initialJobs, totalCount]);

  const totals = useMemo(() => {
    const byStatus = jobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1;
      return acc;
    }, {});
    return {
      visible: jobs.length,
      completed: byStatus.completed ?? 0,
      inProgress: byStatus.inProgress ?? 0,
    };
  }, [jobs]);

  return { jobs, totals, create, complete, filters };
}
