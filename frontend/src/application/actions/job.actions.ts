"use server";

import { revalidatePath } from "next/cache";
import type { Address, Job } from "@/lib/models/job";
import { container } from "@/application/container";
import {
  completeMemoryJob,
  createMemoryJob,
} from "@/infrastructure/jobs/in-memory-job.adapter";
import {
  apiFetch,
  TENANT_ID,
  toJob,
  type ApiJob,
} from "@/infrastructure/jobs/http-job.adapter";

export interface CreateJobInput {
  title: string;
  description: string;
  address: Address;
  customerId: string;
  assigneeId: string;
  scheduledDate: string;
}

export interface CompleteJobInput {
  jobId: string;
  signatureUrl: string;
}

export type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

function validateCreate(input: CreateJobInput): string | null {
  if (input.title.trim().length < 3) {
    return "Title must be at least 3 characters";
  }
  if (input.description.trim().length < 8) {
    return "Description must be at least 8 characters";
  }
  if (!input.address.street || !input.address.city || !input.address.state) {
    return "Street, city, and state are required";
  }
  if (!input.customerId || !input.assigneeId) {
    return "Customer and assignee are required";
  }
  if (!input.scheduledDate) {
    return "Scheduled date is required";
  }
  if (new Date(input.scheduledDate).getTime() < Date.now()) {
    return "A job cannot be scheduled in the past";
  }
  return null;
}

export async function createJobAction(
  input: CreateJobInput,
): Promise<ActionResult<Job>> {
  const error = validateCreate(input);
  if (error) {
    return { ok: false, error };
  }

  try {
    const job = container.isHttp
      ? toJob(
          await apiFetch<ApiJob>("/api/jobs", {
            method: "POST",
            body: JSON.stringify({
              title: input.title,
              description: input.description,
              street: input.address.street,
              city: input.address.city,
              state: input.address.state,
              zipCode: input.address.zipCode,
              latitude: input.address.latitude,
              longitude: input.address.longitude,
              scheduledDate: input.scheduledDate,
              assigneeId: input.assigneeId,
              customerId: input.customerId,
              organizationId: TENANT_ID,
            }),
          }),
        )
      : createMemoryJob(input);

    revalidatePath("/jobs");
    return { ok: true, data: job };
  } catch (cause) {
    return {
      ok: false,
      error: cause instanceof Error ? cause.message : "Failed to create job",
    };
  }
}

export async function completeJobAction(
  input: CompleteJobInput,
): Promise<ActionResult<Job>> {
  if (!input.jobId) {
    return { ok: false, error: "Job id is required" };
  }
  if (!input.signatureUrl.trim()) {
    return { ok: false, error: "Customer signature is required" };
  }

  try {
    const job = container.isHttp
      ? toJob(
          await apiFetch<ApiJob>(`/api/jobs/${input.jobId}/complete`, {
            method: "POST",
            body: JSON.stringify({ signatureUrl: input.signatureUrl }),
          }),
        )
      : completeMemoryJob(input.jobId, input.signatureUrl);

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${input.jobId}`);
    return { ok: true, data: job };
  } catch (cause) {
    return {
      ok: false,
      error: cause instanceof Error ? cause.message : "Failed to complete job",
    };
  }
}
