import { ExchangeStatus, ExchangeType } from '@/types/enums/exchnage.enums';
import type { ExchangeHistoryItem, ExchangeOffers } from '@/types/interfaces/exchange.interfaces';

export const exchangeOffersMock: ExchangeOffers = {
  [ExchangeType.LTC_TO_USDT]: [
    {
      id: '1',
      type: ExchangeType.LTC_TO_USDT,
      payAmount: 100,
      receivedAmount: 1,
    },
    {
      id: '2',
      type: ExchangeType.LTC_TO_USDT,
      payAmount: 300,
      receivedAmount: 5,
    },
    {
      id: '3',
      type: ExchangeType.LTC_TO_USDT,
      payAmount: 1000,
      receivedAmount: 12,
    },
  ],
  [ExchangeType.USDT_TO_LTC]: [
    {
      id: '4',
      type: ExchangeType.USDT_TO_LTC,
      payAmount: 1,
      receivedAmount: 50,
    },
    {
      id: '5',
      type: ExchangeType.USDT_TO_LTC,
      payAmount: 5,
      receivedAmount: 400,
    },
    {
      id: '6',
      type: ExchangeType.USDT_TO_LTC,
      payAmount: 10,
      receivedAmount: 900,
    },
  ],
};

export const exchangeHistoryMock: ExchangeHistoryItem[] = [
  {
    id: 'h1',
    type: ExchangeType.LTC_TO_USDT,
    payAmount: 100,
    receivedAmount: 1,
    date: '2024-05-20T10:30:00Z',
    status: ExchangeStatus.PENDING,
  },
  {
    id: 'h2',
    type: ExchangeType.LTC_TO_USDT,
    payAmount: 300,
    receivedAmount: 4,
    date: '2024-05-18T14:20:00Z',
    status: ExchangeStatus.COMPLETED,
  },
  {
    id: 'h3',
    type: ExchangeType.LTC_TO_USDT,
    payAmount: 1000,
    receivedAmount: 10,
    date: '2024-05-15T09:15:00Z',
    status: ExchangeStatus.FAILED,
  },
  {
    id: 'h4',
    type: ExchangeType.USDT_TO_LTC,
    payAmount: 1,
    receivedAmount: 50,
    date: '2024-05-10T16:45:00Z',
    status: ExchangeStatus.COMPLETED,
  },
  {
    id: 'h5',
    type: ExchangeType.USDT_TO_LTC,
    payAmount: 5,
    receivedAmount: 400,
    date: '2024-05-05T11:30:00Z',
    status: ExchangeStatus.COMPLETED,
  },
];
export const exchangeMock = {
  'exchange/offers': exchangeOffersMock,
  'exchange/history': exchangeHistoryMock,
  'POST exchange': { success: true },
};
