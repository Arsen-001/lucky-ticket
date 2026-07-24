'use client';

import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  Check,
  Coins,
  Lock,
  Medal,
  MonitorPlay,
  Share2,
  ShoppingBag,
  Target,
  Ticket,
  UserPlus,
  Wallet,
  Zap,
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  TEST_QUEST_CHANNEL_URL,
  testQuestStepHref,
  type TestQuestStep,
  type TestQuestStepKind,
} from '@/constants/testQuest.constants';
import { getTelegramWebApp } from '@/lib/telegram/telegram';

export interface TestQuestStepRowProps {
  step: TestQuestStep;
  /** Level already claimed → the step reads as done (checked marker, dimmed). */
  done?: boolean;
  /** Live cumulative count for this step's action (from TestQuestProgress). When
   *  provided for a countable step, the badge shows real progress and the row
   *  checks off once it reaches the target — independent of the claimed state. */
  count?: number;
}

// Task-type marker (icon + tint) by step kind — derived from the structured
// `kind` field instead of matching the (now localized) label text.
const STEP_VISUALS: Record<TestQuestStepKind, { Icon: LucideIcon; tint: string }> = {
  tickets: { Icon: Ticket, tint: 'bg-teal/16 text-teal' },
  ads: { Icon: MonitorPlay, tint: 'bg-electric-purple/18 text-electric-purple' },
  share: { Icon: Share2, tint: 'bg-electric-pink/16 text-electric-pink' },
  referral: { Icon: UserPlus, tint: 'bg-electric-pink/16 text-electric-pink' },
  engine: { Icon: Zap, tint: 'bg-gold/16 text-gold' },
  shop: { Icon: ShoppingBag, tint: 'bg-orange/18 text-orange' },
  wallet: { Icon: Wallet, tint: 'bg-diamond/18 text-diamond' },
  stake: { Icon: Coins, tint: 'bg-silver/16 text-silver' },
  status: { Icon: Medal, tint: 'bg-gold/16 text-gold' },
  profile: { Icon: Target, tint: 'bg-white/[0.08] text-white/55' },
  rank: { Icon: Medal, tint: 'bg-gold/16 text-gold' },
  channel: { Icon: Lock, tint: 'bg-gold/[0.16] text-gold' },
};

/**
 * One quest-log row under the Test-Quest pyramid. A leading task-type icon (that
 * pops to a green check once the level is taken) marks the step; a countable step
 * shows a target dial, and a step with a resolved href an inline nav button. The
 * channel gate is styled as a dashed-gold "sealed" row that opens the official
 * channel. All copy is resolved through `t()` so the checklist follows the locale.
 */
export function TestQuestStepRow({ step, done = false, count }: TestQuestStepRowProps) {
  const t = useAppTranslations();
  const isChannelGate = step.gate === 'channel';
  const { Icon, tint } = STEP_VISUALS[step.kind];
  const href = isChannelGate ? undefined : testQuestStepHref[step.kind];

  // Live cumulative progress toward a countable step's target. A claimed level
  // reads fully done; otherwise the real counter decides, so the badge moves as
  // the player acts even before the level is claimed.
  const hasLive = step.target != null && count != null;
  const reached = hasLive && count >= step.target!;
  const isDone = done || reached;
  const shownCount =
    step.target == null ? null : isDone ? step.target : hasLive ? Math.min(count, step.target) : 0;

  const openChannel = () => {
    const webApp = getTelegramWebApp();
    if (webApp?.openTelegramLink) webApp.openTelegramLink(TEST_QUEST_CHANNEL_URL);
    else if (typeof window !== 'undefined') window.open(TEST_QUEST_CHANNEL_URL, '_blank');
  };

  return (
    <div
      className={twMerge(
        'rounded-xl',
        isChannelGate
          ? twMerge(
              'border border-dashed border-gold/40 bg-gold/[0.04]',
              isDone && 'border-solid border-success/40 bg-success/[0.06]'
            )
          : 'bg-white/[0.03]'
      )}
    >
      <div className="flex items-center gap-2.5 px-2 py-1.5">
        <span
          className={twMerge(
            'flex-center h-7 w-7 shrink-0 rounded-lg transition-colors',
            isDone ? 'bg-success/15 text-success' : tint
          )}
        >
          {isDone ? <Check size={15} /> : <Icon size={14} />}
        </span>

        <span
          className={twMerge(
            'min-w-0 flex-1 text-[12px] font-semibold leading-snug',
            isDone ? 'text-white/40' : 'text-white/85'
          )}
        >
          {t(step.labelKey)}
        </span>

        {step.target != null && (
          <span
            className={twMerge(
              'flex-center shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold tabular-nums',
              isDone ? 'bg-success/15 text-success' : 'bg-white/[0.05] text-white/45'
            )}
          >
            {shownCount}/{step.target}
          </span>
        )}

        {isChannelGate ? (
          <button
            type="button"
            onClick={openChannel}
            aria-label={t('open channel')}
            className="flex-center -my-0.5 shrink-0 rounded-lg px-1 py-0.5 text-gold active:scale-95"
          >
            <ArrowUpRight size={15} />
          </button>
        ) : (
          href && (
            <Link
              href={href}
              aria-label={t('go')}
              className="flex-center -my-0.5 shrink-0 rounded-lg px-1 py-0.5 text-electric-pink active:scale-95"
            >
              <ArrowUpRight size={15} />
            </Link>
          )
        )}
      </div>
    </div>
  );
}
