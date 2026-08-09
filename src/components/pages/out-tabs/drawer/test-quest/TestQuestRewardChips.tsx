import type { LucideIcon } from 'lucide-react';
import { Coins, Gift, Sparkles, Star, Ticket, Timer, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { TicketRewardIcon } from '@/components/shared/icons/TicketRewardIcon';
import { parseRewardChips, type RewardChipKind } from '@/utils/pages/testQuest.utils';

export interface TestQuestRewardChipsProps {
  /** Reward label, e.g. "500k LC · 10 билетов · LP 3д · 10 LS". */
  label: string;
  /** Crown levels tint every chip gold to sell the top-of-ladder prize. */
  crown?: boolean;
  className?: string;
}

const CHIP_STYLE: Record<RewardChipKind, { Icon: LucideIcon; tint: string }> = {
  lc: { Icon: Coins, tint: 'bg-gold/15 text-gold' },
  ticket: { Icon: Ticket, tint: 'bg-teal/20 text-teal' },
  star: { Icon: Star, tint: 'bg-electric-purple/20 text-electric-purple' },
  ap: { Icon: TrendingUp, tint: 'bg-pink/20 text-pink' },
  lp: { Icon: Timer, tint: 'bg-electric-pink/15 text-electric-pink' },
  engine: { Icon: Sparkles, tint: 'bg-diamond/20 text-diamond' },
  other: { Icon: Gift, tint: 'bg-white/10 text-white/70' },
};

const GOLD_TINT = 'bg-gold/15 text-gold';

/**
 * The level reward as iconified chips instead of a run-on string — one chip per
 * drop token (coins · tickets · Lucky Stars · LP · AP · engine). The icon carries
 * the meaning, so the reward reads at a glance regardless of shell locale.
 */
export function TestQuestRewardChips({ label, crown, className }: TestQuestRewardChipsProps) {
  const chips = parseRewardChips(label);
  if (!chips.length) return null;

  return (
    <div className={twMerge('flex flex-wrap gap-1', className)}>
      {chips.map((chip, i) => {
        const { Icon, tint } = CHIP_STYLE[chip.kind];
        return (
          <span
            key={i}
            className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-white/[0.03] py-1 pl-1 pr-2 text-[12.5px] font-semibold tabular-nums text-white"
          >
            {chip.kind === 'ticket' ? (
              // Every Test-Quest level credits its tickets to Bronze
              // (`test-quest.service`), so the chip can show that exact ticket.
              <span className="flex-center h-[19px] w-[26px]">
                <TicketRewardIcon tier="bronze" size={13} />
              </span>
            ) : (
              <span
                className={twMerge(
                  'flex-center h-[19px] w-[19px] rounded-md',
                  crown ? GOLD_TINT : tint
                )}
              >
                <Icon size={12} />
              </span>
            )}
            {chip.text}
          </span>
        );
      })}
    </div>
  );
}
