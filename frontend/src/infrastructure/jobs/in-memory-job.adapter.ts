import "server-only";

import type { Address, Job, JobStatus, PagedJobs } from "@/lib/models/job";
import type { JobQueryPort } from "@/application/ports/job-query.port";
import type { SearchJobsInput } from "@/application/use-cases/search-jobs.use-case";

const TENANT_ID = "11111111-1111-1111-1111-111111111111";
const CREW_A = "22222222-2222-2222-2222-222222222222";
const CREW_B = "33333333-3333-3333-3333-333333333333";
const CUSTOMER_A = "44444444-4444-4444-4444-444444444444";
const CUSTOMER_B = "55555555-5555-5555-5555-555555555555";

const seedAddress = (city: string, lat: number, lng: number): Address => ({
  street: "1400 Commerce St",
  city,
  state: "TX",
  zipCode: "75201",
  latitude: lat,
  longitude: lng,
});

const now = new Date();
const iso = (daysFromNow: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
};

const seed: Job[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    title: "Full tear-off — Oak Lawn bungalow",
    description: "Replace 24sq architectural shingles after hail damage.",
    status: "scheduled",
    address: seedAddress("Dallas", 32.802, -96.81),
    scheduledDate: iso(3),
    assigneeId: CREW_A,
    customerId: CUSTOMER_A,
    organizationId: TENANT_ID,
    notes: null,
    startedAt: null,
    completedAt: null,
    signatureUrl: null,
    photoCount: 0,
    createdAt: iso(-2),
    updatedAt: iso(-2),
  },
  {
    id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    title: "Leak repair — Highland Park",
    description: "Flashing around chimney and two pipe boots.",
    status: "inProgress",
    address: seedAddress("Dallas", 32.83, -96.79),
    scheduledDate: iso(-1),
    assigneeId: CREW_B,
    customerId: CUSTOMER_B,
    organizationId: TENANT_ID,
    notes: "Customer on site after 2pm",
    startedAt: iso(-1),
    completedAt: null,
    signatureUrl: null,
    photoCount: 3,
    createdAt: iso(-5),
    updatedAt: iso(-1),
  },
  {
    id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
    title: "Inspection — Plano commercial",
    description: "TPO roof inspection, 18,000 sq ft.",
    status: "draft",
    address: seedAddress("Plano", 33.02, -96.7),
    scheduledDate: null,
    assigneeId: null,
    customerId: CUSTOMER_A,
    organizationId: TENANT_ID,
    notes: "Waiting on access badges",
    startedAt: null,
    completedAt: null,
    signatureUrl: null,
    photoCount: 0,
    createdAt: iso(-1),
    updatedAt: iso(-1),
  },
];

const jobs = new Map<string, Job>(seed.map((job) => [job.id, job]));

const matches = (job: Job, input: SearchJobsInput): boolean => {
  if (input.search) {
    const q = input.search.toLowerCase();
    if (!`${job.title} ${job.description}`.toLowerCase().includes(q)) {
      return false;
    }
  }
  if (
    input.statuses &&
    input.statuses.length > 0 &&
    !input.statuses.includes(job.status)
  ) {
    return false;
  }
  if (
    input.dateFrom &&
    job.scheduledDate &&
    job.scheduledDate < input.dateFrom
  ) {
    return false;
  }
  if (input.dateTo && job.scheduledDate && job.scheduledDate > input.dateTo) {
    return false;
  }
  if (input.assigneeId && job.assigneeId !== input.assigneeId) {
    return false;
  }
  return true;
};

export const memoryJobStore = {
  all(): Job[] {
    return [...jobs.values()];
  },
  get(id: string): Job | undefined {
    return jobs.get(id);
  },
  upsert(job: Job): void {
    jobs.set(job.id, job);
  },
};

export class InMemoryJobQueryAdapter implements JobQueryPort {
  async search(input: SearchJobsInput): Promise<PagedJobs> {
    const items = [...jobs.values()]
      .filter((job) => matches(job, input))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return {
      items,
      nextCursor: null,
      totalCount: items.length,
    };
  }

  async getById(id: string): Promise<Job | null> {
    return jobs.get(id) ?? null;
  }
}

export function createMemoryJob(input: {
  title: string;
  description: string;
  address: Address;
  customerId: string;
  assigneeId: string;
  scheduledDate: string;
}): Job {
  const timestamp = new Date().toISOString();
  const job: Job = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description,
    status: "scheduled",
    address: input.address,
    scheduledDate: input.scheduledDate,
    assigneeId: input.assigneeId,
    customerId: input.customerId,
    organizationId: TENANT_ID,
    notes: null,
    startedAt: null,
    completedAt: null,
    signatureUrl: null,
    photoCount: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  memoryJobStore.upsert(job);
  return job;
}

export function completeMemoryJob(id: string, signatureUrl: string): Job {
  const existing = jobs.get(id);
  if (!existing) {
    throw new Error("Job not found");
  }
  if (existing.status === "completed" || existing.status === "cancelled") {
    throw new Error("Job is in a terminal state");
  }
  const timestamp = new Date().toISOString();
  const next: Job = {
    ...existing,
    status: "completed",
    startedAt: existing.startedAt ?? timestamp,
    completedAt: timestamp,
    signatureUrl,
    updatedAt: timestamp,
  };
  memoryJobStore.upsert(next);
  return next;
}

export type { JobStatus };
