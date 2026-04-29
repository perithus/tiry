import { cn } from "@/lib/utils/cn";

export function Skeleton({
  className
}: {
  className?: string;
}) {
  return <div className={cn("skeleton-block", className)} />;
}

export function SkeletonCard({
  rows = 3
}: {
  rows?: number;
}) {
  return (
    <div className="glass-panel p-6">
      <Skeleton className="h-5 w-32" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className={index === 0 ? "h-10 w-4/5" : "h-4 w-full"} />
        ))}
      </div>
    </div>
  );
}
