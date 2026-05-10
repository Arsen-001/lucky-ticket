import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import type { Route } from '@/constants/routes';

export interface DrawerItemProps {
  route: Route;
  title: string;
  icon: ReactNode;
  badge?: number;
  active?: boolean;
  tabIndex?: number;
  onNavigate?: () => void;
}

export function DrawerItem({
  route,
  title,
  icon,
  badge,
  active = false,
  tabIndex,
  onNavigate,
}: DrawerItemProps) {
  const showBadge = !!badge && badge > 0;

  return (
    <li>
      <Link
        href={route}
        tabIndex={tabIndex}
        onClick={onNavigate}
        className={twMerge(
          'group relative flex items-center gap-3 overflow-hidden rounded-xl px-2.5 py-2.5 transition-colors',
          active
            ? 'bg-background-overlay text-white'
            : 'text-white-secondary hover:bg-white/5 hover:text-white'
        )}
      >
        {active && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
            style={{
              background:
                'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
            }}
          />
        )}
        {active && (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-[18%] right-[18%] z-2 h-[3px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-electric-pink) 90%, transparent) 50%, transparent 100%)',
              filter: 'blur(0.8px)',
            }}
          />
        )}
        <span
          className={twMerge(
            'flex-center relative h-8 w-8 flex-shrink-0 rounded-lg transition-colors',
            active
              ? 'bg-electric-pink/25 text-white'
              : 'bg-white/5 text-white-secondary group-hover:bg-white/10'
          )}
        >
          {icon}
          {showBadge && (
            <span
              aria-hidden
              className="bg-electric-pink absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full"
              style={{ boxShadow: '0 0 6px rgba(222,0,155,0.85)' }}
            />
          )}
        </span>
        <span className="relative flex-1 truncate text-sm font-semibold">{title}</span>
        {showBadge && (
          <span className="bg-electric-pink relative min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-extrabold tabular-nums text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        <ChevronRight
          size={16}
          className={twMerge(
            'relative flex-shrink-0 transition-transform',
            active ? 'text-electric-pink' : 'text-pink-secondary'
          )}
        />
      </Link>
    </li>
  );
}
