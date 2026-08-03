'use client';

import { Fragment } from 'react';
import { Check, Gift, UserPlus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { comingSoonConfig } from '@/config/coming-soon.config';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GiftPrize } from './GiftPrize';
import { GiftStepBar } from './GiftStepBar';
import { GiftStepNode } from './GiftStepNode';
import type { CSSProperties } from 'react';
import type { PreLaunchGiftState } from '@/types/interfaces/referral.interfaces';

/**
 * What the bot sends. One gift since 2026-08-04 — it used to be a four-way
 * draw — so the screen shows the thing itself instead of hedging with a pool.
 *
 * Emoji rather than the Telegram sticker art: the art belongs to whichever gift
 * id Telegram has in stock at approval time, and this must not turn into a
 * promise of one particular sticker. Kept equal to the backend's
 * `PRE_LAUNCH_GIFT_EMOJI` by the guardrail suite, which reads this array.
 */
const GIFT_POOL = ['🧸'];

/** The one gift, for the big prize face. @see GiftPrize */
const PRIZE_EMOJI = GIFT_POOL[0];

export interface ComingSoonGiftStepsProps {
  /** Friends who have already come through this player's link. */
  invitedCount: number;
  /** Where the claim stands once the ladder is full. @see PreLaunchGiftState */
  gift: PreLaunchGiftState;
  loading?: boolean;
  /** Asks the backend for the gift — the player pressed it. */
  onClaim?: () => void;
  /** That request is in flight. */
  claiming?: boolean;
  /** Why the last press was refused, in the backend's own words. */
  error?: string | null;
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
  onClaim,
  claiming,
  error,
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
   * The gift's own state. `canClaim` is the server's answer to "would pressing
   * this work right now" — it already accounts for the places, the channel rule
   * and an existing claim, so the screen never lights up a button that would be
   * refused. An older backend that says nothing degrades to «locked», which
   * promises nothing.
   */
  const prizeState = (() => {
    if (sent) return 'sent' as const;
    if (gift.status) return 'claimed' as const;
    if (gift.canClaim) return 'ready' as const;
    if (gift.eligible) return 'closed' as const;
    return 'locked' as const;
  })();

  /**
   * Today's board: the standing rule («каждый день 5 подарков») and how much of
   * it is already spent. Two facts rather than one, because they do different
   * work — the rule says the promo repeats tomorrow, the count says how much of
   * today is gone.
   *
   * Shown only while it can still change what this player does: once their own
   * claim is filed the board is no longer their business, and «роздано 5 из 5»
   * after earning yours reads as a loss.
   */
  const board = (() => {
    if (gift.status) return null;
    const limit = gift.dailyLimit;
    const left = gift.dailyRemaining;
    if (typeof limit !== 'number' || typeof left !== 'number' || limit <= 0) return null;
    // Derived, not a second server number that could disagree with the first.
    const issued = Math.min(Math.max(limit - left, 0), limit);
    return {
      rule: t('coming soon gift daily rule', { total: limit }),
      issued: t('coming soon gift issued today', { issued, total: limit }),
      gone: left <= 0,
    };
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
          {board && (
            <div className="flex flex-col items-center gap-1">
              <span className="text-electric-pink text-[11px] font-extrabold uppercase tracking-wider">
                {board.rule}
              </span>
              <span
                className={twMerge(
                  'rounded-full border px-2.5 py-1 text-[11px] font-extrabold tabular-nums',
                  board.gone
                    ? 'text-warning border-warning/25 bg-warning/10'
                    : 'border-white/12 bg-white/5 text-white/70'
                )}
              >
                {board.gone ? t('coming soon gift places gone') : board.issued}
              </span>
            </div>
          )}
        </div>
      </SkeletonSuspense>

      {/* The prize itself, at the size a reward deserves — and the press that
          asks for it. It replaces the row of little emoji chips: with one gift
          and a claim to make, a legend of the pool said nothing and did
          nothing. @see GiftPrize */}
      <GiftPrize
        emoji={gift.emoji ?? PRIZE_EMOJI}
        state={prizeState}
        onClaim={onClaim}
        claiming={claiming}
        className="mt-1"
      />

      {error && <p className="text-error-text max-w-[20rem] text-[12px] font-semibold">{error}</p>}
    </div>
  );
}
