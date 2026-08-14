export type JobStatus =
  | "draft"
  | "scheduled"
  | "inProgress"
  | "completed"
  | "cancelled";

export const JOB_STATUSES: readonly JobStatus[] = [
  "draft",
  "scheduled",
  "inProgress",
  "completed",
  "cancelled",
] as const;

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  address: Address;
  scheduledDate: string | null;
  assigneeId: string | null;
  customerId: string;
  organizationId: string;
  notes: string | null;
  startedAt: string | null;
  completedAt: string | null;
  signatureUrl: string | null;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  search: string;
  statuses: JobStatus[];
  dateFrom: string;
  dateTo: string;
  assigneeId: string;
}

export interface PaginationState {
  cursor: string | null;
  pageSize: number;
  nextCursor: string | null;
  totalCount: number;
}

export interface SortConfig {
  field: "title" | "status" | "scheduledDate" | "createdAt";
  direction: "asc" | "desc";
}

export interface PagedJobs {
  items: Job[];
  nextCursor: string | null;
  totalCount: number;
}

export const EMPTY_FILTERS: JobFilters = {
  search: "",
  statuses: [],
  dateFrom: "",
  dateTo: "",
  assigneeId: "",
};

export const STATUS_LABELS: Record<JobStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  inProgress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};
