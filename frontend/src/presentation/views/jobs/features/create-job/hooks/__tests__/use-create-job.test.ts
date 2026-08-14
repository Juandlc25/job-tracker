import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  createJobFormReducer,
  initialCreateJobForm,
  validateCreateJobForm,
} from "../create-job-form.reducer";

vi.mock("@/application/actions/job.actions", () => ({
  createJobAction: vi.fn(),
}));

import { createJobAction } from "@/application/actions/job.actions";
import { useCreateJob } from "../use-create-job.hook";

describe("createJobFormReducer", () => {
  it("patches fields and clears the field error", () => {
    const withError = {
      ...initialCreateJobForm,
      errors: { title: "required" },
    };
    const next = createJobFormReducer(withError, {
      type: "PATCH",
      field: "title",
      value: "Hail repair",
    });
    expect(next.title).toBe("Hail repair");
    expect(next.errors.title).toBeUndefined();
  });

  it("validates required fields", () => {
    const errors = validateCreateJobForm(initialCreateJobForm);
    expect(errors.title).toBeDefined();
    expect(errors.scheduledDate).toBeDefined();
  });
});

describe("useCreateJob", () => {
  it("calls the server action on a valid submit", async () => {
    vi.mocked(createJobAction).mockResolvedValue({
      ok: true,
      data: {
        id: "new",
        title: "Hail repair Dallas bungalow",
        description: "Replace 24sq after hail storm",
        status: "scheduled",
        address: {
          street: "1 Main",
          city: "Dallas",
          state: "TX",
          zipCode: "75201",
          latitude: 32,
          longitude: -96,
        },
        scheduledDate: "2026-09-01T15:00:00.000Z",
        assigneeId: "a",
        customerId: "c",
        organizationId: "o",
        notes: null,
        startedAt: null,
        completedAt: null,
        signatureUrl: null,
        photoCount: 0,
        createdAt: "2026-08-14T00:00:00.000Z",
        updatedAt: "2026-08-14T00:00:00.000Z",
      },
    });

    const { result } = renderHook(() => useCreateJob());

    act(() => {
      result.current.patch("title", "Hail repair Dallas bungalow");
      result.current.patch("description", "Replace 24sq after hail storm");
      result.current.patch("street", "1 Main");
      result.current.patch("city", "Dallas");
      result.current.patch("scheduledDate", "2026-12-01T15:00");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(createJobAction).toHaveBeenCalled();
  });
});
