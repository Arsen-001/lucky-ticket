import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import type { Route } from '@/constants/routes';

export interface HomeSectionHeaderProps {
  title: ReactNode;
  badge?: ReactNode;
  actionLabel?: ReactNode;
  actionHref?: Route;
  className?: string;
}

export function HomeSectionHeader({
  title,
  badge,
  actionLabel,
  actionHref,
  className,
}: HomeSectionHeaderProps) {
  return (
    <div className={twMerge('flex items-center justify-between gap-3 px-4', className)}>
      <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-white">
        <span>{title}</span>
        {badge}
      </h3>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="text-pink flex items-center gap-1 text-xs font-semibold transition-colors hover:text-white"
        >
          {actionLabel}
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}
