import { describe, expect, it } from "vitest";
import {
  getJobSummary,
  InvalidJobTransitionError,
  transitionJob,
  type DraftState,
  type InProgressState,
  type JobAction,
  type JobState,
  type ScheduledState,
} from "../job-state";

const draft: DraftState = { status: "draft", notes: "hail" };
const scheduled: ScheduledState = {
  status: "scheduled",
  scheduledDate: new Date("2026-09-01T15:00:00Z"),
  assigneeId: "crew-a",
};
const inProgress: InProgressState = {
  status: "inProgress",
  startedAt: new Date("2026-09-01T15:00:00Z"),
  assigneeId: "crew-a",
  photos: ["p1"],
};

describe("transitionJob", () => {
  it("schedules a draft", () => {
    const next = transitionJob(draft, {
      type: "SCHEDULE",
      scheduledDate: scheduled.scheduledDate,
      assigneeId: "crew-a",
    });
    expect(next.status).toBe("scheduled");
  });

  it("starts and completes a scheduled job", () => {
    const started = transitionJob(scheduled, {
      type: "START",
      startedAt: inProgress.startedAt,
    });
    const completed = transitionJob(started, {
      type: "COMPLETE",
      completedAt: new Date("2026-09-01T18:00:00Z"),
      signatureUrl: "https://cdn.example/sig.png",
    });
    expect(completed.status).toBe("completed");
  });

  it("cancels scheduled and in-progress jobs", () => {
    const cancelledFromScheduled = transitionJob(scheduled, {
      type: "CANCEL",
      cancelledAt: new Date(),
      reason: "weather",
    });
    const cancelledFromProgress = transitionJob(inProgress, {
      type: "CANCEL",
      cancelledAt: new Date(),
      reason: "customer",
    });
    expect(cancelledFromScheduled.status).toBe("cancelled");
    expect(cancelledFromProgress.status).toBe("cancelled");
  });

  it("rejects invalid runtime transitions", () => {
    const apply = transitionJob as (current: JobState, action: JobAction) => JobState;
    expect(() =>
      apply(draft, {
        type: "COMPLETE",
        completedAt: new Date(),
        signatureUrl: "x",
      }),
    ).toThrow(InvalidJobTransitionError);
  });
});

describe("getJobSummary", () => {
  it("covers every state", () => {
    expect(getJobSummary(draft)).toContain("Draft");
    expect(getJobSummary(scheduled)).toContain("Scheduled");
    expect(getJobSummary(inProgress)).toContain("In progress");
    expect(
      getJobSummary({
        status: "completed",
        startedAt: inProgress.startedAt,
        completedAt: new Date("2026-09-01T18:00:00Z"),
        assigneeId: "crew-a",
        photos: [],
        signatureUrl: "sig",
      }),
    ).toContain("Completed");
    expect(
      getJobSummary({
        status: "cancelled",
        cancelledAt: new Date(),
        reason: "rain",
      }),
    ).toContain("Cancelled");
  });
});
