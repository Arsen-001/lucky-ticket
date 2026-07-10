'use client';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { formatCompact } from '@/utils/global/number.utils';
import type { Route } from '@/constants/routes';

type StatIconComponent = ComponentType<{ size?: number; className?: string }>;

export interface QuickStatItem {
  key: string;
  icon: StatIconComponent | ComponentType<SVGProps<SVGSVGElement>>;
  iconWrap?: boolean;
  iconClass: string;
  accent: string;
  label: ReactNode;
  value: number | undefined;
  unit?: string;
  decimals?: number;
  href?: Route;
}

export interface QuickStatColumnProps {
  item: QuickStatItem;
  loading?: boolean;
  delay: number;
}

export function QuickStatColumn({ item, loading, delay }: QuickStatColumnProps) {
  const formatted =
    item.value == null
      ? '—'
      : item.decimals && item.decimals > 0
        ? item.value.toFixed(item.decimals)
        : formatCompact(item.value);

  const Icon = item.icon;

  const content = (
    <>
      <span
        className="flex-center h-8 w-8 rounded-lg"
        style={
          item.iconWrap
            ? {
                backgroundColor: `color-mix(in srgb, ${item.accent} 14%, transparent)`,
                borderWidth: 1,
                borderColor: `color-mix(in srgb, ${item.accent} 35%, transparent)`,
              }
            : undefined
        }
      >
        <Icon size={item.iconWrap ? 16 : 22} className={item.iconClass} />
      </span>
      <SkeletonSuspense
        loading={loading || item.value == null}
        skeleton={<Skeleton variant="line" textSize="lg" className="h-5 w-12" />}
      >
        <div className="flex items-baseline gap-1 leading-none">
          <span className="text-base font-black tabular-nums text-white">{formatted}</span>
          {item.unit && (
            <span className="text-[9px] font-bold uppercase" style={{ color: item.accent }}>
              {item.unit}
            </span>
          )}
        </div>
      </SkeletonSuspense>
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/45">
        {item.label}
      </span>
    </>
  );

  const wrapperClass = twMerge(
    'animate-slide-in-bottom flex flex-col items-center gap-1.5 py-3 transition-colors',
    item.href && 'cursor-pointer active:scale-98 hover:bg-white/3'
  );

  if (item.href) {
    return (
      <Link href={item.href} className={wrapperClass} style={{ animationDelay: `${delay}ms` }}>
        {content}
      </Link>
    );
  }

  return (
    <div className={wrapperClass} style={{ animationDelay: `${delay}ms` }}>
      {content}
    </div>
  );
}
