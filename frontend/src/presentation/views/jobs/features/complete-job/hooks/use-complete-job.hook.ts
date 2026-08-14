"use client";

import { useCallback, useState } from "react";
import { completeJobAction } from "@/application/actions/job.actions";
import { useJobsStore } from "@/lib/store/jobs-store";
import type { Job } from "@/lib/models/job";

export function useCompleteJob() {
  const [job, setJob] = useState<Job | null>(null);
  const [signatureUrl, setSignatureUrl] = useState("https://cdn.jobtracker.local/signatures/demo.png");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const optimisticStatus = useJobsStore((s) => s.optimisticStatus);
  const rollbackJob = useJobsStore((s) => s.rollbackJob);
  const replaceJob = useJobsStore((s) => s.replaceJob);

  const openModal = useCallback((next: Job) => {
    setJob(next);
    setError(null);
    setSignatureUrl("https://cdn.jobtracker.local/signatures/demo.png");
  }, []);

  const closeModal = useCallback(() => {
    setJob(null);
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!job) {
      return { ok: false as const };
    }
    setSubmitting(true);
    setError(null);
    const { previous } = optimisticStatus(job.id, "completed");
    const result = await completeJobAction({
      jobId: job.id,
      signatureUrl,
    });
    setSubmitting(false);

    if (!result.ok) {
      if (previous) {
        rollbackJob(previous);
      }
      setError(result.error);
      return result;
    }

    replaceJob(result.data);
    setJob(null);
    return result;
  }, [job, optimisticStatus, replaceJob, rollbackJob, signatureUrl]);

  return {
    job,
    signatureUrl,
    setSignatureUrl,
    error,
    submitting,
    openModal,
    closeModal,
    submit,
  };
}
