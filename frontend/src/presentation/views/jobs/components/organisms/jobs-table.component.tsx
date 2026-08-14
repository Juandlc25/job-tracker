"use client";

import Link from "next/link";
import { STATUS_LABELS, type Job, type JobStatus } from "@/lib/models/job";

const STATUS_CLASS: Record<JobStatus, string> = {
  draft: "bg-stone-100 text-stone-700",
  scheduled: "bg-sky-100 text-sky-800",
  inProgress: "bg-amber-100 text-amber-900",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

interface JobsTableProps {
  jobs: Job[];
  onComplete: (job: Job) => void;
}

export function JobsTable({ jobs, onComplete }: JobsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="min-w-full text-left text-sm" data-testid="jobs-table">
        <caption className="sr-only">Roofing jobs</caption>
        <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">City</th>
            <th className="px-4 py-3 font-medium">Scheduled</th>
            <th className="px-4 py-3 font-medium">Photos</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-stone-500">
                No jobs match the current filters.
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr
                key={job.id}
                className="border-b border-stone-100 last:border-0"
                data-testid={`job-row-${job.id}`}
                data-job-title={job.title}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-medium text-stone-900 hover:underline"
                    data-testid={`job-title-${job.id}`}
                  >
                    {job.title}
                  </Link>
                  <p className="max-w-md truncate text-xs text-stone-500">
                    {job.description}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[job.status]}`}
                    data-testid={`job-status-${job.id}`}
                  >
                    {STATUS_LABELS[job.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-700">{job.address.city}</td>
                <td className="px-4 py-3 text-stone-700">
                  {job.scheduledDate
                    ? new Date(job.scheduledDate).toLocaleString()
                    : "—"}
                </td>
                <td className="px-4 py-3 text-stone-700">{job.photoCount}</td>
                <td className="px-4 py-3 text-right">
                  {job.status === "completed" || job.status === "cancelled" ? (
                    <span className="text-xs text-stone-400">Terminal</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onComplete(job)}
                      data-testid={`complete-job-${job.id}`}
                      className="rounded-md px-3 py-1 text-xs font-medium text-amber-900 hover:bg-amber-50"
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
