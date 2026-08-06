'use client';

import { ChevronRight, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type NewStakeLimitNoticeTone = 'info' | 'blocked';

export interface NewStakeLimitNoticeProps {
  /** What the limit is, in one line ("Your tier caps a stake at 249,999 LC"). */
  title: string;
  /** Why it exists and what moves it ("Level 4 needs Platinum · Need 3 friends"). */
  detail: string;
  /** `blocked` is the "you are pressing against it right now" state. */
  tone?: NewStakeLimitNoticeTone;
  /** Opens the gate explainer. Without it the notice is a dead-end statement. */
  onClick?: () => void;
  className?: string;
}

const toneClasses: Record<NewStakeLimitNoticeTone, string> = {
  info: 'border-white/12 bg-white/[0.04]',
  blocked: 'border-error/45 bg-error/12',
};

const toneTitleClasses: Record<NewStakeLimitNoticeTone, string> = {
  info: 'text-white',
  blocked: 'text-error-text',
};

/**
 * The stake ceiling, stated where the player sets the amount.
 *
 * It used to be stated nowhere: the slider ran to the full balance, the hero
 * and the rewards preview quoted a locked level as if it were on offer, and
 * the only refusal was a washed-out "Locked" button two scrolls below. Players
 * read that as a broken button, not as a requirement.
 */
export function NewStakeLimitNotice({
  title,
  detail,
  tone = 'info',
  onClick,
  className,
}: NewStakeLimitNoticeProps) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={twMerge(
        'flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors',
        toneClasses[tone],
        onClick && 'hover:bg-white/[0.07] active:scale-[0.99]',
        className
      )}
    >
      <Lock
        size={13}
        strokeWidth={2.6}
        className={twMerge('shrink-0', tone === 'blocked' ? 'text-error-text' : 'text-white/45')}
      />
      <span className="min-w-0 flex-1 leading-tight">
        <span
          className={twMerge(
            'block text-[11px] font-extrabold tabular-nums',
            toneTitleClasses[tone]
          )}
        >
          {title}
        </span>
        <span className="text-white-secondary mt-0.5 block text-[10px] font-semibold">
          {detail}
        </span>
      </span>
      {onClick && <ChevronRight size={13} strokeWidth={2.6} className="shrink-0 text-white/35" />}
    </Tag>
  );
}
