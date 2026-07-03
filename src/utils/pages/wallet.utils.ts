import {
  WalletProvider,
  WalletTransactionFilter,
  WalletTransactionType,
} from '@/types/enums/wallet.enums';
import { appConfig } from '@/config/app.config';
import type { Dictionary } from '@/types/types/i18n.types';
import type { WalletTransaction } from '@/types/interfaces/wallet.interfaces';

/** USD value of one Lucky Star — mirrors the backend buy-stars pricing. */
const STAR_USD_RATE = 0.02;

/** TON cost to buy `stars` Lucky Stars from the TON balance (matches the backend). */
export const starsToTon = (stars: number): number =>
  Math.ceil((stars * STAR_USD_RATE * 1000) / appConfig.wallet.tonUsdRate) / 1000;

/** Lucky Stars you get for `ton` TON (floored — the exchange never over-credits). */
export const tonToStars = (ton: number): number =>
  Math.floor((ton * appConfig.wallet.tonUsdRate) / STAR_USD_RATE);

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

export const tonScanAddressUrl = (address: string) => `https://tonscan.org/address/${address}`;

/** TON Connect `sendTransaction` validUntil — 6 minutes out (util keeps Date.now out of render). */
export const tonConnectValidUntil = (): number => Math.floor(Date.now() / 1000) + 360;

/** Whole TON amount → nanoTON string for `sendTransaction` messages. */
export const tonToNanoString = (ton: number): string => BigInt(Math.round(ton * 1e9)).toString();

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

/** Map a TON Connect `device.appName` to our provider enum (unknown → Telegram Wallet). */
export const resolveWalletProvider = (appName?: string): WalletProvider => {
  switch (appName?.toLowerCase()) {
    case 'tonkeeper':
      return WalletProvider.TONKEEPER;
    case 'mytonwallet':
      return WalletProvider.MYTONWALLET;
    case 'tonhub':
      return WalletProvider.TONHUB;
    case 'telegram-wallet':
    case 'telegramwallet':
    case 'wallet':
      return WalletProvider.TELEGRAM_WALLET;
    default:
      return WalletProvider.TELEGRAM_WALLET;
  }
};

/** TON Connect chain id → our network label (`-3` is the testnet workchain). */
export const chainToNetwork = (chain?: string): 'mainnet' | 'testnet' =>
  chain === '-3' ? 'testnet' : 'mainnet';

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
