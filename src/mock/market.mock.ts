import type { MarketData } from '@/types/interfaces/market.interfaces';
import { BoostType } from '@/types/enums/market.enums';

export const marketMock: MarketData = {
  boosts: [
    {
      id: 'b1',
      type: BoostType.SPEED,
      ticketType: 'bronze',
      multiplier: 2,
      durationInHours: 24,
      price: 100,
    },
    {
      id: 'b2',
      type: BoostType.COLLECTION_TIME,
      ticketType: 'bronze',
      multiplier: 2,
      durationInHours: 24,
      price: 100,
    },
    {
      id: 'b3',
      type: BoostType.SPEED,
      ticketType: 'silver',
      multiplier: 2,
      durationInHours: 24,
      price: 250,
    },
    {
      id: 'b4',
      type: BoostType.SPEED,
      ticketType: 'silver',
      multiplier: 2,
      durationInHours: 24,
      price: 250,
    },
  ],
  tickets: [
    {
      id: 't1',
      ticketType: 'bronze',
      price: 50,
    },
    {
      id: 't2',
      ticketType: 'silver',
      price: 150,
    },
    {
      id: 't3',
      ticketType: 'gold',
      price: 500,
    },
  ],
  statuses: [
    {
      id: 's1',
      statusType: 'prime',
      price: 1000,
      priceCurrency: 'LTC',
      durationInDays: 30,
      benefits: [
        'Prime badge on profile',
        '50% boost to ticket claim speed',
        '25% market discount',
        'Priority support',
      ],
    },
    {
      id: 's2',
      statusType: 'vip',
      price: 5000,
      priceCurrency: 'LTC',
      durationInDays: 30,
      benefits: [
        'VIP badge on profile',
        '100% boost to ticket claim speed',
        '50% market discount',
        'Exclusive VIP tournaments',
      ],
      requirements: {
        minActivityPoints: 1000,
      },
    },
  ],
};
