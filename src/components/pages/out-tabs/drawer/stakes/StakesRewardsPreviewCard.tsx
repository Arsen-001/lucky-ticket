'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import type { LucideProps } from 'lucide-react';
import { Coins, Crown, Sparkles, Star, Zap } from 'lucide-react';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { StakesTicketStack } from '@/components/pages/out-tabs/drawer/stakes/StakesTicketStack';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';
import type { ComponentType } from 'react';

const tierLabel: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};

interface BonusVisual {
  Icon: ComponentType<LucideProps>;
  className: string;
}

function pickBonusVisual(label: string): BonusVisual {
  const lc = /lc|coin/i.test(label);
  const badge = /badge/i.test(label);
  const capacity = /capacity/i.test(label);
  if (lc) return { Icon: Coins, className: 'text-gold border-gold/40 bg-gold/15' };
  if (badge) return { Icon: Crown, className: 'text-pink border-pink/40 bg-pink/15' };
  if (capacity) return { Icon: Sparkles, className: 'text-gold border-gold/40 bg-gold/15' };
  return {
    Icon: Zap,
    className: 'text-electric-purple border-electric-purple/40 bg-electric-purple/15',
  };
}

export interface StakesRewardsPreviewCardProps {
  levelDef: StakeLevelDefinition;
  mode?: 'preview' | 'granted';
}

export function StakesRewardsPreviewCard({
  levelDef,
  mode = 'preview',
}: StakesRewardsPreviewCardProps) {
  const t = useAppTranslations();

  return (
    <div
      className="stake-card-shell stake-card-border p-3.5"
      style={{ ['--stake-card-accent' as string]: `var(--color-${levelDef.guaranteedTicket})` }}
    >
      <div className="relative flex flex-col gap-3">
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <span className="rounded-full border border-success/40 bg-success/15 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-success">
              {t('guaranteed')}
            </span>
            <span className="text-white-secondary text-[11px] font-semibold">
              {t('{count} tickets', { count: levelDef.allTickets.length })}
            </span>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 p-3">
            <StakesTicketStack tiers={levelDef.allTickets} size={36} />
            <div className="text-white-secondary flex-1 text-[11px] leading-snug">
              {levelDef.allTickets.map(tier => t(tierLabel[tier])).join(' · ')}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <span className="border-electric-purple/40 bg-electric-purple/20 text-electric-purple rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
              {mode === 'granted' ? t('bonus prizes') : t('bonus draw')}
            </span>
            <span className="text-white-secondary text-[11px] font-semibold">
              {mode === 'granted' ? t('won') : t('chance at extras')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {levelDef.bonusPrizes.map(bonus => {
              const { Icon, className } = pickBonusVisual(bonus);
              return (
                <div
                  key={bonus}
                  className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/30 px-2.5 py-2"
                >
                  <div
                    className={`flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg border ${className}`}
                  >
                    <Icon size={14} />
                  </div>
                  <span className="min-w-0 truncate text-[11px] font-bold text-white">{bonus}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-gold/25 bg-gold/5 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-gold/15">
            <Image src={icons.telegramStar} alt="" className="h-4.5 w-auto" />
          </div>
          <div className="flex-1">
            <div className="text-gold flex items-center gap-1 text-[12px] font-bold">
              <Star size={12} fill="currentColor" strokeWidth={0} />
              {t('Telegram Stars draw')}
            </div>
            <div className="text-white-secondary mt-0.5 text-[10px]">
              {t('{percent}% chance · {min}–{max} stars if won', {
                percent: levelDef.starsChance,
                min: levelDef.starsMin,
                max: levelDef.starsMax,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
