import { beforeEach, describe, expect, it } from "vitest";
import {
  selectFilteredJobs,
  useJobsStore,
} from "../jobs-store";
import type { Job } from "@/lib/models/job";

const job = (overrides: Partial<Job>): Job => ({
  id: "1",
  title: "Tear-off",
  description: "Replace shingles",
  status: "scheduled",
  address: {
    street: "1 Main",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
    latitude: 0,
    longitude: 0,
  },
  scheduledDate: "2026-09-01T00:00:00.000Z",
  assigneeId: "crew-a",
  customerId: "cust-a",
  organizationId: "org",
  notes: null,
  startedAt: null,
  completedAt: null,
  signatureUrl: null,
  photoCount: 0,
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  ...overrides,
});

describe("useJobsStore", () => {
  beforeEach(() => {
    useJobsStore.setState({
      jobs: [],
      selectedJobIds: [],
      filters: {
        search: "",
        statuses: [],
        dateFrom: "",
        dateTo: "",
        assigneeId: "",
      },
      pagination: { cursor: null, pageSize: 20, nextCursor: null, totalCount: 0 },
      sortConfig: { field: "createdAt", direction: "desc" },
    });
  });

  it("derives filtered jobs with a selector", () => {
    useJobsStore.getState().hydrate(
      [
        job({ id: "1", title: "Hail repair", status: "scheduled" }),
        job({ id: "2", title: "Leak", status: "completed" }),
      ],
      2,
      null,
    );
    useJobsStore.getState().setFilters({ statuses: ["scheduled"] });

    const filtered = selectFilteredJobs(useJobsStore.getState());
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("1");
  });

  it("applies optimistic status and rolls back", () => {
    const original = job({ id: "1", status: "inProgress" });
    useJobsStore.getState().hydrate([original], 1, null);

    const { previous } = useJobsStore.getState().optimisticStatus("1", "completed");
    expect(useJobsStore.getState().jobs[0]?.status).toBe("completed");

    useJobsStore.getState().rollbackJob(previous!);
    expect(useJobsStore.getState().jobs[0]?.status).toBe("inProgress");
  });
});
