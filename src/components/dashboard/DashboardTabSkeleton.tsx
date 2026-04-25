import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder for lazy-loaded dashboard tabs.
 * Mimics the visual rhythm of cards to prevent CLS.
 */
export function DashboardTabSkeleton() {
  return (
    <div className="space-y-4 py-4">
      <Skeleton className="h-44 w-full rounded-3xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
