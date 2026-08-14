import "server-only";

import type { Job, JobStatus, PagedJobs } from "@/lib/models/job";
import type { JobQueryPort } from "@/application/ports/job-query.port";
import type { SearchJobsInput } from "@/application/use-cases/search-jobs.use-case";

const API_URL = process.env.API_URL ?? "http://localhost:5080";
const TENANT_ID =
  process.env.TENANT_ID ?? "11111111-1111-1111-1111-111111111111";

export interface ApiJob {
  id: string;
  title: string;
  description: string;
  status: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
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

interface ApiPaged {
  items: ApiJob[];
  nextCursor: string | null;
  totalCount: number;
}

const toStatus = (status: string): JobStatus => {
  const map: Record<string, JobStatus> = {
    Draft: "draft",
    Scheduled: "scheduled",
    InProgress: "inProgress",
    Completed: "completed",
    Cancelled: "cancelled",
    draft: "draft",
    scheduled: "scheduled",
    inProgress: "inProgress",
    completed: "completed",
    cancelled: "cancelled",
  };
  return map[status] ?? "draft";
};

const toJob = (row: ApiJob): Job => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: toStatus(row.status),
  address: {
    street: row.street,
    city: row.city,
    state: row.state,
    zipCode: row.zipCode,
    latitude: row.latitude,
    longitude: row.longitude,
  },
  scheduledDate: row.scheduledDate,
  assigneeId: row.assigneeId,
  customerId: row.customerId,
  organizationId: row.organizationId,
  notes: row.notes,
  startedAt: row.startedAt,
  completedAt: row.completedAt,
  signatureUrl: row.signatureUrl,
  photoCount: row.photoCount,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Organization-Id": TENANT_ID,
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status}: ${body || response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export class HttpJobQueryAdapter implements JobQueryPort {
  async search(input: SearchJobsInput): Promise<PagedJobs> {
    const params = new URLSearchParams();
    if (input.search) params.set("search", input.search);
    input.statuses?.forEach((status) => params.append("statuses", status));
    if (input.dateFrom) params.set("dateFrom", input.dateFrom);
    if (input.dateTo) params.set("dateTo", input.dateTo);
    if (input.assigneeId) params.set("assigneeId", input.assigneeId);
    if (input.cursor) params.set("cursor", input.cursor);
    params.set("pageSize", String(input.pageSize ?? 20));

    const page = await apiFetch<ApiPaged>(`/api/jobs?${params.toString()}`);
    return {
      items: page.items.map(toJob),
      nextCursor: page.nextCursor,
      totalCount: page.totalCount,
    };
  }

  async getById(id: string): Promise<Job | null> {
    try {
      const row = await apiFetch<ApiJob>(`/api/jobs/${id}`);
      return toJob(row);
    } catch {
      return null;
    }
  }
}

export { apiFetch, toJob, API_URL, TENANT_ID };
