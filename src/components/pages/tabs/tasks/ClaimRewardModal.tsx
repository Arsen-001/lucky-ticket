'use client';

import { useEffect, useState } from 'react';
import { Check, Coins, Loader2, Sparkles, Star, Ticket, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Ticket as TicketArt } from '@/components/shared/icons/Ticket';
import { TaskRewardType } from '@/types/enums/tasks.enums';
import type { ClaimTaskResponse, TaskReward } from '@/types/interfaces/tasks.interfaces';
import { mergeRewards, type ClaimErrorKind } from '@/utils/pages/task-claim.utils';
import { triggerHaptic } from '@/utils/global/haptic.utils';
import { formatNumber } from '@/utils/global/number.utils';
import { asTicketTier } from '@/utils/global/ticket-tier.utils';
import { ClaimAdProgress } from './ClaimAdProgress';
import { ClaimRewardAmount } from './ClaimRewardAmount';
import { TaskRewardRow } from './TaskRewardRow';

// Task claims return a full balance snapshot; ad-watch grants rewards only (no
// balance), so the modal accepts a result whose `newBalance` may be absent.
export type RewardModalResult = Omit<ClaimTaskResponse, 'newBalance'> & {
  newBalance?: ClaimTaskResponse['newBalance'];
};

export interface ClaimRewardModalProps {
  open: boolean;
  result?: RewardModalResult | null;
  loading?: boolean;
  error?: boolean;
  errorKind?: ClaimErrorKind;
  /** Tier of whatever was claimed — decides which ticket the prize art shows. */
  tier?: string;
  /** Set when the reward came from a rewarded ad rather than a task claim: an
   *  ad grant has no balance snapshot, so the modal shows the day's remaining
   *  views in its place and closes with a neutral label. */
  ad?: { watchedToday: number; total: number };
  onClose: () => void;
  onContinue: () => void;
  onRetry?: () => void;
}

const REWARD_ICON: Record<Exclude<TaskRewardType, TaskRewardType.ACTIVITY_POINTS>, LucideIcon> = {
  [TaskRewardType.LC]: Coins,
  [TaskRewardType.TICKETS]: Ticket,
  [TaskRewardType.STARS]: Star,
  [TaskRewardType.PREMIUM]: Sparkles,
  [TaskRewardType.ENGINE]: Trophy,
};

const REWARD_GRADIENT: Record<TaskRewardType, string> = {
  [TaskRewardType.LC]: 'from-gold to-orange',
  [TaskRewardType.TICKETS]: 'from-electric-pink to-pink',
  [TaskRewardType.ACTIVITY_POINTS]: 'from-teal to-diamond',
  [TaskRewardType.STARS]: 'from-warning to-gold',
  [TaskRewardType.PREMIUM]: 'from-pink to-electric-purple',
  [TaskRewardType.ENGINE]: 'from-platinum to-gold',
};

const buildParticles = () =>
  Array.from({ length: 24 }, () => ({
    tx: (Math.random() - 0.5) * 280,
    ty: -(Math.random() * 200 + 60),
    rot: Math.random() * 360,
    size: 4 + Math.round(Math.random() * 6),
    color: ['#f8bd3e', '#de009b', '#178d88', '#743df5'][Math.floor(Math.random() * 4)],
    delay: Math.random() * 0.2,
  }));

function Confetti() {
  const [particles] = useState(buildParticles);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden flex-center">
      {particles.map((p, i) => (
        <span
          key={i}
          className="task-confetti-particle absolute rounded-sm"
          style={
            {
              width: p.size,
              height: p.size,
              background: p.color,
              transform: `rotate(${p.rot}deg)`,
              animationDelay: `${p.delay}s`,
              ['--tx' as string]: `${p.tx}px`,
              ['--ty' as string]: `${p.ty}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

type ModalView = 'loading' | 'error' | 'success';

export function ClaimRewardModal({
  open,
  result,
  loading,
  error,
  errorKind = 'network',
  tier,
  ad,
  onClose,
  onContinue,
  onRetry,
}: ClaimRewardModalProps) {
  const t = useAppTranslations();

  const view: ModalView = error ? 'error' : result ? 'success' : 'loading';
  const canRetry = errorKind === 'network';

  const errorTitle =
    errorKind === 'claimed'
      ? t('claim already done')
      : errorKind === 'rejected'
        ? t('claim unavailable')
        : t('claim failed');
  const errorDescription =
    errorKind === 'claimed'
      ? t('claim already done description')
      : errorKind === 'rejected'
        ? t('claim unavailable description')
        : t('claim failed description');

  // One entry per currency: a bundle claim answers per sub-step, and the row
  // below used to repeat "+1" five times for what is one payout of +5.
  const rewards = mergeRewards(result?.rewards ?? []);
  const primaryReward: TaskReward | undefined =
    rewards.find(r => r.type === TaskRewardType.LC) ?? rewards[0];
  // The headline already states the primary reward in full. Listing it again in
  // the chip row put the same number on screen twice, which reads as two
  // separate prizes — the row carries only what the headline left out.
  const extraRewards = rewards.filter(r => r !== primaryReward);

  const primaryIsAp = primaryReward?.type === TaskRewardType.ACTIVITY_POINTS;
  // A claim that pays tickets shows the ticket it paid, at prize size. The
  // outline glyph named the currency and hid the only thing that varies.
  const primaryTicketTier =
    primaryReward?.type === TaskRewardType.TICKETS
      ? (asTicketTier(primaryReward.label) ?? asTicketTier(tier) ?? 'bronze')
      : undefined;
  // Compared inline rather than through `primaryIsAp`: the icon map has no
  // entry for activity points, and a separate boolean does not narrow the type
  // that indexes it — which is what `noImplicitAny: false` was silently
  // papering over here.
  const PrimaryIcon =
    primaryReward && primaryReward.type !== TaskRewardType.ACTIVITY_POINTS
      ? REWARD_ICON[primaryReward.type]
      : Coins;
  const gradient = primaryReward
    ? REWARD_GRADIENT[primaryReward.type]
    : 'from-pink to-electric-pink';

  useEffect(() => {
    if (open && result) triggerHaptic('success');
  }, [open, result]);

  return (
    <Modal open={open} onClose={onClose} hideCloseButton label={t('claim reward')}>
      <div
        className="relative bg-purple-gradient rounded-2xl overflow-hidden w-full max-w-[360px] mx-auto"
        style={{ height: 540 }}
      >
        {open && view === 'success' && <Confetti />}

        <div className="relative h-full flex flex-col items-center justify-between px-6 pt-8 pb-6">
          {/* PRIZE AREA — fixed h-32 */}
          <div className="flex-center h-32 w-full">
            <div className="relative flex-center">
              {view === 'success' ? (
                <>
                  <div
                    className={twMerge(
                      'flex-center w-28 h-28 rounded-full bg-gradient-to-br shadow-2xl shadow-black/40 animate-task-prize',
                      gradient
                    )}
                  >
                    {primaryIsAp ? (
                      <BoltIcon size={84} className="drop-shadow-lg" />
                    ) : primaryTicketTier ? (
                      <TicketArt
                        type={primaryTicketTier}
                        width={96}
                        height={50}
                        className="drop-shadow-lg"
                      />
                    ) : (
                      <PrimaryIcon size={56} className="text-white drop-shadow-lg" />
                    )}
                  </div>
                  <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                    <span className="absolute -top-1/2 -left-1/2 h-[200%] w-[60%] bg-gradient-to-r from-transparent via-white/30 to-transparent animate-task-shine" />
                  </span>
                </>
              ) : view === 'error' ? (
                // "Already claimed" is not a failure — the player got the
                // reward. Painting it in error red says they lost something.
                errorKind === 'claimed' ? (
                  <div className="flex-center w-28 h-28 rounded-full bg-success/20 border border-success/40">
                    <Check size={48} className="text-success" />
                  </div>
                ) : (
                  <div className="flex-center w-28 h-28 rounded-full bg-error/20 border border-error/40">
                    <Sparkles size={48} className="text-error-text" />
                  </div>
                )
              ) : (
                <div className="flex-center w-28 h-28 rounded-full bg-white/5 border border-white/10">
                  <Loader2 size={42} className="text-white/60 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* TITLE BLOCK — fixed h-16 */}
          <div className="flex flex-col items-center justify-center gap-1 h-16 w-full">
            <h2 className="text-2xl font-extrabold leading-tight">
              {view === 'success' && `${t('awesome')}!`}
              {view === 'error' && errorTitle}
              {view === 'loading' && t('claiming')}
            </h2>
            {view === 'loading' ? (
              <Skeleton variant="line" className="h-3 w-40 rounded-full" />
            ) : (
              <p className="text-xs text-white-secondary text-center max-w-[260px] line-clamp-2">
                {view === 'success' && t('claim modal description')}
                {view === 'error' && errorDescription}
              </p>
            )}
          </div>

          {/* COUNTER + EXTRA REWARDS — fixed h-20 */}
          <div className="flex flex-col items-center justify-center gap-2 h-20 w-full">
            {/* The card's height is fixed so the layout does not jump when the
                claim lands, which left the waiting state as a spinner over two
                empty bands — it read as a broken screen rather than a pending
                one. The skeletons stand in the exact shapes the numbers will
                take. */}
            {view === 'loading' && (
              <>
                <Skeleton variant="line" className="h-9 w-36 rounded-xl" />
                <Skeleton variant="line" className="h-4 w-24 rounded-full" />
              </>
            )}
            {view === 'success' && (
              <>
                {primaryReward && <ClaimRewardAmount reward={primaryReward} />}
                {extraRewards.length > 0 ? (
                  <TaskRewardRow
                    rewards={extraRewards}
                    tier={tier}
                    size="md"
                    className="justify-center"
                  />
                ) : (
                  <div className="h-6" />
                )}
              </>
            )}
          </div>

          {/* BALANCE ROW — fixed h-16. An ad grant carries no balance snapshot,
              so it shows the day's views instead of leaving the band empty. */}
          <div className="h-16 w-full flex items-center">
            {view === 'success' && !result?.newBalance && ad ? (
              <ClaimAdProgress watchedToday={ad.watchedToday} total={ad.total} />
            ) : view === 'success' && result?.newBalance ? (
              <div className="flex flex-col gap-1 w-full rounded-2xl bg-white/5 p-2.5">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold text-center">
                  {t('new balance')}
                </p>
                <div className="flex items-center justify-around text-sm font-bold tabular-nums">
                  <div className="flex items-center gap-1">
                    <LcLabel size={14} />
                    <span>{result.newBalance.lc.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Ticket size={14} className="text-electric-pink" />
                    <span>{formatNumber(result.newBalance.tickets)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BoltIcon size={20} />
                    <span>{formatNumber(result.newBalance.activityPoints)}</span>
                  </div>
                </div>
              </div>
            ) : view === 'loading' ? (
              <Skeleton variant="line" className="h-full w-full rounded-2xl" />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>

          {/* BUTTON — fixed h-12. The modal hides its X, so the error view has
              to carry its own way out: with Retry as the only control, a claim
              the server keeps refusing (already claimed) had no exit but the
              sliver of backdrop around a 360px panel, and read as a freeze. */}
          <div className="flex w-full h-12 gap-2">
            {view === 'error' ? (
              <>
                <Button
                  variant="secondary"
                  onClick={onContinue}
                  className="flex-1 rounded-xl py-3 text-sm h-full"
                >
                  {t('close')}
                </Button>
                {canRetry && (
                  <Button
                    onClick={onRetry}
                    loading={loading}
                    className="flex-1 rounded-xl py-3 text-sm h-full"
                  >
                    {t('retry')}
                  </Button>
                )}
              </>
            ) : view === 'success' ? (
              // «Continue tasks» is the task-claim promise. An ad view is not a
              // task, and the player watching one is mid-loop on this very
              // screen — the button just closes the card.
              <Button onClick={onContinue} className="flex-1 rounded-xl py-3 text-sm h-full">
                {ad ? t('continue') : t('continue tasks')}
              </Button>
            ) : (
              // Spinner, not the word "Loading" a second time: the title above
              // already says what is happening.
              <Button
                variant="secondary"
                loading
                className="flex-1 rounded-xl py-3 text-sm h-full opacity-50"
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
