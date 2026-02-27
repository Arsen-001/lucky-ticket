'use client';

import { useGetTicketByIdQuery } from '@/api/tickets.api';
import { Ticket } from '@/components/shared/icons/Ticket';
import type { HTMLAttributes } from 'react';
import { useState } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import type { MessageIds } from '@/types/types/i18n.types';
import type { TicketType } from '@/types/types/ticket.types';
import { getTicketPerTimeUnit } from '@/utils/global/units.utils';
import { Progress } from '@/components/shared/Progress';
import { useCountDown } from '@/hooks/useCountDown';
import Image from 'next/image';
import { icons } from '@/constants/icons';
import { TicketSendModal } from './TicketSendModal';
import { useRouter } from 'next/navigation';
import { routes } from '@/constants/routes';

interface TicketInfoProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function TicketInfo({ id, className, ...rest }: TicketInfoProps) {
  const { data, isLoading } = useGetTicketByIdQuery(id);
  const t = useAppTranslations();
  const router = useRouter();

  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  const blocked = data?.blocked;
  const claimCountDown = useCountDown(data?.claimDate);
  const autocollectFinishCountDown = useCountDown(data?.autocollectFinishDate);
  const speedUnit = getTicketPerTimeUnit(t);

  const titleIdByType: Record<TicketType, MessageIds> = {
    bronze: 'bronze',
    silver: 'silver',
    gold: 'golden',
    platinum: 'platinum',
    diamond: 'diamond',
  };

  const handleClaim = (e: React.MouseEvent) => {
    e.preventDefault();
    // Existing claim logic
  };

  const handleBuy = () => {
    router.push(routes.market('tickets'));
  };

  const handleSend = () => {
    setIsSendModalOpen(true);
  };

  return (
    <div className={twMerge('max-w-full overflow-hidden', className)} {...rest}>
      <div className="flex justify-between items-center gap-3">
        <div className="flex-center bg-white/5 rounded-2xl p-4 min-w-[140px] h-[140px]">
          <Ticket type={data?.ticketType || 'bronze'} loading={isLoading} width={100} height={60} />
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <SkeletonSuspense
            loading={isLoading}
            skeleton={<Skeleton variant="line" textSize="lg" className="w-24" />}
          >
            <h2 className="text-xl font-bold uppercase">
              {t(titleIdByType[data?.ticketType || 'bronze'])}
            </h2>
          </SkeletonSuspense>

          {!blocked && data && (
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-pink-secondary">{t('speed')}</span>
                <GoldenText>
                  {data.speed} {speedUnit}
                </GoldenText>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-secondary">{t('max time')}</span>
                <GoldenText>
                  {data.maxTime?.hours} {t('hour')[0]} {data.maxTime?.minutes} {t('minute')[0]}
                </GoldenText>
              </div>
              <div className="mt-2">
                <Progress
                  className="h-4 flex items-center"
                  percentage={autocollectFinishCountDown.getPassedPercentage(data.maxTime)}
                >
                  {autocollectFinishCountDown.leftTimeText}
                </Progress>
              </div>
            </div>
          )}

          {blocked && data && (
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-pink-secondary">{t('speed')}</span>
                <GoldenText>
                  {data.speed || 0} {speedUnit}
                </GoldenText>
              </div>
              <div className="flex justify-between">
                <span className="text-pink-secondary">{t('max time')}</span>
                <GoldenText>
                  {data.maxTime?.hours || 0} {t('hour')[0]} {data.maxTime?.minutes || 0}{' '}
                  {t('minute')[0]}
                </GoldenText>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-xs text-pink-secondary truncate">
                  {t('complete all requirements')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {blocked && data?.requirements && (
        <div className="mt-6 flex flex-col gap-3">
          {data.requirements.map((req, index) => {
            const percentage = Math.min(100, (req.actualCount / req.totalCount) * 100);
            let requirementTitle = '';

            if (req.requirementType === 'collect' && req.type) {
              requirementTitle = t('collect {ticketName} tickets', {
                ticketName: t(titleIdByType[req.type as TicketType] || (req.type as string)),
              });
            } else if (req.requirementType === 'join' && req.type) {
              requirementTitle = t('join {tournamentName} tournament', {
                tournamentName: req.type,
              });
            } else if (req.requirementType === 'invite') {
              requirementTitle = t('invite friends');
            } else if (req.requirementType === 'activity') {
              requirementTitle = t('daily activity {days} days', {
                days: req.totalCount,
              });
            } else if (req.requirementType === 'task') {
              requirementTitle = t('complete {count} tasks', {
                count: req.totalCount,
              });
            }

            return (
              <div key={index} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white">{requirementTitle}</span>
                  <span className="text-pink-secondary">
                    {req.actualCount}/{req.totalCount}
                  </span>
                </div>
                <Progress percentage={percentage} className="h-3" />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="card" className="h-12" />}
        >
          {blocked ? (
            <div className="flex-center gap-2 bg-white/5 rounded-xl p-4">
              <Image height={24} src={icons.lock} alt="lock" />
              <span className="text-sm font-medium uppercase tracking-wider">
                {t('coming soon')}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleClaim}
                disabled={!claimCountDown?.expired}
                className="w-full py-4 text-base"
              >
                {claimCountDown.expired ? t('claim') : claimCountDown.leftTimeText}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleBuy} variant="secondary" className="py-3 text-sm">
                  {t('shop')}
                </Button>
                <Button onClick={handleSend} variant="purpleGradient" className="py-3 text-sm">
                  {t('send')}
                </Button>
              </div>
            </div>
          )}
        </SkeletonSuspense>
      </div>

      {data && (
        <TicketSendModal
          open={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          ticketType={data.ticketType}
        />
      )}
    </div>
  );
}
