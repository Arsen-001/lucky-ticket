import type { FetchArgs } from '@reduxjs/toolkit/query';
import {
  WalletCurrency,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/types/enums/wallet.enums';
import type {
  BuyStarsRequest,
  ConnectWalletRequest,
  DepositAddressResponse,
  WalletState,
  WithdrawTonRequest,
} from '@/types/interfaces/wallet.interfaces';
import { appConfig } from '@/config/app.config';
import { mockDb } from '@/mock/backend/db';

const randomHash = () =>
  Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

const round4 = (n: number) => Number(n.toFixed(4));

/**
 * `wallet` query — composed live from backend state + config.
 * `starsBalance` is the shared user balance (`mockDb.user.telegramStars`),
 * not a separate wallet field, so buying stars reflects everywhere.
 */
const getWalletState = (): WalletState => ({
  isConnected: mockDb.wallet.isConnected,
  address: mockDb.wallet.address,
  provider: mockDb.wallet.provider,
  tonBalance: mockDb.wallet.tonBalance,
  starsBalance: mockDb.user.telegramStars,
  usdRate: appConfig.wallet.tonUsdRate,
  network: mockDb.wallet.network,
});

/** Transaction history — fresh copies so RTK Query detects in-place mutations. */
const getTransactions = () => mockDb.wallet.transactions.map(tx => ({ ...tx }));

const getDepositAddress = (): DepositAddressResponse => ({
  address: mockDb.wallet.address ?? '',
  network: mockDb.wallet.network,
});

/** POST wallet/connect — mark the wallet connected with the chosen provider. */
const connectWallet = (args: FetchArgs) => {
  const { provider } = (args.body ?? {}) as Partial<ConnectWalletRequest>;
  if (provider) mockDb.wallet.provider = provider;
  mockDb.wallet.isConnected = true;
  if (!mockDb.wallet.address) {
    mockDb.wallet.address = 'EQAbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFfGgHhIiJjKx9k2';
  }
  return {
    data: {
      success: true,
      address: mockDb.wallet.address,
      provider: mockDb.wallet.provider,
    },
  };
};

/** POST wallet/disconnect — clear the connection. */
const disconnectWallet = () => {
  mockDb.wallet.isConnected = false;
  mockDb.wallet.address = undefined;
  mockDb.wallet.provider = undefined;
  return { data: { success: true } };
};

/** POST wallet/withdraw — debit TON balance, append a pending withdrawal tx. */
const withdrawTon = (args: FetchArgs) => {
  const { toAddress, amount } = (args.body ?? {}) as Partial<WithdrawTonRequest>;
  const value = amount ?? 0;
  const fee = appConfig.wallet.withdrawFeeTon;
  if (value <= 0 || mockDb.wallet.tonBalance < value + fee) {
    return { error: { status: 400, data: 'Insufficient TON balance' } };
  }

  mockDb.wallet.tonBalance = round4(mockDb.wallet.tonBalance - value - fee);
  const txHash = randomHash();
  mockDb.wallet.transactions.unshift({
    id: `wtx_${Date.now()}`,
    type: WalletTransactionType.WITHDRAW_TON,
    description: `Withdrew ${value} TON`,
    amount: value,
    currency: WalletCurrency.TON,
    status: WalletTransactionStatus.PENDING,
    createdAt: new Date().toISOString(),
    txHash,
    counterparty: toAddress,
    fee,
  });

  return { data: { success: true, txHash, estimatedArrivalSec: 30 } };
};

/** POST wallet/buy-stars — debit TON, credit the shared Stars balance. */
const buyStars = (args: FetchArgs) => {
  const { packageId, customStars } = (args.body ?? {}) as Partial<BuyStarsRequest>;
  const pkg = packageId ? appConfig.wallet.starsPackages.find(p => p.id === packageId) : undefined;
  const baseRate = appConfig.wallet.starsPackages[0]; // 75 stars / 1 TON

  let stars = 0;
  let tonCost = 0;
  if (pkg) {
    stars = pkg.stars;
    tonCost = pkg.tonCost;
  } else if (customStars && customStars > 0) {
    stars = customStars;
    tonCost = round4(customStars / (baseRate.stars / baseRate.tonCost));
  } else {
    return { error: { status: 400, data: 'No package or custom amount provided' } };
  }

  if (mockDb.wallet.tonBalance < tonCost) {
    return { error: { status: 400, data: 'Insufficient TON balance' } };
  }

  mockDb.wallet.tonBalance = round4(mockDb.wallet.tonBalance - tonCost);
  mockDb.user.telegramStars += stars;
  const txHash = randomHash();
  mockDb.wallet.transactions.unshift({
    id: `wtx_${Date.now()}`,
    type: WalletTransactionType.BUY_STARS,
    description: `Bought ${stars} Stars for ${tonCost} TON`,
    amount: stars,
    currency: WalletCurrency.STARS,
    status: WalletTransactionStatus.COMPLETED,
    createdAt: new Date().toISOString(),
    txHash,
    fee: 0.005,
  });

  return { data: { success: true, txHash, starsCredited: stars } };
};

export const walletMock = {
  wallet: getWalletState,
  'wallet/supported': appConfig.wallet.supportedWallets,
  'wallet/transactions': getTransactions,
  'wallet/stars-packages': appConfig.wallet.starsPackages,
  'wallet/deposit-address': getDepositAddress,
  'POST wallet/connect': connectWallet,
  'POST wallet/disconnect': disconnectWallet,
  'POST wallet/withdraw': withdrawTon,
  'POST wallet/buy-stars': buyStars,
};
