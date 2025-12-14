import type {
  AvailableTicketItemProps,
  BaseTicketProps,
  BlockedTicketProps,
} from '@/types/interfaces/ticket.interfaces';
import type { RequireKeys } from '@/types/types/utils.types';

export type TicketRequirementType = 'join' | 'collect' | 'invite';

export type Ticket = RequireKeys<
  Partial<BlockedTicketProps & AvailableTicketItemProps>,
  keyof BaseTicketProps
>;
