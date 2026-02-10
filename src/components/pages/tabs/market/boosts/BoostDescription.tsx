import { MarketBoost } from '@/types/interfaces/market.interfaces';
import { TicketBoostType } from '@/types/enums/market.enums';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';

interface BoostDescriptionProps {
  boost?: MarketBoost;
}

export const BoostDescription = ({ boost }: BoostDescriptionProps) => {
  const t = useAppTranslations();

  if (!boost?.ticketType) return null;

  const translationKey =
    boost.type === TicketBoostType.SPEED
      ? `increases ${boost.ticketType} ticket speed with {percentage}%`
      : `increases ${boost.ticketType} ticket collect time with {percentage}%`;

  return <>{t(translationKey as MessageIds, { percentage: boost.boostPercentage })}</>;
};
