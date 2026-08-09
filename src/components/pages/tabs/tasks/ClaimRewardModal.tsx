'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Coins, Loader2, Sparkles, Star, Ticket, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { Ticket as TicketArt } from '@/components/shared/icons/Ticket';
import { TaskRewardType } from '@/types/enums/tasks.enums';
import type { ClaimTaskResponse, TaskReward } from '@/types/interfaces/tasks.interfaces';
import type { ClaimErrorKind } from '@/utils/pages/task-claim.utils';
import { triggerHaptic } from '@/utils/global/haptic.utils';
import { formatNumber } from '@/utils/global/number.utils';
import { asTicketTier } from '@/utils/global/ticket-tier.utils';
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

const useCounter = (target: number, durationMs = 900) => {
  const [value, setValue] = useState(0);
  const startedAt = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (target <= 0) {
      setValue(0);
      return;
    }
    setValue(0);
    startedAt.current = null;
    const tick = (ts: number) => {
      if (startedAt.current === null) startedAt.current = ts;
      const elapsed = ts - startedAt.current;
      const ratio = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - ratio, 3);
      setValue(Math.round(target * eased));
      if (ratio < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, durationMs]);

  return value;
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

  const primaryReward: TaskReward | undefined =
    result?.rewards.find(r => r.type === TaskRewardType.LC) ?? result?.rewards[0];

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
  const counterTarget = primaryReward?.amount ?? 0;
  const counter = useCounter(counterTarget);

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
              {view === 'loading' && t('loading')}
            </h2>
            <p className="text-xs text-white-secondary text-center max-w-[260px] line-clamp-2">
              {view === 'success' && t('claim modal description')}
              {view === 'error' && errorDescription}
            </p>
          </div>

          {/* COUNTER + EXTRA REWARDS — fixed h-20 */}
          <div className="flex flex-col items-center justify-center gap-2 h-20 w-full">
            {view === 'success' && (
              <>
                <span className="text-4xl font-extrabold tabular-nums bg-gradient-to-r from-gold via-electric-pink to-electric-purple bg-clip-text text-transparent leading-none">
                  +{formatNumber(counter)}
                </span>
                {result && result.rewards.length > 1 ? (
                  <TaskRewardRow
                    rewards={result.rewards}
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

          {/* BALANCE ROW — fixed h-16 (ad-watch has no balance snapshot → hidden) */}
          <div className="h-16 w-full flex items-center">
            {view === 'success' && result?.newBalance ? (
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
              <Button onClick={onContinue} className="flex-1 rounded-xl py-3 text-sm h-full">
                {t('continue tasks')}
              </Button>
            ) : (
              <Button
                variant="secondary"
                disabled
                className="flex-1 rounded-xl py-3 text-sm h-full opacity-50"
              >
                {t('loading')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
