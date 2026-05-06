import type { ReactNode } from 'react';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';

export interface DrawerBalancePillProps {
  icon: ReactNode;
  value: ReactNode;
  label: ReactNode;
  loading?: boolean;
}

export function DrawerBalancePill({ icon, value, label, loading }: DrawerBalancePillProps) {
  return (
    <div className="bg-electric-pink/12 flex flex-col items-center gap-0.5 rounded-xl border border-white/5 py-2">
      <div className="flex items-center gap-1">
        {icon}
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" className="h-3 w-6" />}
        >
          <span className="text-xs font-extrabold tabular-nums text-white">{value}</span>
        </SkeletonSuspense>
      </div>
      <span className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
