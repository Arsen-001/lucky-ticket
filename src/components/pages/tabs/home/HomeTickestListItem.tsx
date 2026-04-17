'use client';
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
  return (
    <div
      className={twMerge(
        'bg-purple-gradient rounded-lg flex items-center p-3 overflow-hidden',
        loading || !blocked ? 'gap-2' : 'gap-3 max-w-full',
        className
      )}
    >
      <>
        <Ticket {...ticketImageProps} />

        <div className="flex-available flex flex-col gap-2  overflow-hidden">
          <SkeletonSuspense loading={loading} skeleton={<Skeleton className="h-5.5 w-9/12" />}>
            <div className="flex items-center gap-3">
              <div className="text-base h-5 text-white font-semibold">{titleId && t(titleId)}</div>
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
              <>
                <Progress
                  className="h-3.5 flex items-center"
                  classNames={{ children: 'absolute bottom-0 h-full right-3 pt-0.5' }}
                  percentage={percentage}
                >
                  {autocollectFinishCountDown.leftTimeText}
                </Progress>
              </>
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
              {claimCountDown.expired ? t('claim') : claimCountDown.leftTimeText}
            </Button>
          ) : (
            <Image className="mr-0" height={32} src={icons.lock} alt="lock" />
          )}
        </SkeletonSuspense>
      </>
    </div>
  );
}
