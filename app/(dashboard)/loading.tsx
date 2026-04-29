import { Skeleton, SkeletonCard } from "@/components/shared/skeleton";

export default function DashboardLoading() {
  return (
    <div className="container-shell py-10">
      <div className="dashboard-grid">
        <div className="glass-panel p-6">
          <Skeleton className="h-8 w-32" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-2xl" />
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28 rounded-2xl" />
              <Skeleton className="h-10 w-24 rounded-2xl" />
              <Skeleton className="h-10 w-20 rounded-2xl" />
            </div>
          </div>

          <div className="glass-panel p-8">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-12 w-2/3" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} rows={2} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SkeletonCard rows={4} />
            <SkeletonCard rows={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
