"use client";

interface JobsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function JobsError({ error, reset }: JobsErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-8 text-red-950"
      data-testid="jobs-error"
    >
      <h1 className="text-lg font-semibold">Could not load jobs</h1>
      <p className="mt-2 text-sm">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-red-800 px-4 py-2 text-sm text-white"
        data-testid="jobs-error-retry"
      >
        Retry
      </button>
    </div>
  );
}
