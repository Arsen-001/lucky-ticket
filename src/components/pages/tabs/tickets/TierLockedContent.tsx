'use client';

import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useGetMeQuery } from '@/api/me.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { TierGateChecklist } from '@/components/shared/tier/TierGateChecklist';
import { routes } from '@/constants/routes';
import { icons } from '@/constants/icons';
import { tierNameId, tierTicketDescriptionId } from '@/constants/tier-names';
import type { Ticket as TicketModel } from '@/types/types/ticket.types';

export interface TierLockedContentProps {
  ticket: TicketModel;
  className?: string;
}

export function TierLockedContent({ ticket, className }: TierLockedContentProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const tierColor = `var(--color-${ticket.ticketType})`;
  const referralsRequired = GlobalConstants.tierReferralRequirements[ticket.ticketType];
  const currentAp = me?.activityPoints ?? 0;
  const currentRefs = me?.referralsCount ?? 0;

  return (
    <div className={twMerge('flex flex-col gap-3', className)}>
      <div
        className="card-outlined rounded-2xl p-4.5 relative overflow-hidden"
        style={{
          background: `radial-gradient(circle at 100% 0%, color-mix(in srgb, ${tierColor} 28%, transparent) 0%, transparent 55%), var(--gradient-purple-reverse)`,
        }}
      >
        <div className="flex items-start gap-4 relative">
          <div className="relative shrink-0">
            <Ticket type={ticket.ticketType} width={120} height={120} />
            <Image
              src={icons.lock}
              alt=""
              height={22}
              width={22}
              className="absolute bottom-1 end-1"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full text-pink-secondary bg-pink-secondary/18 border border-pink-secondary/40">
              {t('locked')}
            </span>
            <h2 className="mt-1.5 text-xl font-extrabold text-white tracking-tight leading-tight">
              {t('{tier} ticket', { tier: t(tierNameId[ticket.ticketType]) })}
            </h2>
            <div className="mt-1.5 text-[11px] text-white-secondary leading-snug">
              {t(tierTicketDescriptionId[ticket.ticketType])}
            </div>
          </div>
        </div>
      </div>

      <div className="card-outlined bg-purple-gradient flex flex-col gap-2.5 rounded-2xl p-4">
        <span className="text-pink-secondary text-[11px] font-extrabold uppercase tracking-wider">
          {t('unlock requirement')}
        </span>
        <p className="text-white-secondary text-[12px] leading-snug">
          {t('reach {tier} tier', { tier: t(tierNameId[ticket.ticketType]) })}
        </p>
        <TierGateChecklist
          tier={ticket.ticketType}
          activityPoints={currentAp}
          referralsCount={currentRefs}
        />

        {currentRefs < referralsRequired && (
          <Link
            href={routes.inviteFriends}
            className="text-pink self-start text-[11px] font-bold underline underline-offset-2"
          >
            {t('invite friends')}
          </Link>
        )}
      </div>
    </div>
  );
}
