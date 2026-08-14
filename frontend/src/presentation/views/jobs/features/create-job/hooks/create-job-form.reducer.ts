export interface CreateJobFormState {
  title: string;
  description: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: string;
  longitude: string;
  customerId: string;
  assigneeId: string;
  scheduledDate: string;
  errors: Partial<Record<keyof Omit<CreateJobFormState, "errors" | "submitting">, string>>;
  submitting: boolean;
}

export const initialCreateJobForm: CreateJobFormState = {
  title: "",
  description: "",
  street: "",
  city: "",
  state: "TX",
  zipCode: "",
  latitude: "32.7767",
  longitude: "-96.7970",
  customerId: "44444444-4444-4444-4444-444444444444",
  assigneeId: "22222222-2222-2222-2222-222222222222",
  scheduledDate: "",
  errors: {},
  submitting: false,
};

export type CreateJobField = keyof Omit<CreateJobFormState, "errors" | "submitting">;

export type CreateJobFormAction =
  | { type: "PATCH"; field: CreateJobField; value: string }
  | { type: "SET_ERRORS"; errors: CreateJobFormState["errors"] }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_FAILURE"; error: string }
  | { type: "RESET" };

export function validateCreateJobForm(
  state: CreateJobFormState,
): CreateJobFormState["errors"] {
  const errors: CreateJobFormState["errors"] = {};
  if (state.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  }
  if (state.description.trim().length < 8) {
    errors.description = "Description must be at least 8 characters";
  }
  if (!state.street.trim()) {
    errors.street = "Street is required";
  }
  if (!state.city.trim()) {
    errors.city = "City is required";
  }
  if (!state.scheduledDate) {
    errors.scheduledDate = "Schedule a future date";
  } else if (new Date(state.scheduledDate).getTime() <= Date.now()) {
    errors.scheduledDate = "Cannot schedule a job in the past";
  }
  return errors;
}

export function createJobFormReducer(
  state: CreateJobFormState,
  action: CreateJobFormAction,
): CreateJobFormState {
  switch (action.type) {
    case "PATCH":
      return {
        ...state,
        [action.field]: action.value,
        errors: { ...state.errors, [action.field]: undefined },
      };
    case "SET_ERRORS":
      return { ...state, errors: action.errors, submitting: false };
    case "SUBMIT_START":
      return { ...state, submitting: true };
    case "SUBMIT_SUCCESS":
      return { ...initialCreateJobForm };
    case "SUBMIT_FAILURE":
      return {
        ...state,
        submitting: false,
        errors: { ...state.errors, title: action.error },
      };
    case "RESET":
      return initialCreateJobForm;
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
