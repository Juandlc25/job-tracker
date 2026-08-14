import Link from "next/link";

export default function JobsNotFound() {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-8" data-testid="jobs-not-found">
      <h1 className="text-lg font-semibold text-stone-900">Job not found</h1>
      <p className="mt-2 text-sm text-stone-600">
        That job does not exist or does not belong to this organization.
      </p>
      <Link href="/jobs" className="mt-4 inline-block text-sm font-medium text-amber-900 underline">
        Back to jobs
      </Link>
    </div>
  );
}
