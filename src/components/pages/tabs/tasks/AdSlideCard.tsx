import { Check, Lock, PlayCircle } from 'lucide-react';
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

export function AdSlideCard({ slot, onWatch, loading, locked = false }: AdSlideCardProps) {
  const t = useAppTranslations();
  const watched = slot.watched;
  const playable = !watched && !locked;
  const showShine = slot.index >= 9 && playable;

  return (
    <div
      className={twMerge(
        'relative w-full rounded-2xl overflow-hidden bg-background-overlay flex flex-col p-3 gap-2.5',
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

      {/* header: index + watched check */}
      <div className="relative flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-bold text-white/40">
          #{slot.index}
        </span>
        {watched ? (
          <div className="flex-center w-5 h-5 rounded-full bg-success/20">
            <Check size={11} className="text-success" />
          </div>
        ) : locked ? (
          <Lock size={14} className="text-white/40" />
        ) : (
          <PlayCircle size={18} className="text-white/60" />
        )}
      </div>

      {/* rewards block — biggest visual focus */}
      <div className="relative flex flex-col items-center gap-1.5 p-1.5 rounded-xl bg-black/20">
        <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold">
          {t('reward')}
        </p>
        <AdRewardDisplay rewards={slot.rewards} />
      </div>

      {/* watch button */}
      <button
        type="button"
        disabled={!playable || loading}
        onClick={playable ? () => onWatch(slot) : undefined}
        className={twMerge(
          'relative w-full rounded-full px-3 py-2.5 text-xs font-bold transition-all active:scale-95 disabled:cursor-not-allowed flex-center gap-1.5',
          watched && 'bg-white/5 text-white/40',
          locked && 'bg-white/5 text-white/40',
          playable && 'bg-pink-gradient text-white hover:brightness-110 animate-task-pulse'
        )}
      >
        {playable && <PlayCircle size={14} />}
        {locked && <Lock size={12} />}
        {loading ? t('loading') : watched ? t('watched') : locked ? t('locked') : t('watch')}
      </button>
    </div>
  );
}
