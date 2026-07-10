import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export function CategorySectionSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2 px-5">
        <div className="h-3 w-20 rounded-full bg-white/10" />
        <div className="h-2.5 w-8 rounded-full bg-white/8" />
      </div>
      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded-rectangle" className="h-28" />
          ))}
        </div>
      </div>
    </div>
  );
}
