'use client';

import { Check, Loader2, Play, SkipForward, Timer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import type { AdSlot } from '@/types/interfaces/tasks.interfaces';
import { AdRewardRow } from './AdRewardRow';
import { AdRewardRail } from './AdRewardRail';

/** Radius and circumference of the progress ring, in its own 58×58 viewBox. */
const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R;

export interface AdWatchCardProps {
  slots: AdSlot[];
  watchedToday: number;
  total: number;
  /** First unwatched slot — `null` once the day is spent. */
  nextSlot: AdSlot | null;
  /** Seconds left in the pause after the previous view; 0 when there is none. */
  cooldownSeconds?: number;
  /** An ad is being fetched or the reward is being claimed. */
  loading?: boolean;
  /** The next slot was bought and bought views pay no activity points. */
  paidWithoutAp?: boolean;
  /** Skips the status has left today; 0 (or absent) hides the whole notion. */
  skipsLeft?: number;
  /** Time until the daily reset, already formatted. */
  resetLabel?: string;
  onWatch: (slot: AdSlot) => void;
  className?: string;
}

/**
 * The whole rewarded-ads block in one card: how much of the day is left (the
 * ring), which view is next, what it pays, one button, and the day as a strip.
 *
 * It replaces a twenty-card carousel in which exactly one card was ever
 * actionable — the other nineteen were a lock icon and a scroll gesture. The
 * information they carried (how far into the day you are, which views pay more)
 * is in the ring and the strip, and costs no interaction.
 */
export function AdWatchCard({
  slots,
  watchedToday,
  total,
  nextSlot,
  cooldownSeconds = 0,
  loading = false,
  paidWithoutAp = false,
  skipsLeft = 0,
  resetLabel,
  onWatch,
  className,
}: AdWatchCardProps) {
  const t = useAppTranslations();

  const spent = !nextSlot;
  // A skipped view plays no ad, so the pause that exists to stop a network
  // answering `onNonStopShow` has nothing to protect — waiting through it would
  // be a delay invented for the player who paid to skip the wait.
  const skipping = !spent && !!nextSlot?.skippable && skipsLeft > 0;
  const cooling = !spent && !loading && !skipping && cooldownSeconds > 0;
  const playable = !spent && !loading && !cooling;

  // The ring carries the day, except during the pause, when it counts the pause
  // down instead — the same circle, the only moving thing on the card, so the
  // wait reads as "nearly ready" rather than as a dead control.
  const dayFraction = total > 0 ? Math.min(1, watchedToday / total) : 0;
  const coolFraction = Math.min(1, cooldownSeconds / GlobalConstants.adCooldownSeconds);
  const fraction = cooling ? coolFraction : spent ? 1 : dayFraction;

  const title = spent
    ? t('ads all watched today')
    : t('ad view number', { num: (nextSlot?.index ?? 0) + 1 });

  const hint = loading
    ? t('loading')
    : spent
      ? t('all rewards added')
      : cooling
        ? t('ad cooldown hint')
        : skipping
          ? t('ad skip hint {left}', { left: skipsLeft })
          : paidWithoutAp
            ? t('paid ad no ap')
            : t('ad ready hint');

  const ctaLabel = loading
    ? t('loading')
    : spent
      ? t('new ads in', { time: resetLabel ?? '' })
      : cooling
        ? t('next ad in seconds', { sec: cooldownSeconds })
        : skipping
          ? t('take without watching')
          : t('watch');

  return (
    <div
      className={twMerge(
        'card-outlined bg-background-overlay relative flex flex-col gap-3 overflow-hidden rounded-2xl p-3.5',
        spent && 'opacity-90',
        className
      )}
    >
      {/* Lit from above — the same layer the slide cards used, kept because it
          is what makes the card sit on the backdrop instead of on top of it. */}
      <span className="ad-card-glow pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative flex items-center gap-3">
        <span className="relative grid size-[58px] shrink-0 place-items-center">
          <svg
            width="58"
            height="58"
            viewBox="0 0 58 58"
            className="absolute inset-0 -rotate-90"
            aria-hidden
          >
            <circle
              cx="29"
              cy="29"
              r={RING_R}
              fill="none"
              strokeWidth="4"
              className="stroke-white/10"
            />
            <circle
              cx="29"
              cy="29"
              r={RING_R}
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              stroke="currentColor"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - fraction)}
              className={twMerge(
                'transition-[stroke-dashoffset] duration-300 ease-linear',
                cooling || spent ? 'text-electric-purple' : 'text-electric-pink'
              )}
            />
          </svg>
          <span
            className={twMerge(
              'flex-center size-[42px] rounded-full text-[15px] font-extrabold tabular-nums',
              cooling && 'bg-gradient-purple border-electric-purple/45 border text-white/75',
              spent && 'bg-electric-purple/35 text-white/80',
              !cooling && !spent && 'bg-pink-gradient text-white'
            )}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : spent ? (
              <Check size={18} strokeWidth={2.6} />
            ) : cooling ? (
              cooldownSeconds
            ) : skipping ? (
              <SkipForward size={17} fill="currentColor" className="translate-x-px" />
            ) : (
              <Play size={17} fill="currentColor" className="translate-x-px" />
            )}
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] leading-tight font-extrabold text-white">{title}</h3>
          <p className="text-pink-secondary mt-0.5 line-clamp-2 text-[11px] leading-snug">{hint}</p>
        </div>

        {/* One reward stays beside the title; two and more get their own row
            below, where each chip has a quarter of the card instead of a
            sliver. */}
        {nextSlot && nextSlot.rewards.length === 1 && (
          <AdRewardRow rewards={nextSlot.rewards} variant="inline" muted={!playable} />
        )}

        {/* Names the perk that is paying for this view. Without it the button
            reads as the app skipping ads on its own — the one reading that
            makes a subscriber wonder what they paid for. */}
        {skipping && (
          <span className="border-electric-purple/40 bg-electric-purple/20 text-electric-purple shrink-0 self-start rounded-full border px-1.5 py-0.5 text-[9px] font-bold">
            {t('lucky player')}
          </span>
        )}

        {nextSlot?.paid && (
          <span className="border-gold/30 bg-gold/15 text-gold shrink-0 self-start rounded-full border px-1.5 py-0.5 text-[9px] font-bold">
            {t('ad bought')}
          </span>
        )}
      </div>

      {nextSlot && nextSlot.rewards.length > 1 && (
        <AdRewardRow rewards={nextSlot.rewards} muted={!playable} />
      )}

      <button
        type="button"
        disabled={!playable}
        onClick={playable && nextSlot ? () => onWatch(nextSlot) : undefined}
        className={twMerge(
          'flex-center relative h-11 w-full shrink-0 gap-2 rounded-xl text-[13px] font-extrabold transition-all active:scale-[0.98] disabled:cursor-not-allowed',
          // Keeps the gradient during the pause but drops the pulse: still
          // visibly the live control, no longer inviting a tap it would refuse.
          cooling && 'bg-gradient-purple border-electric-purple/45 border text-white/75',
          spent && 'bg-white/6 text-white/50',
          loading && 'bg-pink-gradient text-white opacity-75',
          playable && 'bg-pink-gradient animate-task-pulse text-white hover:brightness-110'
        )}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : cooling ? (
          <Timer size={14} strokeWidth={2.4} />
        ) : spent ? (
          <Check size={14} strokeWidth={2.6} />
        ) : skipping ? (
          <SkipForward size={13} fill="currentColor" />
        ) : (
          <Play size={13} fill="currentColor" />
        )}
        <span className={twMerge((cooling || spent) && 'tabular-nums')}>{ctaLabel}</span>
      </button>

      <AdRewardRail
        slots={slots}
        activeIndex={nextSlot ? slots.findIndex(slot => slot.id === nextSlot.id) : -1}
        className="relative"
      />
    </div>
  );
}
