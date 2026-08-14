"use client";

import type { FormEvent } from "react";
import type { useCompleteJob } from "../../hooks/use-complete-job.hook";

type CompleteJobModalProps = Pick<
  ReturnType<typeof useCompleteJob>,
  | "job"
  | "signatureUrl"
  | "setSignatureUrl"
  | "error"
  | "submitting"
  | "closeModal"
  | "submit"
>;

export function CompleteJobModal({
  job,
  signatureUrl,
  setSignatureUrl,
  error,
  submitting,
  closeModal,
  submit,
}: CompleteJobModalProps) {
  if (!job) {
    return null;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await submit();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4"
      role="presentation"
      onClick={closeModal}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-job-title"
        data-testid="complete-job-modal"
        className="w-full max-w-md rounded-lg bg-white p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="complete-job-title" className="text-lg font-semibold text-stone-900">
          Complete job
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Mark <span className="font-medium">{job.title}</span> as completed. This
          raises a domain event that generates an invoice and notifies the customer.
        </p>
        <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">Signature URL</span>
            <input
              value={signatureUrl}
              onChange={(event) => setSignatureUrl(event.target.value)}
              className="rounded-md border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-amber-700"
              data-testid="complete-job-signature"
              aria-label="Customer signature URL"
            />
          </label>
          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              data-testid="complete-job-submit"
              className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-60"
            >
              {submitting ? "Completing…" : "Complete job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
