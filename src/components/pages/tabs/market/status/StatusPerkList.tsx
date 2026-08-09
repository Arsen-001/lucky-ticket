import { ArrowRight, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { StatusPerkRow } from '@/utils/global/status-perks.utils';
import { staggerMs } from '@/utils/global/animation.utils';

export interface StatusPerkListProps {
  /** Already-built, already-translated rows — see `buildStatusPerkRows`. */
  rows: StatusPerkRow[];
  title?: string;
  /** Compact variant used inside the purchase modal. */
  isSmall?: boolean;
  className?: string;
  classNames?: { list?: string; row?: string; label?: string; value?: string };
}

/**
 * The perks a status actually grants, one row per perk, value on the right.
 * Rows come from the live admin config, so a perk the panel sets to zero simply
 * has no row here — the list never promises what the server will not give.
 */
export function StatusPerkList({
  rows,
  title,
  isSmall = false,
  className,
  classNames,
}: StatusPerkListProps) {
  if (!rows.length) return null;

  return (
    <div className={twMerge('flex flex-col gap-2', className)}>
      {title && <h3 className="text-gray-secondary text-sm font-bold uppercase">{title}</h3>}
      <ul
        className={twMerge(
          'flex flex-col divide-y divide-white/5 overflow-hidden',
          isSmall ? 'gap-0' : 'bg-purple-gradient rounded-2xl',
          classNames?.list
        )}
      >
        {rows.map((row, index) => (
          <li
            key={row.id}
            className={twMerge(
              'flex items-center gap-3 animate-slide-in-bottom',
              isSmall ? 'py-1.5' : 'px-4 py-3',
              classNames?.row
            )}
            style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
          >
            <span className="flex-center h-5 w-5 shrink-0 rounded-full bg-emerald-500/15 text-emerald-400">
              <Check size={12} strokeWidth={3} />
            </span>
            <span
              className={twMerge(
                'flex-available text-left text-white/85 leading-relaxed',
                isSmall ? 'text-xs' : 'text-sm',
                classNames?.label
              )}
            >
              {row.label}
            </span>
            {row.value && (
              <span
                className={twMerge(
                  'flex-center shrink-0 gap-1 font-bold text-white whitespace-nowrap',
                  isSmall ? 'text-xs' : 'text-sm',
                  classNames?.value
                )}
              >
                {row.from && (
                  <>
                    <span className="text-white/40 font-semibold line-through">{row.from}</span>
                    <ArrowRight size={12} className="text-white/40" />
                  </>
                )}
                {row.value}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
