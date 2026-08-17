import { ArrowRight, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { SuperBoostBadge } from '@/components/shared/badges/SuperBoostBadge';
import { Ticket } from '@/components/shared/icons/Ticket';
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
              'flex items-start gap-3 animate-slide-in-bottom',
              isSmall ? 'py-1.5' : 'px-4 py-3',
              classNames?.row
            )}
            style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
          >
            <span className="flex-center mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-500/15 text-emerald-400">
              <Check size={12} strokeWidth={3} />
            </span>
            {/*
              Label and value share one wrapping row. The per-tier send limits
              are the reason: "Bronze 5 · Silver 4 · Gold 3 · Platinum 2 ·
              Diamond 1" does not fit beside its label on any phone (it ran 72px
              past a 390px viewport as one nowrap line, and Russian is longer
              still), so on a narrow screen the value drops to its own line and
              wraps there instead of pushing the row off-screen.
            */}
            <div className="flex-available flex min-w-0 flex-wrap items-baseline gap-x-3">
              <span
                className={twMerge(
                  'text-start text-white/85 leading-relaxed',
                  isSmall ? 'text-xs' : 'text-sm',
                  classNames?.label
                )}
              >
                {row.label}
              </span>
              {/* A note owns the full width under the pair: it explains the
                  VALUE, so it must not be squeezed into the label's column and
                  wrap into a two-line stub beside it. */}
              {row.note && (
                <span className="order-last w-full text-start text-[10px] font-semibold leading-snug text-white/40">
                  {row.note}
                </span>
              )}
              {row.tiers ? (
                <span
                  className={twMerge(
                    'ms-auto flex flex-wrap items-center justify-end gap-x-2.5 gap-y-1 font-bold text-white',
                    isSmall ? 'text-xs' : 'text-sm',
                    classNames?.value
                  )}
                >
                  {row.tiers.map(({ tier, total }) => (
                    <span key={tier} className="flex items-center gap-1">
                      <Ticket type={tier} width={isSmall ? 16 : 22} height={isSmall ? 16 : 22} />
                      {total}
                    </span>
                  ))}
                </span>
              ) : (
                row.value && (
                  <span
                    className={twMerge(
                      'ms-auto flex flex-wrap items-baseline justify-end gap-x-1 text-end font-bold text-white',
                      isSmall ? 'text-xs' : 'text-sm',
                      classNames?.value
                    )}
                  >
                    {/*
                    The "was → is" pair only earns its space when both sides are
                    short (percentages, ad counts). On the send row it would
                    print two five-tier lists side by side; there the new value
                    alone carries the news — a tier the level opens simply
                    appears in it.
                  */}
                    {row.from && row.from.length <= 14 && row.value.length <= 14 && (
                      <span className="flex items-baseline gap-1 text-white/40 font-semibold">
                        <span className="line-through">{row.from}</span>
                        <ArrowRight size={12} className="self-center" />
                      </span>
                    )}
                    {row.multiplier ? (
                      <SuperBoostBadge
                        multiplier={row.multiplier}
                        size={isSmall ? 'xs' : 'sm'}
                        className="self-center"
                      />
                    ) : (
                      row.value
                    )}
                  </span>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
