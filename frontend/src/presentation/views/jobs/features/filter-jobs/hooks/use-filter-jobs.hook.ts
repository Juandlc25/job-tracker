"use client";

import { useCallback } from "react";
import { useJobsStore } from "@/lib/store/jobs-store";
import type { JobFilters } from "@/lib/models/job";

export function useFilterJobs() {
  const filters = useJobsStore((state) => state.filters);
  const setFilters = useJobsStore((state) => state.setFilters);
  const resetFilters = useJobsStore((state) => state.resetFilters);

  const onChange = useCallback(
    (next: Partial<JobFilters>) => {
      setFilters(next);
    },
    [setFilters],
  );

  return { filters, onChange, resetFilters };
}
