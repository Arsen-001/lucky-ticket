import type { MarketData } from '@/types/interfaces/market.interfaces';
import { MarketPriceType, MarketStatusType, TicketBoostType } from '@/types/enums/market.enums';
import { TicketsEnum } from '@/types/enums/ticket.enums';

export const marketMock: MarketData = {
  boosts: [
    {
      id: 'b1',
      name: 'Bronze Speed 50%',
      type: TicketBoostType.SPEED,
      ticketType: TicketsEnum.BRONZE,
      boostPercentage: 50,
      isNew: true,
      isAvailable: true,
      prices: [
        { type: MarketPriceType.LTC, amount: 100 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 25 },
      ],
    },
    {
      id: 'b2',
      name: 'Bronze Collect 2x',
      type: TicketBoostType.COLLECT_TIME,
      ticketType: TicketsEnum.BRONZE,
      boostPercentage: 100,
      isAvailable: true,
      prices: [
        { type: MarketPriceType.LTC, amount: 150 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 35 },
      ],
    },
    {
      id: 'b3',
      name: 'Silver Speed 100%',
      type: TicketBoostType.SPEED,
      ticketType: TicketsEnum.SILVER,
      boostPercentage: 100,
      isAvailable: true,
      prices: [
        { type: MarketPriceType.LTC, amount: 200 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 50 },
      ],
    },
    {
      id: 'b4',
      name: 'Silver Collect 2x',
      type: TicketBoostType.COLLECT_TIME,
      ticketType: TicketsEnum.SILVER,
      boostPercentage: 100,
      isAvailable: true,
      prices: [
        { type: MarketPriceType.LTC, amount: 250 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 60 },
      ],
    },
    {
      id: 'b5',
      name: 'Gold Speed 150%',
      type: TicketBoostType.SPEED,
      ticketType: TicketsEnum.GOLD,
      boostPercentage: 150,
      isAvailable: false,
      prices: [
        { type: MarketPriceType.LTC, amount: 400 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 100 },
      ],
    },
    {
      id: 'b6',
      name: 'Gold Collect 3x',
      type: TicketBoostType.COLLECT_TIME,
      ticketType: TicketsEnum.GOLD,
      boostPercentage: 200,
      isAvailable: false,
      prices: [
        { type: MarketPriceType.LTC, amount: 500 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 125 },
      ],
    },
    {
      id: 'b7',
      name: 'Platinum Speed 200%',
      type: TicketBoostType.SPEED,
      ticketType: TicketsEnum.PLATINUM,
      boostPercentage: 200,
      isAvailable: false,
      prices: [
        { type: MarketPriceType.LTC, amount: 800 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 200 },
      ],
    },
    {
      id: 'b8',
      name: 'Platinum Collect 4x',
      type: TicketBoostType.COLLECT_TIME,
      ticketType: TicketsEnum.PLATINUM,
      boostPercentage: 300,
      isAvailable: false,
      prices: [
        { type: MarketPriceType.LTC, amount: 1000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 250 },
      ],
    },
    {
      id: 'b9',
      name: 'Diamond Speed 300%',
      type: TicketBoostType.SPEED,
      ticketType: TicketsEnum.DIAMOND,
      boostPercentage: 300,
      isAvailable: false,
      prices: [
        { type: MarketPriceType.LTC, amount: 1500 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 375 },
      ],
    },
    {
      id: 'b10',
      name: 'Diamond Collect 5x',
      type: TicketBoostType.COLLECT_TIME,
      ticketType: TicketsEnum.DIAMOND,
      boostPercentage: 400,
      isAvailable: false,
      prices: [
        { type: MarketPriceType.LTC, amount: 2000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 500 },
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
      prices: [
        { type: MarketPriceType.LTC, amount: 5000 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 1250 },
      ],
      upgradePrices: [
        { type: MarketPriceType.LTC, amount: 2500 },
        { type: MarketPriceType.TELEGRAM_STARS, amount: 625 },
      ],
      privileges: [
        'vip badge on profile',
        'increases silver ticket speed with {percentage}%',
        '50% market discount',
        'participate in bronze level draws',
      ],
    },
  ],
};
