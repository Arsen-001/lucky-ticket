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
      isNew: true,
      prices: [
        { type: MarketPriceType.LTC, amount: 100 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 25 },
      ],
    },
    {
      id: 'b2',
      name: 'Speed 100%',
      type: TicketBoostType.SPEED,
      ticketType: TicketsEnum.SILVER,
      boostPercentage: 100,
      prices: [
        { type: MarketPriceType.LTC, amount: 200 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 50 },
      ],
    },
    {
      id: 'b3',
      name: 'Collect Time 2x',
      type: TicketBoostType.COLLECT_TIME,
      ticketType: TicketsEnum.GOLD,
      boostPercentage: 100,
      prices: [
        { type: MarketPriceType.LTC, amount: 150 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 35 },
      ],
    },
    {
      id: 'b4',
      name: 'Collect Time 3x',
      type: TicketBoostType.COLLECT_TIME,
      ticketType: TicketsEnum.GOLD,
      boostPercentage: 200,
      prices: [
        { type: MarketPriceType.LTC, amount: 300 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 75 },
      ],
    },
  ],
  tickets: [
    {
      id: 't1',
      name: 'Bronze Ticket',
      isNew: true,
      ticketType: TicketsEnum.BRONZE,
      isAvailable: true,
      prices: [
        { type: MarketPriceType.LTC, amount: 50 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 15 },
      ],
    },
    {
      id: 't2',
      name: 'Silver Ticket',
      ticketType: TicketsEnum.SILVER,
      isAvailable: true,
      prices: [
        { type: MarketPriceType.LTC, amount: 150 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 40 },
      ],
    },
    {
      id: 't3',
      name: 'Gold Ticket',
      ticketType: TicketsEnum.GOLD,
      isAvailable: false,
      prices: [
        { type: MarketPriceType.LTC, amount: 500 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 125 },
      ],
    },
  ],
  statuses: [
    {
      id: 's1',
      name: 'Prime Status',
      isNew: true,
      statusType: MarketStatusType.PRIME,
      durationDays: 30,
      prices: [
        { type: MarketPriceType.LTC, amount: 1000 },
        { type: MarketPriceType.USDT, amount: 10 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 250 },
      ],
      privileges: [
        'prime badge on profile',
        'increases bronze ticket speed with {percentage}%',
        '25% market discount',
        'priority support',
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
        { type: MarketPriceType.TELEGRAM_STARS, amount: 1250 },
      ],
      privileges: [
        'vip badge on profile',
        'increases silver ticket speed with {percentage}%',
        '50% market discount',
        'participate in bronze level draws',
      ],
      requirements: [{ type: MarketItemRequirementType.ACTIVITY_POINTS, count: 1000 }],
    },
  ],
};
