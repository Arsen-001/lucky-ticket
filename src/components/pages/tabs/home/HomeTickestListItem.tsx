'use client';
import { useState } from 'react';
import type { Ticket as TicketDataType, TicketType } from '@/types/types/ticket.types';
import { twMerge } from 'tailwind-merge';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { Ticket } from '@/components/shared/icons/Ticket';
import { Button } from '@/components/shared/buttons/Button';
import { useCountDown } from '@/hooks/useCountDown';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import { Progress } from '@/components/shared/Progress';
import Image from 'next/image';
import { icons } from '@/constants/icons';
import { CollectBadge } from '@/components/shared/badges/CollectBadge';
import { SpeedBadge } from '@/components/shared/badges/SpeedBadge';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { HomeTicketRequirementsModal } from '@/components/pages/tabs/home/HomeTicketRequirementsModal';

export type HomeTickestListItemProps = TicketDataType & ClassNameProps & { loading?: boolean };

export function HomeTickestListItem({
  ticketType,
  className,
  loading,
  blocked,
  isTimeBoosted,
  isCollectionBoosted,
  ...rest
}: HomeTickestListItemProps) {
  const t = useAppTranslations();
  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const claimCountDown = useCountDown(rest?.claimDate);
  const autocollectFinishCountDown = useCountDown(rest?.autocollectFinishDate);

  const titleIdByType: Record<TicketType, MessageIds> = {
    bronze: 'bronze',
    silver: 'silver',
    gold: 'golden',
    platinum: 'platinum',
    diamond: 'diamond',
  };

  const ticketImageProps = {
    type: ticketType,
    loading,
    width: 70,
    height: 42,
  };

  const percentage =
    !loading && !blocked ? autocollectFinishCountDown.getPassedPercentage(rest.maxTime) : 0;
  const titleId = titleIdByType?.[ticketType];

  const handleClaim = e => {
    e.preventDefault();
  };

  const claimLabel = claimCountDown.expired
    ? rest.count
      ? `${t('claim')} ${rest.count}`
      : t('claim')
    : claimCountDown.leftTimeText;

  return (
    <>
      <div
        onClick={blocked && !loading ? () => setRequirementsOpen(true) : undefined}
        className={twMerge(
          'bg-purple-gradient rounded-lg flex items-center p-3 overflow-hidden',
          loading || !blocked ? 'gap-2' : 'gap-3 max-w-full',
          blocked && !loading && 'cursor-pointer active:opacity-80 transition-opacity',
          className
        )}
      >
        <Ticket {...ticketImageProps} />

        <div className="flex-available flex flex-col gap-2 overflow-hidden">
          <SkeletonSuspense loading={loading} skeleton={<Skeleton className="h-5.5 w-9/12" />}>
            <div className="flex items-center gap-1">
              <div className="text-base h-5 text-white font-semibold">{titleId && t(titleId)}</div>
              {!blocked && !!rest.count && (
                <span className="flex items-center gap-0.5 bg-white/8 rounded-full px-1.5 py-0.5 text-xs font-semibold text-white/80">
                  {rest.count}
                </span>
              )}
              <div className="flex items-center gap-1">
                {isTimeBoosted && <SpeedBadge hideText />}
                {isCollectionBoosted && <CollectBadge hideText />}
              </div>
            </div>
          </SkeletonSuspense>
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton className="h-3.5 rounded-full" />}
          >
            {!blocked ? (
              <Progress
                className="h-3.5 flex items-center"
                classNames={{ children: 'absolute bottom-0 h-full right-3 pt-0.5' }}
                percentage={percentage}
              >
                {autocollectFinishCountDown.leftTimeText}
              </Progress>
            ) : (
              <div className="w-full text-pink-secondary text-sm leading-none font-normal line-clamp-2">
                {t('complete all requirements')}
              </div>
            )}
          </SkeletonSuspense>
        </div>

        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="card" className="h-8 w-22.5" />}
        >
          {!blocked ? (
            <Button
              onClick={handleClaim}
              disabled={!claimCountDown?.expired}
              className="p-2 min-w-22.5 text-xs"
            >
              {claimLabel}
            </Button>
          ) : (
            <Image className="mr-0" height={32} src={icons.lock} alt="lock" />
          )}
        </SkeletonSuspense>
      </div>

      {blocked && !loading && (
        <HomeTicketRequirementsModal
          open={requirementsOpen}
          onClose={() => setRequirementsOpen(false)}
          ticketType={ticketType}
          requirements={rest.requirements}
        />
      )}
    </>
  );
}
