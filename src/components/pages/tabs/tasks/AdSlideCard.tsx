import { Check, Loader2, Lock, Play } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { AdSlot } from '@/types/interfaces/tasks.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { AdRewardDisplay } from './AdRewardDisplay';

export interface AdSlideCardProps {
  slot: AdSlot;
  onWatch: (slot: AdSlot) => void;
  loading?: boolean;
  locked?: boolean;
}

const AD_FRAME: Record<number, string> = {
  1: 'card-outlined',
  2: 'task-card-rarity-rare',
  3: 'task-card-tier-bronze',
  4: 'task-card-tier-silver',
  5: 'task-card-rarity-epic',
  6: 'task-card-tier-gold',
  7: 'task-card-tier-platinum',
  8: 'task-card-tier-diamond',
  9: 'task-card-rarity-legendary',
  10: 'task-card-tier-all',
};

const AD_GLOW: Record<number, string> = {
  1: '',
  2: 'shadow-[0_0_18px_rgba(23,141,136,0.30)]',
  3: '',
  4: '',
  5: 'shadow-[0_0_22px_rgba(116,61,245,0.40)]',
  6: '',
  7: '',
  8: '',
  9: 'shadow-[0_0_28px_rgba(248,189,62,0.45)]',
  10: '',
};

/**
 * Ultra-compact rewarded-ad slide: a single horizontal row —
 * `#index · reward chips · mini play button` — roughly half the height of a
 * stacked card. The watch action is an icon-only button (labelled for a11y).
 */
export function AdSlideCard({ slot, onWatch, loading, locked = false }: AdSlideCardProps) {
  const t = useAppTranslations();
  const watched = slot.watched;
  const playable = !watched && !locked;
  const showShine = slot.index >= 9 && playable;

  const label = loading ? t('loading') : watched ? t('watched') : locked ? t('locked') : t('watch');

  return (
    <div
      className={twMerge(
        'relative flex w-full items-center gap-1.5 rounded-lg overflow-hidden bg-background-overlay px-1.5 py-1.5',
        AD_FRAME[slot.index] ?? 'card-outlined',
        AD_GLOW[slot.index] ?? '',
        watched && 'opacity-60',
        locked && 'opacity-50 saturate-50',
        watched && 'pointer-events-none select-none'
      )}
    >
      {showShine && (
        <span className="pointer-events-none absolute -inset-6 overflow-hidden">
          <span className="absolute top-0 left-0 h-[200%] w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-task-shine" />
        </span>
      )}

      {/* index */}
      <span className="relative shrink-0 text-[9px] font-bold tabular-nums text-white/35">
        #{slot.index}
      </span>

      {/* rewards — inline chips, fill the middle */}
      <div className="relative min-w-0 flex-1">
        <AdRewardDisplay rewards={slot.rewards} />
      </div>

      {/* mini watch button (icon-only; label via aria) */}
      <button
        type="button"
        aria-label={label}
        disabled={!playable || loading}
        onClick={playable ? () => onWatch(slot) : undefined}
        className={twMerge(
          'relative flex-center h-7 w-7 shrink-0 rounded-full transition-all active:scale-90 disabled:cursor-not-allowed',
          watched && 'bg-success/20 text-success',
          locked && 'bg-white/5 text-white/40',
          playable && 'bg-pink-gradient text-white hover:brightness-110 animate-task-pulse'
        )}
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : watched ? (
          <Check size={13} />
        ) : locked ? (
          <Lock size={12} />
        ) : (
          <Play size={12} fill="currentColor" className="translate-x-[1px]" />
        )}
      </button>
    </div>
  );
}
