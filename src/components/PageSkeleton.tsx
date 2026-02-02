import { motion } from "framer-motion";
import { forwardRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Page skeleton that mimics the tool layout structure
export const PageSkeleton = forwardRef<HTMLDivElement>((_, ref) => (
  <motion.div 
    ref={ref} 
    className="min-h-screen bg-background"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    {/* Header skeleton */}
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>

    {/* Content skeleton */}
    <div className="container py-6 space-y-6">
      {/* Tool header card */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Form/content skeleton */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 rounded-lg" />
          <Skeleton className="h-12 rounded-lg" />
        </div>
        <Skeleton className="h-5 w-40 mt-4" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-12 w-full rounded-xl" />

      {/* Additional content */}
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-36" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>

    {/* Bottom nav skeleton */}
    <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur">
      <div className="flex items-center justify-around h-full px-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-16 rounded-lg" />
        ))}
      </div>
    </div>
  </motion.div>
));

PageSkeleton.displayName = "PageSkeleton";

// Index page skeleton with category layout
export const IndexSkeleton = forwardRef<HTMLDivElement>((_, ref) => (
  <motion.div 
    ref={ref} 
    className="min-h-screen bg-background"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
  >
    {/* Header skeleton */}
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>

    {/* Categories skeleton */}
    <div className="container py-4 space-y-5">
      {[1, 2, 3].map((category) => (
        <div key={category} className="space-y-2">
          {/* Category header */}
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="w-1 h-4 rounded-full" />
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-24" />
            <div className="flex-1 h-px bg-border/30" />
          </div>
          
          {/* Tools container */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="divide-y divide-border/30">
              {[1, 2, 3].map((tool) => (
                <div key={tool} className="px-4 py-3 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Bottom nav skeleton */}
    <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur">
      <div className="flex items-center justify-around h-full px-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-16 rounded-lg" />
        ))}
      </div>
    </div>
  </motion.div>
));

IndexSkeleton.displayName = "IndexSkeleton";

export default PageSkeleton;
