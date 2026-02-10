import { MarketBoost } from '@/types/interfaces/market.interfaces';
import { Ticket } from '@/components/shared/icons/Ticket';
import { getNameId } from '@/utils/pages/market.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface BoostTitleProps {
  boost?: MarketBoost;
  size?: number;
}

export const BoostTitle = ({ boost, size = 18 }: BoostTitleProps) => {
  const t = useAppTranslations();

  return (
    <>
      {boost?.ticketType && (
        <Ticket height={size} className="mr-2 inline" type={boost.ticketType} />
      )}
      {t(getNameId(boost, boost?.ticketType))}
    </>
  );
};
