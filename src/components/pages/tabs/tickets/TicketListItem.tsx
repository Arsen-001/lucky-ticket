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
import { GoldenText } from '@/components/shared/typography/GoldenText';
import Image from 'next/image';
import { icons } from '@/constants/icons';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { getTicketPerTimeUnit } from '@/utils/global/units.utils';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';

export type TicketListItemProps = TicketDataType & ClassNameProps & { loading?: boolean };

export function TicketListItem({
  id,
  ticketType,
  className,
  loading,
  blocked,
  ...rest
}: TicketListItemProps) {
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
    width: 70,
    height: 42,
  };

  if (loading) {
    return (
      <div
        className={twMerge(
          'bg-purple-gradient rounded-lg flex items-center gap-2 p-2 overflow-hidden',
          className
        )}
      >
        <Ticket loading {...ticketImageProps} />
        <div className="flex flex-col flex-1 gap-2">
          <div className="flex flex-col-stretch gap-1 overflow-hidden">
            <Skeleton className="w-20" variant={'line'} textSize="sm" />
            <div className="flex gap-x-1.5 gap-y-px flex-wrap">
              <Skeleton variant={'line'} className="h-4 w-18 " />
              <Skeleton variant={'line'} className="h-4 w-24 " />
            </div>
            <Skeleton variant={'line'} className="h-3 " />
          </div>
        </div>
        <Skeleton variant="card" className="h-8 w-22.5" />
      </div>
    );
  }

  const renderContent = () => {
    if (!blocked) {
      const speedUnit = getTicketPerTimeUnit(t);
      const percentage = autocollectFinishCountDown.getPassedPercentage(rest.maxTime);
      return (
        <>
          <Ticket {...ticketImageProps} />
          <div className="flex flex-col flex-1 gap-1 overflow-hidden">
            <span className="text-sm font-semibold">{t(titleIdByType[ticketType])}</span>
            <div className="flex gap-1.5 gap-y-px text-xs text-pink-secondary whitespace-nowrap flex-wrap">
              <div className="flex-center gap-0.5 overflow-hidden">
                <span className="flex-1 truncate">{t('speed')}:</span>
                <GoldenText>
                  {rest?.speed} {speedUnit}
                </GoldenText>
              </div>
              <div className="flex-center gap-0.5 overflow-hidden">
                <span className="flex-1 truncate">{t('max time')}:</span>
                <GoldenText>
                  {rest?.maxTime?.hours} {t('hour')[0]} {rest?.maxTime?.minutes} {t('minute')[0]}
                </GoldenText>
              </div>
            </div>
            <Progress
              className="h-3 flex items-center"
              classNames={{ children: 'absolute bottom-0 h-full right-3 pt-px' }}
              percentage={percentage}
            >
              {autocollectFinishCountDown.leftTimeText}
            </Progress>
          </div>
          <Button disabled={!claimCountDown?.expired} className="p-2 min-w-22.5 text-xs">
            {claimCountDown.expired ? t('claim') : claimCountDown.leftTimeText}
          </Button>
        </>
      );
    }

    return (
      <>
        <Ticket {...ticketImageProps} />
        <div className="flex flex-col flex-[1_1_0] gap-1 whitespace-nowrap overflow-hidden">
          <div className="text-sm text-white font-semibold">{t(titleIdByType[ticketType])}</div>
          <div className="w-full text-pink-secondary text-xs gap-px overflow-hidden">
            <span className="block leading-none w-full truncate">
              {t('complete all requirements')}
            </span>
          </div>
        </div>
        <Image className="mr-5" height={32} src={icons.lock} alt="lock" />
      </>
    );
  };

  return (
    <Link
      href={routes.tournaments.index}
      className={twMerge(
        'bg-purple-gradient rounded-lg flex items-center gap-2 p-2 overflow-hidden',
        className
      )}
    >
      {renderContent()}
    </Link>
  );
}
