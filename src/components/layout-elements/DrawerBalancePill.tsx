import type { ReactNode } from 'react';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';

export interface DrawerBalancePillProps {
  icon: ReactNode;
  value: ReactNode;
  loading?: boolean;
}

export function DrawerBalancePill({ icon, value, loading }: DrawerBalancePillProps) {
  return (
    <div className="bg-background-overlay relative flex items-center justify-center gap-1.5 overflow-hidden rounded-xl py-2.5">
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[18%] right-[18%] z-2 h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-electric-pink) 90%, transparent) 50%, transparent 100%)',
          filter: 'blur(0.8px)',
        }}
      />
      {icon}
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="h-3 w-6" />}
      >
        <span className="text-xs font-extrabold tabular-nums text-white">{value}</span>
      </SkeletonSuspense>
    </div>
  );
}
