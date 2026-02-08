import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { RequireKeys } from '@/types/types/utils.types';
import type {
  AvailableTicketItemProps,
  BaseTicketProps,
  BlockedTicketProps,
} from '@/types/interfaces/ticket.interfaces';

export type TicketType = `${TicketsEnum}`;

export type TicketRequirementType = 'join' | 'collect' | 'invite';

export type Ticket = RequireKeys<
  Partial<BlockedTicketProps & AvailableTicketItemProps>,
  keyof BaseTicketProps
>;
