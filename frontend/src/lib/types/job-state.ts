export type DraftState = {
  status: "draft";
  notes?: string;
};

export type ScheduledState = {
  status: "scheduled";
  scheduledDate: Date;
  assigneeId: string;
};

export type InProgressState = {
  status: "inProgress";
  startedAt: Date;
  assigneeId: string;
  photos: string[];
};

export type CompletedState = {
  status: "completed";
  startedAt: Date;
  completedAt: Date;
  assigneeId: string;
  photos: string[];
  signatureUrl: string;
};

export type CancelledState = {
  status: "cancelled";
  cancelledAt: Date;
  reason: string;
};

export type JobState =
  | DraftState
  | ScheduledState
  | InProgressState
  | CompletedState
  | CancelledState;

export type ScheduleJobAction = {
  type: "SCHEDULE";
  scheduledDate: Date;
  assigneeId: string;
};

export type StartJobAction = {
  type: "START";
  startedAt: Date;
};

export type CompleteJobAction = {
  type: "COMPLETE";
  completedAt: Date;
  signatureUrl: string;
};

export type CancelJobAction = {
  type: "CANCEL";
  cancelledAt: Date;
  reason: string;
};

export type JobAction =
  | ScheduleJobAction
  | StartJobAction
  | CompleteJobAction
  | CancelJobAction;

export class InvalidJobTransitionError extends Error {
  constructor(from: JobState["status"], action: JobAction["type"]) {
    super(`Cannot apply ${action} to a job in '${from}' state`);
    this.name = "InvalidJobTransitionError";
  }
}

export function transitionJob(
  current: DraftState,
  action: ScheduleJobAction,
): ScheduledState;
export function transitionJob(
  current: ScheduledState,
  action: StartJobAction,
): InProgressState;
export function transitionJob(
  current: ScheduledState,
  action: CancelJobAction,
): CancelledState;
export function transitionJob(
  current: InProgressState,
  action: CompleteJobAction,
): CompletedState;
export function transitionJob(
  current: InProgressState,
  action: CancelJobAction,
): CancelledState;
export function transitionJob(current: JobState, action: JobAction): JobState {
  switch (current.status) {
    case "draft":
      if (action.type === "SCHEDULE") {
        return {
          status: "scheduled",
          scheduledDate: action.scheduledDate,
          assigneeId: action.assigneeId,
        };
      }
      break;
    case "scheduled":
      if (action.type === "START") {
        return {
          status: "inProgress",
          startedAt: action.startedAt,
          assigneeId: current.assigneeId,
          photos: [],
        };
      }
      if (action.type === "CANCEL") {
        return {
          status: "cancelled",
          cancelledAt: action.cancelledAt,
          reason: action.reason,
        };
      }
      break;
    case "inProgress":
      if (action.type === "COMPLETE") {
        return {
          status: "completed",
          startedAt: current.startedAt,
          completedAt: action.completedAt,
          assigneeId: current.assigneeId,
          photos: current.photos,
          signatureUrl: action.signatureUrl,
        };
      }
      if (action.type === "CANCEL") {
        return {
          status: "cancelled",
          cancelledAt: action.cancelledAt,
          reason: action.reason,
        };
      }
      break;
    case "completed":
    case "cancelled":
      break;
    default: {
      const _exhaustive: never = current;
      return _exhaustive;
    }
  }

  throw new InvalidJobTransitionError(current.status, action.type);
}

export function getJobSummary(state: JobState): string {
  switch (state.status) {
    case "draft":
      return state.notes
        ? `Draft — ${state.notes}`
        : "Draft — awaiting schedule";
    case "scheduled":
      return `Scheduled for ${state.scheduledDate.toISOString()} (assignee ${state.assigneeId})`;
    case "inProgress":
      return `In progress since ${state.startedAt.toISOString()} with ${state.photos.length} photo(s)`;
    case "completed":
      return `Completed at ${state.completedAt.toISOString()} — signature ${state.signatureUrl}`;
    case "cancelled":
      return `Cancelled at ${state.cancelledAt.toISOString()}: ${state.reason}`;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
