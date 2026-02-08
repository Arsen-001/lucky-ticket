import { TicketBoostType } from '@/types/enums/market.enums';
import type { TicketType } from '@/types/types/ticket.types';
import type { MarketBoost } from '@/types/interfaces/market.interfaces';
import type { MessageIds } from '@/types/types/i18n.types';

export const getNameId = (boost?: MarketBoost, ticketType?: TicketType): MessageIds => {
  if (!boost || !ticketType) return 'boost';

  if (boost.type === TicketBoostType.SPEED) {
    return `${ticketType} speed`;
  }

  if (boost.type === TicketBoostType.COLLECT_TIME) {
    return `${ticketType} collector`;
  }

  return 'boost';
};
