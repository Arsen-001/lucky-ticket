'use client';

import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useGetMeQuery } from '@/api/me.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import { icons } from '@/constants/icons';
import { tierNameId } from '@/constants/tier-names';
import type { Ticket as TicketModel, TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';

const descriptionIdByType: Record<TicketType, MessageIds> = {
  bronze: 'bronze ticket description',
  silver: 'silver ticket description',
  gold: 'golden ticket description',
  platinum: 'platinum ticket description',
  diamond: 'diamond ticket description',
};

export interface TierLockedContentProps {
  ticket: TicketModel;
  className?: string;
}

export function TierLockedContent({ ticket, className }: TierLockedContentProps) {
  const t = useAppTranslations();
  const { data: me } = useGetMeQuery();
  const tierColor = `var(--color-${ticket.ticketType})`;
  const threshold = GlobalConstants.apTierThresholds[ticket.ticketType];
  const referralsRequired = GlobalConstants.tierReferralRequirements[ticket.ticketType];
  const currentAp = me?.activityPoints ?? 0;
  const currentRefs = me?.referralsCount ?? 0;
  const progressPct =
    threshold > 0 ? Math.min(100, Math.round((currentAp / threshold) * 100)) : 100;
  const referralProgressPct =
    referralsRequired > 0
      ? Math.min(100, Math.round((currentRefs / referralsRequired) * 100))
      : 100;

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
              className="absolute bottom-1 right-1"
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
              {t(descriptionIdByType[ticket.ticketType])}
            </div>
          </div>
        </div>
      </div>

      <div className="card-outlined bg-purple-gradient flex flex-col gap-2.5 rounded-2xl p-4">
        <span className="text-pink-secondary text-[11px] font-extrabold uppercase tracking-wider">
          {t('unlock requirement')}
        </span>
        <p className="text-white-secondary text-[12px] leading-snug">
          {t('reach {tier} tier with {ap} ap', {
            tier: t(tierNameId[ticket.ticketType]),
            ap: threshold.toLocaleString(),
          })}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${progressPct}%`, background: tierColor }}
          />
        </div>
        <span className="text-[11px] font-semibold tabular-nums text-white/55">
          {currentAp.toLocaleString()} / {threshold.toLocaleString()} {t('ap')}
        </span>

        {referralsRequired > 0 && (
          <>
            <p className="text-white-secondary text-[12px] leading-snug">
              {t('and invite {n} friends', { n: referralsRequired })}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${referralProgressPct}%`, background: tierColor }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tabular-nums text-white/55">
                {currentRefs.toLocaleString()} / {referralsRequired.toLocaleString()} {t('friends')}
              </span>
              {currentRefs < referralsRequired && (
                <Link
                  href={routes.inviteFriends}
                  className="text-pink text-[11px] font-bold underline underline-offset-2"
                >
                  {t('invite friends')}
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
