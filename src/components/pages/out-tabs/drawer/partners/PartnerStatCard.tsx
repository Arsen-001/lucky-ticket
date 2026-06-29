import type { CSSProperties, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';

export interface PartnerStatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  /** Reserve the hint line while loading so the card doesn't grow when data lands. */
  reserveHint?: boolean;
  /** Hero treatment for the most important card (gradient border + teal icon). */
  highlighted?: boolean;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function PartnerStatCard({
  icon,
  label,
  value,
  hint,
  reserveHint,
  highlighted,
  loading,
  className,
  style,
}: PartnerStatCardProps) {
  return (
    <div
      style={style}
      className={twMerge(
        'flex flex-col gap-2 rounded-2xl p-3',
        highlighted ? 'card-outlined' : 'bg-background-overlay',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={twMerge(
            'flex-center h-7 w-7 shrink-0 rounded-lg',
            highlighted ? 'bg-teal/15 text-teal' : 'bg-pink-secondary/15 text-pink-secondary'
          )}
        >
          {icon}
        </span>
        <span className="text-white-secondary/80 text-[10px] font-bold uppercase leading-none tracking-wider">
          {label}
        </span>
      </div>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="h-6 w-16" />}
      >
        <span className="flex items-center text-lg font-extrabold leading-none tabular-nums text-white">
          {value}
        </span>
      </SkeletonSuspense>

      {loading && reserveHint ? (
        <Skeleton variant="line" className="h-2.5 w-12" />
      ) : (
        hint && (
          <span className="text-white-secondary/60 text-[10px] font-semibold leading-none">
            {hint}
          </span>
        )
      )}
    </div>
  );
}
