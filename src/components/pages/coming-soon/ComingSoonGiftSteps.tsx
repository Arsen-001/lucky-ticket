'use client';

import { Fragment } from 'react';
import { Check, Gift } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { comingSoonConfig } from '@/config/coming-soon.config';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { CSSProperties } from 'react';
import type { PreLaunchGiftState } from '@/types/interfaces/referral.interfaces';

/**
 * The pool the bot draws from. Emoji rather than the Telegram sticker art on
 * purpose: which gift arrives is decided when it is sent, so showing one piece
 * of art would read as a promise of that specific gift.
 */
const GIFT_POOL = ['❤️', '🧸', '🎁', '🌹'];

export interface ComingSoonGiftStepsProps {
  /** Friends who have already come through this player's link. */
  invitedCount: number;
  /** Where the claim stands once the ladder is full. @see PreLaunchGiftState */
  gift: PreLaunchGiftState;
  loading?: boolean;
  className?: string;
  /** Carries the screen's entry-animation delay. */
  style?: CSSProperties;
}

/**
 * The ladder under the headline: five friends, then a gift from the bot.
 *
 * This is the whole answer to "earn before the game opens" — the countdown says
 * wait, this says what to do meanwhile. It counts the same referrals the invite
 * block lists, so a friend who shows up in one shows up in the other; there is
 * no separate pre-launch counter to drift out of sync.
 *
 * Deliberately silent about *when* the gift lands: the bot sends it, and this
 * screen has no way to observe that it did.
 */
export function ComingSoonGiftSteps({
  invitedCount,
  gift,
  loading,
  className,
  style,
}: ComingSoonGiftStepsProps) {
  const t = useAppTranslations();

  const total = comingSoonConfig.giftFriendsRequired;
  // Clamped: a prolific inviter is at 5/5, not at 11/5.
  const reached = Math.min(Math.max(invitedCount, 0), total);
  const remaining = total - reached;
  const sent = gift.status === 'SENT';

  /**
   * Every branch is something we can stand behind. Nothing says a gift is
   * coming before an admin has approved one — the claim is filed, which is all
   * we know — and a refused claim says only that the steps are done: this
   * screen is not where somebody learns they were turned down.
   */
  const caption = (() => {
    if (remaining > 0) return t('coming soon gift steps hint', { count: remaining });
    if (sent) {
      return gift.emoji
        ? t('coming soon gift sent', { emoji: gift.emoji })
        : t('coming soon gift sent plain');
    }
    // PENDING / APPROVED / FAILED — all of them still end in a gift; FAILED is
    // an admin's retry away, not a verdict.
    if (gift.status && gift.status !== 'REJECTED') return t('coming soon gift filed');
    // REJECTED, or no claim on record at all (a backend that filed nothing).
    return t('coming soon gift steps done');
  })();

  return (
    <div className={twMerge('flex w-full flex-col items-center gap-3', className)} style={style}>
      <div aria-hidden className="flex w-full items-center">
        {Array.from({ length: total }, (_, index) => {
          const step = index + 1;
          const done = reached >= step;
          // The one the player is working on right now — highlighted so the
          // ladder reads as "you are here", not just as a score.
          const active = !done && reached === index;
          const isGift = step === total;

          return (
            <Fragment key={step}>
              {index > 0 && (
                <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    className={twMerge(
                      'block h-full rounded-full transition-all duration-300',
                      done && 'bg-pink-gradient'
                    )}
                    style={{ width: done ? '100%' : 0 }}
                  />
                </span>
              )}

              <span
                className={twMerge(
                  'flex-center flex-shrink-0 rounded-full border text-[11px] font-extrabold leading-none tabular-nums transition-colors duration-300',
                  isGift ? 'h-9 w-9' : 'h-8 w-8',
                  done
                    ? 'bg-pink-gradient border-transparent text-white shadow-[0_0_14px_-2px_var(--color-electric-pink)]'
                    : active
                      ? 'border-electric-pink/60 bg-electric-pink/12 text-electric-pink'
                      : 'border-white/12 bg-white/5 text-white/40'
                )}
              >
                {isGift ? (
                  <Gift size={17} strokeWidth={2.2} />
                ) : done ? (
                  <Check size={15} strokeWidth={3} />
                ) : (
                  step
                )}
              </span>
            </Fragment>
          );
        })}
      </div>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="h-4 w-56" />}
      >
        <p className="text-white-secondary max-w-[22rem] text-[13px] font-semibold leading-snug">
          {caption}
        </p>
      </SkeletonSuspense>

      {/* The draw is over once a gift has actually gone out — leaving the four
          options up would invite "so which one did I get?". */}
      {!sent && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
            {t('coming soon gift pool')}
          </span>
          <span className="flex items-center gap-1">
            {GIFT_POOL.map(emoji => (
              <span
                key={emoji}
                className="flex-center h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-[15px] leading-none"
              >
                {emoji}
              </span>
            ))}
          </span>
        </div>
      )}
    </div>
  );
}
