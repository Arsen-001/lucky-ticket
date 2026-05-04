'use client';

import '@/styles/components/stakes.css';
import Image from 'next/image';
import type { ComponentType, ReactNode } from 'react';
import { useMemo } from 'react';
import type { LucideProps } from 'lucide-react';
import { ArrowRight, Check, Crown, RotateCcw, Sparkles, Star, Zap } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Ticket } from '@/components/shared/icons/Ticket';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { StakesTicketStack } from '@/components/pages/out-tabs/drawer/stakes/StakesTicketStack';
import type { ActiveStake, StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';

interface RolledRewards {
  bonusLC: number;
  boost: boolean;
  capacity: boolean;
  badge: boolean;
  stars: number;
}

function rollRewards(level: number): RolledRewards {
  const r = Math.random();
  return {
    bonusLC: 20 * level * (5 + Math.round(r * 5)),
    boost: level >= 2,
    capacity: level >= 3,
    badge: level >= 3,
    stars: level >= 3 ? 25 * level : r < 0.25 ? 10 : 0,
  };
}

interface PrizeRowProps {
  icon: ReactNode;
  label: string;
  sub: string;
  accentClass: string;
  delayMs?: number;
}

function PrizeRow({ icon, label, sub, accentClass, delayMs = 0 }: PrizeRowProps) {
  return (
    <div
      className="stake-card-shell stake-card-border animate-fade-in flex items-center gap-3 p-3"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${accentClass}`}
      >
        {icon}
      </div>
      <div className="relative min-w-0 flex-1">
        <div className="text-[13px] font-extrabold text-white">{label}</div>
        <div className="text-pink-secondary mt-0.5 text-[11px]">{sub}</div>
      </div>
      <Check size={16} className="text-success relative" strokeWidth={2.4} />
    </div>
  );
}

const tierLabelKey: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};

interface PrizeIconProps {
  Icon: ComponentType<LucideProps>;
  size?: number;
}

function LucideIcon({ Icon, size = 20 }: PrizeIconProps) {
  return <Icon size={size} />;
}

export interface StakesClaimRewardsModalProps {
  open: boolean;
  onClose: () => void;
  levelDef: StakeLevelDefinition;
  stake: ActiveStake;
}

export function StakesClaimRewardsModal({
  open,
  onClose,
  levelDef,
  stake,
}: StakesClaimRewardsModalProps) {
  const t = useAppTranslations();
  const rolled = useMemo<RolledRewards>(
    () =>
      open
        ? rollRewards(levelDef.level)
        : { bonusLC: 0, boost: false, capacity: false, badge: false, stars: 0 },
    [open, levelDef.level]
  );

  return (
    <Modal open={open} onClose={onClose} hideCloseButton>
      <div className="stake-card-shell stake-card-border flex flex-col gap-4 px-5 py-5">
        <div className="text-center">
          <div className="border-success/35 bg-success/15 text-success inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest">
            <span className="bg-success h-1.5 w-1.5 rounded-full shadow-[0_0_8px_var(--color-success)]" />
            {t('stake complete')}
          </div>
          <h2 className="mt-3 text-[24px] font-extrabold leading-tight tracking-tight text-white">
            {t('you won')}{' '}
            <GoldenText className="text-[24px] font-extrabold">
              {t('{count} tickets', { count: levelDef.allTickets.length })}
            </GoldenText>
          </h2>
          <div className="text-white-secondary mt-1 text-[12px]">
            {t('+ bonuses from level {level} draw', { level: levelDef.level })}
          </div>

          <div className="stakes-pulse-halo mt-4 flex items-center justify-center py-4">
            <StakesTicketStack tiers={levelDef.allTickets} size={56} />
          </div>
        </div>

        <div className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider">
          {t('your prizes')}
        </div>

        <div className="flex flex-col gap-2">
          {levelDef.allTickets.map((tier, i) => (
            <PrizeRow
              key={tier}
              icon={<Ticket type={tier} width={24} height={24} />}
              label={t('{tier} ticket', { tier: t(tierLabelKey[tier]) })}
              sub={t('guaranteed reward')}
              accentClass={`text-${tier === 'gold' ? 'gold' : tier} border-current/40 bg-current/15`}
              delayMs={i * 80}
            />
          ))}
          {rolled.bonusLC > 0 && (
            <PrizeRow
              icon={<Image src={icons.coin} alt="" className="h-5 w-auto" />}
              label={t('+{amount} {coin} bonus', {
                amount: rolled.bonusLC.toLocaleString(),
                coin: GlobalConstants.coinName,
              })}
              sub={t('from the bonus draw')}
              accentClass="text-gold border-gold/40 bg-gold/15"
              delayMs={(levelDef.allTickets.length + 1) * 80}
            />
          )}
          {rolled.boost && (
            <PrizeRow
              icon={<LucideIcon Icon={Zap} />}
              label={t('engine speed boost')}
              sub={t('apply to any owned engine')}
              accentClass="text-electric-purple border-electric-purple/40 bg-electric-purple/15"
              delayMs={(levelDef.allTickets.length + 2) * 80}
            />
          )}
          {rolled.capacity && (
            <PrizeRow
              icon={<LucideIcon Icon={Sparkles} />}
              label={t('engine capacity upgrade')}
              sub={t('apply to any owned engine')}
              accentClass="text-electric-purple border-electric-purple/40 bg-electric-purple/15"
              delayMs={(levelDef.allTickets.length + 3) * 80}
            />
          )}
          {rolled.badge && (
            <PrizeRow
              icon={<LucideIcon Icon={Crown} />}
              label={levelDef.level === 5 ? t('exclusive badge') : t('badge')}
              sub={t('added to your profile')}
              accentClass="text-pink border-pink/40 bg-pink/15"
              delayMs={(levelDef.allTickets.length + 4) * 80}
            />
          )}
          {rolled.stars > 0 && (
            <PrizeRow
              icon={<LucideIcon Icon={Star} />}
              label={t('+{count} telegram stars', { count: rolled.stars })}
              sub={t('sent to your telegram')}
              accentClass="text-gold border-gold/40 bg-gold/15"
              delayMs={(levelDef.allTickets.length + 5) * 80}
            />
          )}
        </div>

        <div className="border-success/25 bg-success/5 flex items-center gap-2.5 rounded-xl border px-3 py-3">
          <div className="border-success/35 bg-success/15 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
            <RotateCcw size={16} className="text-success" strokeWidth={2.4} />
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-bold text-white">
              {t('your stake returned', {
                amount: stake.lockedAmount.toLocaleString(),
                coin: GlobalConstants.coinName,
              })}
            </div>
            <div className="text-white-secondary mt-0.5 text-[10px]">
              {t('available immediately on claim')}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="stakes-btn-glow mt-1 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-[14px] font-extrabold uppercase tracking-wider text-white shadow-[0_10px_28px_rgba(222,0,155,0.45),inset_0_1px_0_rgba(255,255,255,0.25)]"
          style={{ background: 'linear-gradient(135deg, #DE009B 0%, #743DF5 100%)' }}
        >
          <span>{t('claim all rewards')}</span>
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </Modal>
  );
}
