'use client';
import type { Ticket as TicketDataType, TicketRequirementType } from '@/types/types/ticket.types';
import { twMerge } from 'tailwind-merge';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { Ticket, type TicketType } from '@/components/shared/icons/Ticket';
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

export type HomeTickestListItemProps = TicketDataType & ClassNameProps & { loading?: boolean };

export function HomeTickestListItem({
  ticketType,
  className,
  loading,
  ...rest
}: HomeTickestListItemProps) {
  const t = useAppTranslations();
  const blocked = !rest?.claimDate;
  const claimCountDown = useCountDown(rest?.claimDate);
  const autocollectFinishCountDown = useCountDown(rest?.autocollectFinishDate);

  const titleIdBytype: Record<TicketType, MessageIds> = {
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
        className={twMerge('bg-purple-gradient rounded-lg flex items-center gap-2 p-2', className)}
      >
        <Ticket loading {...ticketImageProps} />
        <div className="flex flex-col flex-1 gap-2">
          <Skeleton className="w-30" variant={'title'} textSize="sm" />
          <div className="flex flex-col gap-0.5">
            <Skeleton variant={'text'} className="h-3 " />
            <Skeleton variant={'text'} className="h-3 " />
          </div>
        </div>
        <Skeleton variant="card" className="h-10 w-20" />
      </div>
    );
  }

  if (!blocked) {
    const speedUnit = getTicketPerTimeUnit(t);

    const percentage = autocollectFinishCountDown.getPassedPercentage(rest.maxTime);
    return (
      <div
        className={twMerge('bg-purple-gradient rounded-lg flex items-center gap-2 p-2', className)}
      >
        <Ticket {...ticketImageProps} />
        <div className="flex flex-col flex-1 gap-1">
          <span className="text-sm font-semibold">{t(titleIdBytype[ticketType])}</span>
          <div className="flex gap-1.5 gap-y-0 text-xs text-pink-secondary whitespace-nowrap flex-wrap">
            <div className="flex-center gap-0.5">
              <span className="w-full truncate">{t('speed')}:</span>
              <GoldenText>
                {rest?.speed} {speedUnit}
              </GoldenText>
            </div>
            <div className="flex-center gap-0.5">
              <span className="w-full truncate">{t('max time')}:</span>
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
      </div>
    );
  }

  const requirementIdsByType: Record<TicketRequirementType, MessageIds> = {
    join: 'join {tournamentName} tournament',
    collect: 'collect {ticketName} tickets',
    invite: 'invite friends',
  };

  return (
    <div
      className={twMerge(
        'bg-purple-gradient rounded-lg flex items-center gap-2 p-2 max-w-full',
        className
      )}
    >
      <Ticket {...ticketImageProps} />
      <div className="flex flex-col flex-[1_1_0] gap-1 whitespace-nowrap">
        <div className="text-sm text-white font-semibold">{t(titleIdBytype[ticketType])}</div>
        <div className="w-full text-pink-secondary text-xs gap-px">
          {rest.requirements?.map(({ type, requirementType, totalCount, actualCount }) => {
            const variableName = {
              join: 'tournamentName',
              collect: 'ticketName',
            }[requirementType];
            return (
              <span
                className="block leading-none w-full truncate"
                key={`${type}-${requirementType}`}
              >
                {t(
                  requirementIdsByType[requirementType],
                  variableName && {
                    [variableName]: type,
                  }
                )}{' '}
                {actualCount}/{totalCount}
              </span>
            );
          })}
        </div>
      </div>
      <Image className="mr-5" height={32} src={icons.lock} alt="lock" />
    </div>
  );
}
