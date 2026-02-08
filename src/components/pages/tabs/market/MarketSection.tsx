import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

interface MarketSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  gridClassName?: string;
  isLoading?: boolean;
}

export function MarketSection({
  title,
  icon,
  children,
  className,
  gridClassName,
  isLoading,
}: MarketSectionProps) {
  return (
    <div className={className}>
      <SkeletonSuspense
        loading={isLoading}
        skeleton={
          <div className="flex items-center gap-1 mb-1 py-1 px-2">
            <Skeleton variant="card" className="w-6.25 h-6.25 rounded-md" />
            <Skeleton variant="line" className="h-6.25 w-24" />
          </div>
        }
      >
        <h3 className="w-fit flex items-center gap-1 mb-1 py-1 px-2 rounded-lg text-gray-secondary">
          <span className="flex-center [&>svg]:h-5 [&>svg]:w-6.25 [&>svg]:stroke-2">{icon}</span>
          <span className="h-6.25 text-lg font-semibold">{title}</span>
        </h3>
      </SkeletonSuspense>
      <div className={twMerge('grid gap-3', gridClassName)}>{children}</div>
    </div>
  );
}
