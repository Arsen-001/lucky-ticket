import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight, ExternalLink } from 'lucide-react';
import NextLink from 'next/link';
import { twMerge } from 'tailwind-merge';
import type { Route } from '@/constants/routes';

export type SupportActionAccent = 'pink' | 'purple';

export interface SupportActionRowProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: SupportActionAccent;
  /** Internal route — rendered as a NextLink with a chevron affordance. */
  route?: Route;
  /** External URL — rendered as a new-tab anchor with an external-link affordance. */
  href?: string;
  className?: string;
  style?: CSSProperties;
}

const accentClasses: Record<SupportActionAccent, { chip: string; icon: string }> = {
  pink: { chip: 'bg-electric-pink/15 border-electric-pink/30', icon: 'text-electric-pink' },
  purple: {
    chip: 'bg-electric-purple/15 border-electric-purple/30',
    icon: 'text-electric-purple',
  },
};

export function SupportActionRow({
  icon: Icon,
  title,
  description,
  accent = 'pink',
  route,
  href,
  className,
  style,
}: SupportActionRowProps) {
  const accentClass = accentClasses[accent];
  const isExternal = !route && !!href;

  const rowClassName = twMerge(
    'group bg-background-overlay/50 hover:bg-white/5 flex items-center gap-3 rounded-2xl border border-white/5 p-3 transition-colors active:scale-99',
    className
  );

  const body = (
    <>
      <div
        className={twMerge('flex-center h-9 w-9 flex-shrink-0 rounded-lg border', accentClass.chip)}
      >
        <Icon size={16} className={accentClass.icon} strokeWidth={2.2} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-bold text-white">{title}</span>
        <span className="text-pink-secondary text-[11px] font-medium leading-snug">
          {description}
        </span>
      </div>
      {isExternal ? (
        <ExternalLink size={15} className="text-pink-secondary flex-shrink-0" strokeWidth={2.2} />
      ) : (
        <ChevronRight
          size={16}
          className="text-pink-secondary group-hover:text-white flex-shrink-0 transition-colors"
          strokeWidth={2.2}
        />
      )}
    </>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={rowClassName}
        style={style}
      >
        {body}
      </a>
    );
  }

  return (
    <NextLink href={route ?? '#'} className={rowClassName} style={style}>
      {body}
    </NextLink>
  );
}
