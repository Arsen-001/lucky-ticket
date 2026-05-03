import type {
  WalletCurrency,
  WalletProvider,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/types/enums/wallet.enums';

export interface WalletState {
  isConnected: boolean;
  address?: string;
  provider?: WalletProvider;
  tonBalance: number;
  starsBalance: number;
  usdRate: number;
  network: 'mainnet' | 'testnet';
}

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  description: string;
  amount: number;
  currency: WalletCurrency;
  status: WalletTransactionStatus;
  createdAt: string;
  txHash?: string;
  fee?: number;
  counterparty?: string;
}

export interface SupportedWallet {
  provider: WalletProvider;
  name: string;
  iconBg: string;
  emoji: string;
}

export interface DepositAddressResponse {
  address: string;
  network: 'mainnet' | 'testnet';
  memo?: string;
  expiresAt?: string;
}

export interface WithdrawTonRequest {
  toAddress: string;
  amount: number;
}

export interface WithdrawTonResponse {
  success: boolean;
  txHash: string;
  estimatedArrivalSec: number;
}

export interface StarsPackage {
  id: string;
  stars: number;
  tonCost: number;
  bonusPercent?: number;
  popular?: boolean;
}

export interface BuyStarsRequest {
  packageId?: string;
  customStars?: number;
}

export interface BuyStarsResponse {
  success: boolean;
  txHash: string;
  starsCredited: number;
}

export interface NotifyLcLaunchRequest {
  email?: string;
}

export interface NotifyLcLaunchResponse {
  success: boolean;
}

export interface ConnectWalletRequest {
  provider: WalletProvider;
}

export interface ConnectWalletResponse {
  success: boolean;
  address: string;
  provider: WalletProvider;
}
