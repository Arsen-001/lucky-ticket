'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { Award, Check, ListChecks, Trophy, UserPlus, Wallet } from 'lucide-react';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Progress } from '@/components/shared/Progress';
import type { TicketRequirement } from '@/types/interfaces/ticket.interfaces';
import type { TicketRequirementType, TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';
import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

const titleIdByType: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};

const requirementIcon: Record<TicketRequirementType, ComponentType<LucideProps>> = {
  collect: Wallet,
  invite: UserPlus,
  join: Trophy,
  task: ListChecks,
  activity: Award,
};

const requirementLabelId: Record<TicketRequirementType, MessageIds> = {
  collect: 'collect {ticketName} tickets',
  invite: 'invite {count} friends',
  join: 'join {tournamentName} tournament',
  task: 'complete {count} tasks',
  activity: 'daily activity {days} days',
};

export interface TicketDetailsRequirementsProps {
  ticketType: TicketType;
  requirements?: TicketRequirement[];
  className?: string;
}

export function TicketDetailsRequirements({
  ticketType,
  requirements,
  className,
}: TicketDetailsRequirementsProps) {
  const t = useAppTranslations();

  if (!requirements?.length) return null;

  return (
    <div className={twMerge('card-outlined bg-purple-gradient rounded-2xl p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Image src={icons.lock} alt="" height={20} width={20} />
        <div>
          <div className="text-sm font-extrabold text-white">
            {t('unlock {tier} engine', { tier: t(titleIdByType[ticketType]) })}
          </div>
          <div className="text-[11px] text-pink-secondary">{t('complete to start producing')}</div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {requirements.map((requirement, index) => (
          <RequirementRow key={index} requirement={requirement} />
        ))}
      </div>
    </div>
  );
}

function RequirementRow({ requirement }: { requirement: TicketRequirement }) {
  const t = useAppTranslations();
  const total = Math.max(1, requirement.totalCount);
  const have = Math.max(0, requirement.actualCount);
  const pct = Math.min(100, Math.round((have / total) * 100));
  const done = have >= total;
  const Icon = requirementIcon[requirement.requirementType] ?? Award;

  const label = (() => {
    if (requirement.title) return requirement.title;
    const key = requirementLabelId[requirement.requirementType];
    if (requirement.requirementType === 'collect') {
      return t(key, {
        ticketName: t(titleIdByType[(requirement.type as TicketType) ?? 'bronze']),
      });
    }
    if (requirement.requirementType === 'join') {
      return t(key, {
        tournamentName: t(titleIdByType[(requirement.type as TicketType) ?? 'bronze']),
      });
    }
    if (requirement.requirementType === 'invite' || requirement.requirementType === 'task') {
      return t(key, { count: total });
    }
    if (requirement.requirementType === 'activity') {
      return t(key, { days: total });
    }
    return t(key, { count: total });
  })();

  return (
    <div className="flex items-center gap-2.5 p-2.5 px-3 rounded-xl bg-black/25 border border-white/4">
      <div
        className={twMerge(
          'w-8 h-8 rounded-xl flex-center shrink-0',
          done
            ? 'bg-success/15 border border-success/35 text-success'
            : 'bg-electric-purple/15 border border-electric-purple/30 text-pink'
        )}
      >
        {done ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-white font-semibold truncate">{label}</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex-1">
            <Progress
              percentage={pct}
              className="h-1"
              classNames={{ bar: done ? 'bg-success!' : '' }}
            />
          </div>
          <span
            className={twMerge(
              'text-[11px] font-bold tabular-nums',
              done ? 'text-success' : 'text-white-secondary'
            )}
          >
            {have}/{total}
          </span>
        </div>
      </div>
    </div>
  );
}
