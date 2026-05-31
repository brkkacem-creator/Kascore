import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

export function Skeleton({ className }: Props) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800',
        className
      )}
    />
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="ka-card p-4">
      <div className="flex justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-3 gap-3 items-center mb-3">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-16 mx-auto" />
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-3 w-32 mx-auto" />
    </div>
  );
}
