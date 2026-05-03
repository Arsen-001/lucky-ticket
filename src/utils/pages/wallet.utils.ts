import {
  WalletProvider,
  WalletTransactionFilter,
  WalletTransactionType,
} from '@/types/enums/wallet.enums';
import type { Dictionary } from '@/types/types/i18n.types';
import type { WalletTransaction } from '@/types/interfaces/wallet.interfaces';

const TON_MIN_WITHDRAW = 0.1;
const TON_NETWORK_FEE = 0.05;
const TONSCAN_BASE = 'https://tonscan.org/tx/';
const TON_ADDRESS_REGEX = /^(EQ|UQ|kQ|0Q)[A-Za-z0-9_-]{46}$/;

export const walletConstants = {
  TON_MIN_WITHDRAW,
  TON_NETWORK_FEE,
  TONSCAN_BASE,
};

export const truncateAddress = (address?: string): string => {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isValidTonAddress = (address: string): boolean =>
  TON_ADDRESS_REGEX.test(address.trim());

export const formatTon = (value: number, fractionDigits = 4): string =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });

export const formatUsd = (value: number): string =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const tonScanUrl = (txHash: string) => `${TONSCAN_BASE}${txHash}`;

export const filterTransactions = (
  transactions: WalletTransaction[],
  filter: WalletTransactionFilter
): WalletTransaction[] => {
  switch (filter) {
    case WalletTransactionFilter.DEPOSITS:
      return transactions.filter(t => t.type === WalletTransactionType.DEPOSIT_TON);
    case WalletTransactionFilter.WITHDRAWALS:
      return transactions.filter(t => t.type === WalletTransactionType.WITHDRAW_TON);
    case WalletTransactionFilter.STARS:
      return transactions.filter(t => t.type === WalletTransactionType.BUY_STARS);
    default:
      return transactions;
  }
};

export const formatRelativeTime = (iso: string, t: Dictionary): string => {
  const date = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - date) / 1000));
  if (diffSec < 60) return t('just now');
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return t('{n} min ago', { n: diffMin });
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return t('{n} h ago', { n: diffH });
  const diffD = Math.floor(diffH / 24);
  return t('{n} d ago', { n: diffD });
};

export const providerLabel = (provider?: WalletProvider): string => {
  switch (provider) {
    case WalletProvider.TONKEEPER:
      return 'Tonkeeper';
    case WalletProvider.MYTONWALLET:
      return 'MyTonWallet';
    case WalletProvider.TELEGRAM_WALLET:
      return 'Telegram Wallet';
    case WalletProvider.TONHUB:
      return 'Tonhub';
    default:
      return '';
  }
};
