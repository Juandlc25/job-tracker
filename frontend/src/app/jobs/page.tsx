import "server-only";

import { Suspense } from "react";
import { container } from "@/application/container";
import { JobsClient } from "@/presentation/views/jobs/components/organisms/jobs-client.component";
import { JobsSkeleton } from "@/presentation/views/jobs/components/molecules/jobs-skeleton.component";

export const dynamic = "force-dynamic";

async function JobsList() {
  const page = await container.searchJobs({ pageSize: 50 });
  return <JobsClient initialJobs={page.items} totalCount={page.totalCount} />;
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsSkeleton />}>
      <JobsList />
    </Suspense>
  );
}
