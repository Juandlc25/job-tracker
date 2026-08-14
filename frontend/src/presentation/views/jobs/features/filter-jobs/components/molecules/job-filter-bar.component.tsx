"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { JobFilters, JobStatus } from "@/lib/models/job";
import { JOB_STATUSES, STATUS_LABELS } from "@/lib/models/job";

interface FilterBarContextValue {
  value: JobFilters;
  onChange: (next: Partial<JobFilters>) => void;
}

const FilterBarContext = createContext<FilterBarContextValue | null>(null);

function useFilterBarContext(): FilterBarContextValue {
  const ctx = useContext(FilterBarContext);
  if (!ctx) {
    throw new Error("FilterBar compound parts must be used inside <FilterBar>");
  }
  return ctx;
}

interface FilterBarProps {
  value: JobFilters;
  onChange: (next: Partial<JobFilters>) => void;
  children: ReactNode;
}

function FilterBarRoot({ value, onChange, children }: FilterBarProps) {
  return (
    <FilterBarContext.Provider value={{ value, onChange }}>
      <div
        className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 md:flex-row md:flex-wrap md:items-end"
        data-testid="job-filter-bar"
        role="search"
        aria-label="Filter jobs"
      >
        {children}
      </div>
    </FilterBarContext.Provider>
  );
}

function Search() {
  const { value, onChange } = useFilterBarContext();
  return (
    <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm">
      <span className="font-medium text-stone-600">Search</span>
      <input
        type="search"
        value={value.search}
        onChange={(event) => onChange({ search: event.target.value })}
        placeholder="Title or description"
        className="rounded-md border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-200"
        data-testid="filter-search"
        aria-label="Search jobs by title or description"
      />
    </label>
  );
}

function Status() {
  const { value, onChange } = useFilterBarContext();

  const toggle = (status: JobStatus) => {
    const selected = value.statuses.includes(status)
      ? value.statuses.filter((item) => item !== status)
      : [...value.statuses, status];
    onChange({ statuses: selected });
  };

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="text-sm font-medium text-stone-600">Status</legend>
      <div className="flex flex-wrap gap-2" data-testid="filter-status">
        {JOB_STATUSES.map((status) => {
          const active = value.statuses.includes(status);
          return (
            <button
              key={status}
              type="button"
              onClick={() => toggle(status)}
              aria-pressed={active}
              data-testid={`filter-status-${status}`}
              className={
                active
                  ? "rounded-full bg-amber-800 px-3 py-1 text-xs font-medium text-white"
                  : "rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200"
              }
            >
              {STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function DateRange() {
  const { value, onChange } = useFilterBarContext();
  return (
    <div className="flex gap-3" data-testid="filter-date-range">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-stone-600">From</span>
        <input
          type="date"
          value={value.dateFrom}
          onChange={(event) => onChange({ dateFrom: event.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-amber-700"
          aria-label="Scheduled from"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-stone-600">To</span>
        <input
          type="date"
          value={value.dateTo}
          onChange={(event) => onChange({ dateTo: event.target.value })}
          className="rounded-md border border-stone-300 px-3 py-2 text-stone-900 outline-none focus:border-amber-700"
          aria-label="Scheduled to"
        />
      </label>
    </div>
  );
}

export const FilterBar = Object.assign(FilterBarRoot, {
  Search,
  Status,
  DateRange,
});
