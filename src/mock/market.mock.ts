import type { MarketData } from '@/types/interfaces/market.interfaces';
import {
  MarketItemRequirementType,
  MarketPriceType,
  MarketStatusType,
  TicketBoostType,
} from '@/types/enums/market.enums';
import { TicketsEnum } from '@/types/enums/ticket.enums';

export const marketMock: MarketData = {
  boosts: [
    {
      id: 'b1',
      name: 'Speed 50%',
      type: TicketBoostType.SPEED,
      ticketType: TicketsEnum.BRONZE,
      boostPercentage: 50,
      count: 2,
      prices: [{ type: MarketPriceType.LTC, amount: 100 }],
    },
    {
      id: 'b2',
      name: 'Speed 100%',
      type: TicketBoostType.SPEED,
      ticketType: TicketsEnum.SILVER,
      boostPercentage: 100,
      prices: [{ type: MarketPriceType.LTC, amount: 200 }],
    },
    {
      id: 'b3',
      name: 'Collect Time 2x',
      type: TicketBoostType.COLLECT_TIME,
      ticketType: TicketsEnum.GOLD,
      boostPercentage: 100,
      prices: [{ type: MarketPriceType.LTC, amount: 150 }],
    },
    {
      id: 'b4',
      name: 'Collect Time 3x',
      type: TicketBoostType.COLLECT_TIME,
      ticketType: TicketsEnum.GOLD,
      boostPercentage: 200,
      prices: [{ type: MarketPriceType.LTC, amount: 300 }],
    },
  ],
  tickets: [
    {
      id: 't1',
      name: 'Bronze Ticket',
      count: 15,
      ticketType: TicketsEnum.BRONZE,
      isAvailable: true,
      prices: [{ type: MarketPriceType.LTC, amount: 50 }],
    },
    {
      id: 't2',
      name: 'Silver Ticket',
      ticketType: TicketsEnum.SILVER,
      isAvailable: true,
      prices: [{ type: MarketPriceType.LTC, amount: 150 }],
    },
    {
      id: 't3',
      name: 'Gold Ticket',
      ticketType: TicketsEnum.GOLD,
      isAvailable: false,
      prices: [{ type: MarketPriceType.LTC, amount: 500 }],
    },
  ],
  statuses: [
    {
      id: 's1',
      name: 'Prime Status',
      count: 1,
      statusType: MarketStatusType.PRIME,
      durationDays: 30,
      prices: [
        { type: MarketPriceType.LTC, amount: 1000 },
        { type: MarketPriceType.USDT, amount: 10 },
      ],
      privileges: [
        'Prime badge on profile',
        '50% boost to ticket claim speed',
        '25% market discount',
        'Priority support',
      ],
    },
    {
      id: 's2',
      name: 'VIP Status',
      statusType: MarketStatusType.VIP,
      durationDays: 30,
      prices: [
        { type: MarketPriceType.LTC, amount: 5000 },
        { type: MarketPriceType.USDT, amount: 50 },
      ],
      privileges: [
        'VIP badge on profile',
        '100% boost to ticket claim speed',
        '50% market discount',
        'Exclusive VIP tournaments',
      ],
      requirements: [{ type: MarketItemRequirementType.ACTIVITY_POINTS, count: 1000 }],
    },
  ],
};
