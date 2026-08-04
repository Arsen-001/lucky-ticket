'use client';

import { Check, Loader2, Lock, Play, Timer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { AdSlot } from '@/types/interfaces/tasks.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { AdRewardDisplay } from './AdRewardDisplay';

export interface AdSlideCardProps {
  slot: AdSlot;
  onWatch: (slot: AdSlot) => void;
  loading?: boolean;
  locked?: boolean;
  /**
   * Seconds left in the pause after the previous view — 0 when there is none.
   * While it runs the button counts down instead of inviting a tap, so the wait
   * reads as "almost ready" rather than as a dead control.
   */
  cooldownSeconds?: number;
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

/**
 * Halo on the rare slots only. Softened 2026-08-04: at 18–28px and 0.30–0.45
 * the glow bled past the card into its dimmed neighbours in the carousel, so
 * the whole row looked hazy rather than the one card looking special. The
 * ranking between the three is what carries the meaning, not their weight.
 */
const AD_GLOW: Record<number, string> = {
  1: '',
  2: 'shadow-[0_0_12px_rgba(23,141,136,0.18)]',
  3: '',
  4: '',
  5: 'shadow-[0_0_14px_rgba(116,61,245,0.24)]',
  6: '',
  7: '',
  8: '',
  9: 'shadow-[0_0_18px_rgba(248,189,62,0.28)]',
  10: '',
};

/**
 * Rewarded-ad slide. A card rather than a row: state badge + numbered title,
 * one line saying what the slot actually is, the reward panel, and a labelled
 * CTA at the foot. The old ultra-compact row fit three glyphs — `#5 · +2 · ▶` —
 * which left the player guessing what the tap would cost them and what it pays.
 */
export function AdSlideCard({
  slot,
  onWatch,
  loading,
  locked = false,
  cooldownSeconds = 0,
}: AdSlideCardProps) {
  const t = useAppTranslations();
  const watched = slot.watched;
  const cooling = !watched && !locked && cooldownSeconds > 0;
  const playable = !watched && !locked && !cooling;
  const showShine = slot.index >= 9 && playable;

  // Position in the day, counted the way a person counts: the first ad is #1.
  // Only the label shifts — `slot.index` stays 0-based everywhere else (frame,
  // glow, shine threshold, and the reward ladder it indexes into), and the
  // admin's «Награды по номеру просмотра» already starts at #1.
  const viewNumber = slot.index + 1;

  const hint = loading
    ? t('loading')
    : watched
      ? t('ad watched hint')
      : locked
        ? t('ad locked hint')
        : cooling
          ? t('ad cooldown hint')
          : t('ad ready hint');

  // The button is short and the card is 208px wide, so the countdown shows as
  // «8 с» — the full "Next ad in 8s" sentence goes to the accessible name.
  const ctaLabel = loading
    ? t('loading')
    : watched
      ? t('watched')
      : locked
        ? t('locked')
        : cooling
          ? `${cooldownSeconds} ${t('second short')}`
          : t('watch');

  const ctaAriaLabel = cooling ? t('next ad in seconds', { sec: cooldownSeconds }) : ctaLabel;

  return (
    <div
      className={twMerge(
        'bg-background-overlay relative flex h-full w-full flex-col gap-2.5 overflow-hidden rounded-2xl px-3 py-3',
        AD_FRAME[slot.index] ?? 'card-outlined',
        AD_GLOW[slot.index] ?? '',
        watched && 'pointer-events-none opacity-60 select-none',
        locked && 'opacity-50 saturate-50'
      )}
    >
      {showShine && (
        <span className="pointer-events-none absolute -inset-6 overflow-hidden">
          <span className="animate-task-shine absolute top-0 left-0 h-[200%] w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </span>
      )}

      {/* Head — state badge, numbered title, and the "bought" tag when the slot
          sits past the free daily cap (a player who paid should see what for). */}
      <div className="relative flex items-center gap-2">
        <span
          className={twMerge(
            'flex-center size-8 shrink-0 rounded-xl',
            watched && 'bg-success/20 text-success',
            locked && 'bg-white/5 text-white/40',
            cooling && 'bg-pink-gradient text-white opacity-70',
            playable && 'bg-pink-gradient text-white'
          )}
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" />
          ) : watched ? (
            <Check size={16} strokeWidth={2.6} />
          ) : locked ? (
            <Lock size={14} strokeWidth={2.4} />
          ) : cooling ? (
            <Timer size={15} strokeWidth={2.4} />
          ) : (
            <Play size={14} fill="currentColor" className="translate-x-px" />
          )}
        </span>

        <h3 className="min-w-0 flex-1 truncate text-[13px] leading-tight font-extrabold text-white">
          {t('ad view number', { num: viewNumber })}
        </h3>

        {slot.paid && (
          <span className="border-gold/25 bg-gold/15 text-gold shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold">
            {t('ad bought')}
          </span>
        )}
      </div>

      {/* Two lines are reserved whatever the state, so the reward panels of
          neighbouring slides stay on the same baseline across the carousel. */}
      <p className="relative line-clamp-2 min-h-[26px] text-[10px] leading-snug text-white/45">
        {hint}
      </p>

      <AdRewardDisplay
        rewards={slot.rewards}
        muted={watched || locked}
        className="relative shrink-0"
      />

      <button
        type="button"
        aria-label={ctaAriaLabel}
        disabled={!playable || loading}
        onClick={playable ? () => onWatch(slot) : undefined}
        className={twMerge(
          'flex-center relative mt-auto h-9 w-full shrink-0 gap-1.5 rounded-xl text-xs font-extrabold transition-all active:scale-95 disabled:cursor-not-allowed',
          watched && 'bg-success/15 text-success',
          locked && 'bg-white/5 text-white/40',
          // Keeps the gradient, drops the pulse: still visibly the live slot,
          // but no longer inviting a tap it would refuse.
          cooling && 'bg-pink-gradient text-white opacity-70',
          // No static shadow here: `animate-task-pulse` animates `box-shadow`
          // itself, so a `shadow-lg` next to it was overridden on every frame
          // and only ever showed for the instant before the animation started.
          playable && 'bg-pink-gradient animate-task-pulse text-white hover:brightness-110'
        )}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : watched ? (
          <Check size={14} strokeWidth={2.6} />
        ) : locked ? (
          <Lock size={12} strokeWidth={2.4} />
        ) : cooling ? (
          <Timer size={13} strokeWidth={2.4} />
        ) : (
          <Play size={12} fill="currentColor" />
        )}
        <span className={twMerge(cooling && 'tabular-nums')}>{ctaLabel}</span>
      </button>
    </div>
  );
}
