"use client";

import type { FormEvent } from "react";
import type { useCreateJob } from "../../hooks/use-create-job.hook";
import type { CreateJobField } from "../../hooks/create-job-form.reducer";

type CreateJobModalProps = Pick<
  ReturnType<typeof useCreateJob>,
  "open" | "closeModal" | "state" | "patch" | "submit"
>;

function Field({
  label,
  field,
  value,
  onChange,
  error,
  type = "text",
  testId,
}: {
  label: string;
  field: CreateJobField;
  value: string;
  onChange: (field: CreateJobField, value: string) => void;
  error?: string;
  type?: string;
  testId: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-stone-700">{label}</span>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(event) => onChange(field, event.target.value)}
          className="min-h-20 rounded-md border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-200"
          data-testid={testId}
          aria-invalid={Boolean(error)}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(field, event.target.value)}
          className="rounded-md border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-200"
          data-testid={testId}
          aria-invalid={Boolean(error)}
        />
      )}
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

export function CreateJobModal({
  open,
  closeModal,
  state,
  patch,
  submit,
}: CreateJobModalProps) {
  if (!open) {
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
        aria-labelledby="create-job-title"
        data-testid="create-job-modal"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-none"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="create-job-title" className="text-lg font-semibold text-stone-900">
          Create job
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Schedule a roofing job for the assigned crew.
        </p>
        <form className="mt-4 flex flex-col gap-3" onSubmit={onSubmit}>
          <Field
            label="Title"
            field="title"
            value={state.title}
            onChange={patch}
            error={state.errors.title}
            testId="create-job-title-input"
          />
          <Field
            label="Description"
            field="description"
            value={state.description}
            onChange={patch}
            error={state.errors.description}
            type="textarea"
            testId="create-job-description"
          />
          <Field
            label="Street"
            field="street"
            value={state.street}
            onChange={patch}
            error={state.errors.street}
            testId="create-job-street"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="City"
              field="city"
              value={state.city}
              onChange={patch}
              error={state.errors.city}
              testId="create-job-city"
            />
            <Field
              label="State"
              field="state"
              value={state.state}
              onChange={patch}
              testId="create-job-state"
            />
          </div>
          <Field
            label="ZIP"
            field="zipCode"
            value={state.zipCode}
            onChange={patch}
            testId="create-job-zip"
          />
          <Field
            label="Scheduled date"
            field="scheduledDate"
            value={state.scheduledDate}
            onChange={patch}
            error={state.errors.scheduledDate}
            type="datetime-local"
            testId="create-job-scheduled-date"
          />
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
              disabled={state.submitting}
              data-testid="create-job-submit"
              className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-900 disabled:opacity-60"
            >
              {state.submitting ? "Creating…" : "Create job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
