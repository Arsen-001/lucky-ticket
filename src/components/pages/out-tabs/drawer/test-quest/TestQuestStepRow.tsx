'use client';

import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
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
import { TEST_QUEST_CHANNEL_URL, type TestQuestStep } from '@/constants/testQuest.constants';
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

// Task-type marker (icon + tint) resolved from the step text — first match wins.
// Ordered so specific verbs (buy, upgrade, stake, status) win before the generic
// ticket/tournament catch-all.
const STEP_VISUALS: { re: RegExp; Icon: LucideIcon; tint: string }[] = [
  { re: /реклам/i, Icon: MonitorPlay, tint: 'bg-electric-purple/18 text-electric-purple' },
  { re: /реферал/i, Icon: UserPlus, tint: 'bg-electric-pink/16 text-electric-pink' },
  {
    re: /(Поделись|Пригласи|друз|Топ по друзьям)/i,
    Icon: Share2,
    tint: 'bg-electric-pink/16 text-electric-pink',
  },
  { re: /(Купи|магазин|осколок)/i, Icon: ShoppingBag, tint: 'bg-orange/18 text-orange' },
  {
    re: /(апгрейд|прокач|движок|скорост|вместимост|Раскачай|Запусти)/i,
    Icon: Zap,
    tint: 'bg-gold/16 text-gold',
  },
  { re: /(кошел|TON|Обменяй|Lucky Stars)/i, Icon: Wallet, tint: 'bg-diamond/18 text-diamond' },
  { re: /стейк/i, Icon: Coins, tint: 'bg-silver/16 text-silver' },
  {
    re: /(Silver|Gold|Platinum|статус|квалифик|Корона|топ-)/i,
    Icon: Medal,
    tint: 'bg-gold/16 text-gold',
  },
  { re: /(Потрать|билет|турнир)/i, Icon: Ticket, tint: 'bg-teal/16 text-teal' },
];

const DEFAULT_VISUAL = { Icon: Target, tint: 'bg-white/[0.08] text-white/55' };

const visualFor = (text: string) => STEP_VISUALS.find(v => v.re.test(text)) ?? DEFAULT_VISUAL;

/**
 * One quest-log row under the Test-Quest slider. A leading task-type icon (that
 * pops to a green check once the level is taken) replaces the old checkbox; a
 * countable step shows a target dial, and a step with `href` an inline nav
 * button. The channel gate is styled as a dashed-gold "sealed" row that opens the
 * official channel. Steps with `detail`/`subSteps` still expand into a how-to.
 */
export function TestQuestStepRow({ step, done = false, count }: TestQuestStepRowProps) {
  const isChannelGate = step.gate === 'channel';
  const expandable = !isChannelGate && !!(step.detail || step.subSteps?.length);
  const [open, setOpen] = useState(false);

  const { Icon, tint } = visualFor(step.text);

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
      <div
        role={expandable ? 'button' : undefined}
        tabIndex={expandable ? 0 : undefined}
        onClick={expandable ? () => setOpen(o => !o) : undefined}
        onKeyDown={
          expandable
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpen(o => !o);
                }
              }
            : undefined
        }
        className={twMerge(
          'flex items-center gap-2.5 px-2 py-1.5',
          expandable && 'cursor-pointer select-none'
        )}
      >
        <span
          className={twMerge(
            'flex-center h-7 w-7 shrink-0 rounded-lg transition-colors',
            isDone
              ? 'bg-success/15 text-success'
              : isChannelGate
                ? 'bg-gold/[0.16] text-gold'
                : tint
          )}
        >
          {isDone ? <Check size={15} /> : isChannelGate ? <Lock size={14} /> : <Icon size={14} />}
        </span>

        <span
          className={twMerge(
            'min-w-0 flex-1 text-[12px] font-semibold leading-snug',
            isDone ? 'text-white/40' : 'text-white/85'
          )}
        >
          {step.text}
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

        {expandable && (
          <ChevronDown
            size={14}
            className={twMerge(
              'shrink-0 text-white/40 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        )}

        {isChannelGate ? (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              openChannel();
            }}
            aria-label="Открыть канал"
            className="flex-center -my-0.5 shrink-0 rounded-lg px-1 py-0.5 text-gold active:scale-95"
          >
            <ArrowUpRight size={15} />
          </button>
        ) : (
          step.href && (
            <Link
              href={step.href}
              onClick={e => e.stopPropagation()}
              aria-label="Перейти"
              className="flex-center -my-0.5 shrink-0 rounded-lg px-1 py-0.5 text-electric-pink active:scale-95"
            >
              <ArrowUpRight size={15} />
            </Link>
          )
        )}
      </div>

      {expandable && open && (
        <div className="flex flex-col gap-1 pb-2 pl-[42px] pr-3 animate-fade-in">
          {step.detail && (
            <p className="text-[11px] leading-snug text-white-secondary">{step.detail}</p>
          )}
          {step.subSteps?.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-white/75">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-electric-pink/70" />
              <span className="leading-snug">{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
