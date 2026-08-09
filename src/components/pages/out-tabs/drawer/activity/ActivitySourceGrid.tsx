'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { staggerMs } from '@/utils/global/animation.utils';
import { Link } from '@/components/shared/links/Link';
import { AP_SOURCES, apSourceHref, apSourcesByPace } from './ap-sources';
import type { ActivityTier } from '@/constants/global.constants';

export interface ActivitySourceGridProps {
  watchVideoLimit: number;
  /** Pace caption beside the heading — omitted when the card's subline says it. */
  dailyBaseline?: number;
  /**
   * With a tier, the grid opens on the fastest `previewCount` tiles and keeps
   * the rest behind "see more". Without it, the whole catalogue is shown.
   */
  tier?: ActivityTier;
  previewCount?: number;
}

/**
 * Every source as a two-up grid of tiles. Thirteen full-width rows spend a
 * whole fold on white space to the right of a four-character rate; two columns
 * put the same catalogue in 60% of the height and keep the rate legible.
 *
 * Folded, it costs two rows: the four that pay fastest at this tier, ranked off
 * the same constants the daily baseline is summed from — not an editorial pick.
 */
export function ActivitySourceGrid({
  watchVideoLimit,
  dailyBaseline,
  tier,
  previewCount = 4,
}: ActivitySourceGridProps) {
  const t = useAppTranslations();
  const [open, setOpen] = useState(false);

  const folded = tier !== undefined;
  const ordered = folded ? apSourcesByPace(tier, watchVideoLimit) : AP_SOURCES;
  const visible = folded && !open ? ordered.slice(0, previewCount) : ordered;

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-white">
          {t('how to earn ap')}
        </h2>
        {dailyBaseline !== undefined && (
          <span className="text-pink-secondary text-[11px] font-bold">
            {t('~{n} AP per day without donation', { n: dailyBaseline })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {visible.map((source, index) => {
          const hintParams =
            source.id === 'watchVideo'
              ? { ...source.hintParams, n: watchVideoLimit }
              : source.hintParams;

          return (
            <Link
              key={source.id}
              href={apSourceHref(source)}
              className="bg-background-overlay/40 animate-slide-in-bottom flex flex-col gap-1 rounded-xl border border-white/5 p-2.5 transition-colors hover:bg-white/8"
              style={{ animationDelay: `${staggerMs(index, 40)}ms` }}
            >
              <div className="flex items-center gap-1.5">
                <source.Icon size={14} strokeWidth={2.2} className="text-electric-pink shrink-0" />
                <span className="truncate text-[11.5px] font-bold leading-tight text-white">
                  {t(source.labelKey)}
                </span>
              </div>
              <span className="text-success-text text-[12.5px] font-extrabold tabular-nums">
                {source.ap ? `${source.ap} ${t('ap')}` : t(source.apFallbackKey ?? 'varies')}
              </span>
              <span className="text-pink-secondary truncate text-[10px]">
                {t(source.hintKey, hintParams)}
              </span>
            </Link>
          );
        })}
      </div>

      {folded && (
        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          aria-expanded={open}
          className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 border-b border-white/5 text-left"
        >
          <span className="text-[12.5px] font-bold text-white/70">
            {t('all ap sources', { n: AP_SOURCES.length })}
          </span>
          <ChevronDown
            size={17}
            aria-hidden
            className={`text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </section>
  );
}
