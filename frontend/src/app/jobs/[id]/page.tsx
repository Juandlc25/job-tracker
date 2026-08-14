import "server-only";

import { notFound } from "next/navigation";
import { container } from "@/application/container";
import { STATUS_LABELS } from "@/lib/models/job";

export const dynamic = "force-dynamic";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await container.getJob(id);

  if (!job) {
    notFound();
  }

  return (
    <article className="rounded-lg border border-stone-200 bg-white p-6">
      <p className="text-xs uppercase tracking-wide text-stone-500">
        {STATUS_LABELS[job.status]}
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-stone-900">{job.title}</h1>
      <p className="mt-3 text-stone-700">{job.description}</p>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stone-500">Address</dt>
          <dd className="text-stone-900">
            {job.address.street}, {job.address.city}, {job.address.state}{" "}
            {job.address.zipCode}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">Scheduled</dt>
          <dd className="text-stone-900">
            {job.scheduledDate
              ? new Date(job.scheduledDate).toLocaleString()
              : "Not scheduled"}
          </dd>
        </div>
      </dl>
    </article>
  );
}
