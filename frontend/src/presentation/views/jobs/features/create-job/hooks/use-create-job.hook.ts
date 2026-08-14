"use client";

import { useCallback, useReducer, useState } from "react";
import { createJobAction } from "@/application/actions/job.actions";
import { useJobsStore } from "@/lib/store/jobs-store";
import {
  createJobFormReducer,
  initialCreateJobForm,
  validateCreateJobForm,
  type CreateJobField,
} from "./create-job-form.reducer";

export function useCreateJob() {
  const [open, setOpen] = useState(false);
  const [state, dispatch] = useReducer(createJobFormReducer, initialCreateJobForm);
  const addJob = useJobsStore((s) => s.addJob);

  const openModal = useCallback(() => {
    dispatch({ type: "RESET" });
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    dispatch({ type: "RESET" });
  }, []);

  const patch = useCallback((field: CreateJobField, value: string) => {
    dispatch({ type: "PATCH", field, value });
  }, []);

  const submit = useCallback(async () => {
    const errors = validateCreateJobForm(state);
    if (Object.keys(errors).length > 0) {
      dispatch({ type: "SET_ERRORS", errors });
      return { ok: false as const };
    }

    dispatch({ type: "SUBMIT_START" });
    const result = await createJobAction({
      title: state.title,
      description: state.description,
      address: {
        street: state.street,
        city: state.city,
        state: state.state,
        zipCode: state.zipCode,
        latitude: Number(state.latitude),
        longitude: Number(state.longitude),
      },
      customerId: state.customerId,
      assigneeId: state.assigneeId,
      scheduledDate: new Date(state.scheduledDate).toISOString(),
    });

    if (!result.ok) {
      dispatch({ type: "SUBMIT_FAILURE", error: result.error });
      return result;
    }

    addJob(result.data);
    dispatch({ type: "SUBMIT_SUCCESS" });
    setOpen(false);
    return result;
  }, [addJob, state]);

  return { open, openModal, closeModal, state, patch, submit };
}
