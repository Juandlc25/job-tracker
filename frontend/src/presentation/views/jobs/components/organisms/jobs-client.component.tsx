"use client";

import type { Job } from "@/lib/models/job";
import { JobListErrorBoundary } from "@/presentation/shared/error-boundary/job-list-error-boundary";
import { CreateJobModal } from "../../features/create-job";
import { CompleteJobModal } from "../../features/complete-job";
import { FilterBar } from "../../features/filter-jobs";
import { useJobsPage } from "../../hooks/use-jobs-page.hook";
import { JobsTable } from "./jobs-table.component";

interface JobsClientProps {
  initialJobs: Job[];
  totalCount: number;
}

export function JobsClient({ initialJobs, totalCount }: JobsClientProps) {
  const { jobs, totals, create, complete, filters } = useJobsPage(
    initialJobs,
    totalCount,
  );

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Jobs</h1>
          <p className="text-sm text-stone-600">
            {totals.visible} visible · {totals.inProgress} in progress ·{" "}
            {totals.completed} completed
          </p>
        </div>
        <button
          type="button"
          onClick={create.openModal}
          data-testid="open-create-job"
          className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900"
        >
          New job
        </button>
      </header>

      <FilterBar value={filters.filters} onChange={filters.onChange}>
        <FilterBar.Search />
        <FilterBar.Status />
        <FilterBar.DateRange />
      </FilterBar>

      <JobListErrorBoundary>
        <JobsTable jobs={jobs} onComplete={complete.openModal} />
      </JobListErrorBoundary>

      <CreateJobModal
        open={create.open}
        closeModal={create.closeModal}
        state={create.state}
        patch={create.patch}
        submit={create.submit}
      />
      <CompleteJobModal
        job={complete.job}
        signatureUrl={complete.signatureUrl}
        setSignatureUrl={complete.setSignatureUrl}
        error={complete.error}
        submitting={complete.submitting}
        closeModal={complete.closeModal}
        submit={complete.submit}
      />
    </div>
  );
}
