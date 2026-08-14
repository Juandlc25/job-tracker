import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { Job, JobFilters, JobStatus, SortConfig } from "@/lib/models/job";
import { EMPTY_FILTERS } from "@/lib/models/job";

export interface JobsUiState {
  jobs: Job[];
  selectedJobIds: string[];
  filters: JobFilters;
  pagination: {
    cursor: string | null;
    pageSize: number;
    nextCursor: string | null;
    totalCount: number;
  };
  sortConfig: SortConfig;
  hydrate: (jobs: Job[], totalCount: number, nextCursor: string | null) => void;
  setFilters: (filters: Partial<JobFilters>) => void;
  resetFilters: () => void;
  setSort: (sort: SortConfig) => void;
  toggleSelected: (jobId: string) => void;
  clearSelection: () => void;
  optimisticStatus: (
    jobId: string,
    status: JobStatus,
  ) => { previous: Job | undefined };
  rollbackJob: (previous: Job) => void;
  replaceJob: (job: Job) => void;
  addJob: (job: Job) => void;
}

const matchesFilters = (job: Job, filters: JobFilters): boolean => {
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const haystack = `${job.title} ${job.description}`.toLowerCase();
    if (!haystack.includes(q)) {
      return false;
    }
  }
  if (filters.statuses.length > 0 && !filters.statuses.includes(job.status)) {
    return false;
  }
  if (filters.dateFrom && job.scheduledDate && job.scheduledDate < filters.dateFrom) {
    return false;
  }
  if (filters.dateTo && job.scheduledDate && job.scheduledDate > filters.dateTo) {
    return false;
  }
  if (filters.assigneeId && job.assigneeId !== filters.assigneeId) {
    return false;
  }
  return true;
};

const compareJobs = (a: Job, b: Job, sort: SortConfig): number => {
  const dir = sort.direction === "asc" ? 1 : -1;
  const left = a[sort.field];
  const right = b[sort.field];
  if (left === right) {
    return 0;
  }
  if (left === null) {
    return 1;
  }
  if (right === null) {
    return -1;
  }
  return left > right ? dir : -dir;
};

export const useJobsStore = create<JobsUiState>((set, get) => ({
  jobs: [],
  selectedJobIds: [],
  filters: EMPTY_FILTERS,
  pagination: {
    cursor: null,
    pageSize: 20,
    nextCursor: null,
    totalCount: 0,
  },
  sortConfig: { field: "createdAt", direction: "desc" },

  hydrate: (jobs, totalCount, nextCursor) =>
    set({
      jobs,
      pagination: { ...get().pagination, totalCount, nextCursor },
    }),

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: EMPTY_FILTERS }),

  setSort: (sortConfig) => set({ sortConfig }),

  toggleSelected: (jobId) =>
    set((state) => ({
      selectedJobIds: state.selectedJobIds.includes(jobId)
        ? state.selectedJobIds.filter((id) => id !== jobId)
        : [...state.selectedJobIds, jobId],
    })),

  clearSelection: () => set({ selectedJobIds: [] }),

  optimisticStatus: (jobId, status) => {
    const previous = get().jobs.find((job) => job.id === jobId);
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId
          ? { ...job, status, updatedAt: new Date().toISOString() }
          : job,
      ),
    }));
    return { previous };
  },

  rollbackJob: (previous) =>
    set((state) => ({
      jobs: state.jobs.map((job) => (job.id === previous.id ? previous : job)),
    })),

  replaceJob: (next) =>
    set((state) => ({
      jobs: state.jobs.map((job) => (job.id === next.id ? next : job)),
    })),

  addJob: (job) =>
    set((state) => ({
      jobs: [job, ...state.jobs],
      pagination: {
        ...state.pagination,
        totalCount: state.pagination.totalCount + 1,
      },
    })),
}));

export const selectFilteredJobs = (state: JobsUiState): Job[] =>
  state.jobs
    .filter((job) => matchesFilters(job, state.filters))
    .sort((a, b) => compareJobs(a, b, state.sortConfig));

export const selectSelectedCount = (state: JobsUiState): number =>
  state.selectedJobIds.length;

export const useFilteredJobs = (): Job[] =>
  useJobsStore(useShallow(selectFilteredJobs));

export const useJobFilters = (): JobFilters =>
  useJobsStore((state) => state.filters);
