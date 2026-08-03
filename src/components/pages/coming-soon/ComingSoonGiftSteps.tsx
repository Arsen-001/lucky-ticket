'use client';

import { Fragment } from 'react';
import { Check, Gift, UserPlus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { comingSoonConfig } from '@/config/coming-soon.config';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GiftStepBar } from './GiftStepBar';
import { GiftStepNode } from './GiftStepNode';
import type { CSSProperties } from 'react';
import type { PreLaunchGiftState } from '@/types/interfaces/referral.interfaces';

/**
 * What the bot sends. One gift since 2026-08-04 — it used to be a four-way draw
 * — so the row below names it instead of hedging with «случайный».
 *
 * Emoji rather than the Telegram sticker art: the art belongs to whichever gift
 * id Telegram has in stock at approval time, and this must not turn into a
 * promise of one particular sticker. Kept equal to the backend's
 * `PRE_LAUNCH_GIFT_EMOJI` by the guardrail suite.
 */
const GIFT_POOL = ['🧸'];

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
  const complete = remaining === 0;
  const sent = gift.status === 'SENT';

  /**
   * Every branch is something we can stand behind. Nothing says a gift is
   * coming before an admin has approved one — the claim is filed, which is all
   * we know — and a refused claim says only that the steps are done: this
   * screen is not where somebody learns they were turned down.
   */
  /**
   * Today's places, shown only while they can still change what this player
   * does. Once their own claim is filed the board is no longer their business —
   * and a player who sees "0 left" AFTER earning theirs reads it as a loss.
   */
  const places = (() => {
    if (gift.status) return null;
    const limit = gift.dailyLimit;
    const left = gift.dailyRemaining;
    if (typeof limit !== 'number' || typeof left !== 'number') return null;
    if (limit <= 0 || left <= 0) return t('coming soon gift places gone');
    return t('coming soon gift places left', { total: limit, left });
  })();

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
      {/* Five friends, then the gift — the gift is a bead of its own now. It
          used to sit ON the fifth step, which made the last friend look like a
          present and the ladder look one friend short. */}
      <div aria-hidden className="flex w-full items-center">
        {Array.from({ length: total }, (_, index) => {
          const step = index + 1;
          const done = reached >= step;
          const active = !done && reached === index;

          return (
            <Fragment key={step}>
              {index > 0 && <GiftStepBar filled={done} />}
              <GiftStepNode
                state={done ? 'done' : active ? 'active' : 'idle'}
                // Every step is one invited friend, and says so: a bare number
                // reads as a level, not as a person to bring.
                icon={
                  done ? (
                    <Check size={15} strokeWidth={3} />
                  ) : (
                    <UserPlus size={15} strokeWidth={2.4} />
                  )
                }
              />
            </Fragment>
          );
        })}

        <GiftStepBar filled={complete} />
        <GiftStepNode
          emphasized
          state={complete ? 'done' : 'idle'}
          icon={<Gift size={17} strokeWidth={2.2} />}
        />
      </div>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" className="h-4 w-56" />}
      >
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-white-secondary max-w-[22rem] text-[13px] font-semibold leading-snug">
            {caption}
          </p>
          {places && (
            <span className="text-warning border-warning/25 bg-warning/10 rounded-full border px-2.5 py-1 text-[11px] font-extrabold tabular-nums">
              {places}
            </span>
          )}
        </div>
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
