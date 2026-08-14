export function JobsSkeleton() {
  return (
    <div className="flex flex-col gap-4" data-testid="jobs-skeleton" aria-hidden>
      <div className="h-8 w-40 animate-pulse rounded bg-stone-200" />
      <div className="h-24 animate-pulse rounded-lg bg-stone-100" />
      <div className="h-64 animate-pulse rounded-lg bg-stone-100" />
    </div>
  );
}
