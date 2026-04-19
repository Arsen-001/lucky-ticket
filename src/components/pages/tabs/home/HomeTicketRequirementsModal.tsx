'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { Progress } from '@/components/shared/Progress';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TicketRequirement } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import type { MessageIds } from '@/types/types/i18n.types';
import { twMerge } from 'tailwind-merge';

interface HomeTicketRequirementsModalProps {
  open: boolean;
  onClose: () => void;
  ticketType: TicketType;
  requirements?: TicketRequirement[];
}

const typeTextColors: Record<TicketType, string> = {
  bronze: 'text-bronze',
  silver: 'text-silver',
  gold: 'text-gold',
  platinum: 'text-platinum',
  diamond: 'text-diamond',
};

const titleIdByType: Record<TicketType, MessageIds> = {
  bronze: 'bronze',
  silver: 'silver',
  gold: 'golden',
  platinum: 'platinum',
  diamond: 'diamond',
};

export function HomeTicketRequirementsModal({
  open,
  onClose,
  ticketType,
  requirements,
}: HomeTicketRequirementsModalProps) {
  const t = useAppTranslations();

  const getRequirementLabel = (req: TicketRequirement): string => {
    switch (req.requirementType) {
      case 'collect':
        return t('collect {ticketName} tickets', {
          ticketName: req.type ? t(req.type as MessageIds) : '',
        });
      case 'join':
        return t('join {tournamentName} tournament', {
          tournamentName: req.type ? t(req.type as MessageIds) : '',
        });
      case 'task':
        return t('complete {count} tasks', { count: req.totalCount });
      case 'activity':
        return t('daily activity {days} days', { days: req.totalCount });
      case 'invite':
        return t('invite friends');
      default:
        return '';
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient rounded-3xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <TicketOverlap type={ticketType} width={44} height={44} />
          <div className="flex flex-col gap-0.5">
            <span
              className={twMerge(
                'text-xs font-semibold uppercase tracking-wider',
                typeTextColors[ticketType]
              )}
            >
              {t(titleIdByType[ticketType])}
            </span>
            <span className="text-white font-bold text-base leading-snug">
              {t('unlock requirements')}
            </span>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div className="flex flex-col gap-3">
          {requirements?.map((req, index) => {
            const percentage = req.totalCount > 0 ? (req.actualCount / req.totalCount) * 100 : 0;
            const isCompleted = req.actualCount >= req.totalCount;

            return (
              <div key={index} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span
                    className={twMerge('font-medium', isCompleted ? 'text-success' : 'text-white')}
                  >
                    {getRequirementLabel(req)}
                  </span>
                  <span
                    className={twMerge(
                      'text-xs font-semibold tabular-nums',
                      isCompleted ? 'text-success' : 'text-pink-secondary'
                    )}
                  >
                    {req.actualCount}/{req.totalCount}
                  </span>
                </div>
                <Progress
                  percentage={percentage}
                  className="h-3"
                  classNames={{ bar: isCompleted ? 'bg-success' : undefined }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
