import {
  WalletCurrency,
  WalletProvider,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/types/enums/wallet.enums';
import type {
  DepositAddressResponse,
  StarsPackage,
  SupportedWallet,
  WalletState,
  WalletTransaction,
} from '@/types/interfaces/wallet.interfaces';

const walletState: WalletState = {
  isConnected: true,
  address: 'EQAbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFfGgHhIiJjKx9k2',
  provider: WalletProvider.TONKEEPER,
  tonBalance: 12.4583,
  starsBalance: 1240,
  usdRate: 3.42,
  network: 'mainnet',
};

const supportedWallets: SupportedWallet[] = [
  { provider: WalletProvider.TONKEEPER, name: 'Tonkeeper', iconBg: '#0098EA', emoji: 'TK' },
  { provider: WalletProvider.MYTONWALLET, name: 'MyTonWallet', iconBg: '#3B6FE3', emoji: 'MT' },
  {
    provider: WalletProvider.TELEGRAM_WALLET,
    name: 'Telegram Wallet',
    iconBg: '#229ED9',
    emoji: 'TG',
  },
  { provider: WalletProvider.TONHUB, name: 'Tonhub', iconBg: '#7C5CFF', emoji: 'TH' },
];

const walletTransactions: WalletTransaction[] = [
  {
    id: 'wtx_001',
    type: WalletTransactionType.BUY_STARS,
    description: 'Bought 500 Stars for 0.25 TON',
    amount: 500,
    currency: WalletCurrency.STARS,
    status: WalletTransactionStatus.COMPLETED,
    createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    txHash: '7f3c1ab9e1d7af2401b6b3a5a3dbf512a98b2c1d5e7f6a4b3c2d1e0f9a8b7c6d',
    fee: 0.005,
  },
  {
    id: 'wtx_002',
    type: WalletTransactionType.DEPOSIT_TON,
    description: 'Deposited 5 TON',
    amount: 5,
    currency: WalletCurrency.TON,
    status: WalletTransactionStatus.COMPLETED,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    txHash: '8e2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    counterparty: 'EQDc...mP31',
  },
  {
    id: 'wtx_003',
    type: WalletTransactionType.WITHDRAW_TON,
    description: 'Withdrew 2.5 TON',
    amount: 2.5,
    currency: WalletCurrency.TON,
    status: WalletTransactionStatus.PENDING,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    txHash: '9c8b7a6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    counterparty: 'EQAv...8t1q',
    fee: 0.05,
  },
  {
    id: 'wtx_004',
    type: WalletTransactionType.BUY_STARS,
    description: 'Bought 100 Stars for 0.05 TON',
    amount: 100,
    currency: WalletCurrency.STARS,
    status: WalletTransactionStatus.COMPLETED,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    txHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    fee: 0.005,
  },
  {
    id: 'wtx_005',
    type: WalletTransactionType.DEPOSIT_TON,
    description: 'Deposited 10 TON',
    amount: 10,
    currency: WalletCurrency.TON,
    status: WalletTransactionStatus.COMPLETED,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    txHash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    counterparty: 'EQDc...mP31',
  },
  {
    id: 'wtx_006',
    type: WalletTransactionType.WITHDRAW_TON,
    description: 'Withdrew 1 TON',
    amount: 1,
    currency: WalletCurrency.TON,
    status: WalletTransactionStatus.FAILED,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    counterparty: 'EQDz...4m9p',
    fee: 0.05,
  },
];

const starsPackages: StarsPackage[] = [
  { id: 'pkg_75', stars: 75, tonCost: 1 },
  { id: 'pkg_400', stars: 400, tonCost: 5, bonusPercent: 7, popular: true },
  { id: 'pkg_850', stars: 850, tonCost: 10, bonusPercent: 13 },
  { id: 'pkg_4700', stars: 4700, tonCost: 50, bonusPercent: 25 },
];

const depositAddress: DepositAddressResponse = {
  address: 'EQAbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFfGgHhIiJjKx9k2',
  network: 'mainnet',
};

export const walletMock = {
  wallet: walletState,
  'wallet/supported': supportedWallets,
  'wallet/transactions': walletTransactions,
  'wallet/stars-packages': starsPackages,
  'wallet/deposit-address': depositAddress,
  'POST wallet/connect': {
    success: true,
    address: walletState.address,
    provider: walletState.provider,
  },
  'POST wallet/disconnect': { success: true },
  'POST wallet/withdraw': {
    success: true,
    txHash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    estimatedArrivalSec: 30,
  },
  'POST wallet/buy-stars': {
    success: true,
    txHash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    starsCredited: 500,
  },
  'POST wallet/notify-lc': { success: true },
};
