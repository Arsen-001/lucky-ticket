import type {
  WalletCurrency,
  WalletProvider,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@/types/enums/wallet.enums';

/** The TON chain the backend talks to — decides explorer links and address forms. */
export type TonNetwork = 'mainnet' | 'testnet';

export interface WalletState {
  isConnected: boolean;
  address?: string;
  provider?: WalletProvider;
  tonBalance: number;
  starsBalance: number;
  usdRate: number;
  network: TonNetwork;
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

/** A real transfer read from the TON blockchain for the connected wallet. */
export interface OnchainTransaction {
  hash: string;
  createdAt: string;
  direction: 'in' | 'out';
  /** TON amount as a decimal string. */
  amount: string;
  counterparty: string | null;
  comment: string | null;
}

export interface OnchainTransactionsResponse {
  address: string | null;
  network: TonNetwork;
  transactions: OnchainTransaction[];
}

export interface SupportedWallet {
  provider: WalletProvider;
  name: string;
  iconBg: string;
  emoji: string;
}

export interface DepositAddressResponse {
  address: string;
  network: TonNetwork;
  memo?: string;
  expiresAt?: string;
  /** Text comment (= userId) the deposit must carry so the backend attributes it. */
  comment?: string;
  /** Pre-built base64 comment payload for `tonConnectUI.sendTransaction`. */
  payloadBase64?: string;
  /** True when the backend treasury is configured — enables send-from-wallet. */
  viaWalletEnabled?: boolean;
  /**
   * False when no treasury is configured: the backend then returns no address at
   * all, because a transfer sent anywhere else could never be credited. The UI
   * must show an "unavailable" state instead of a QR to send to.
   */
  depositsEnabled?: boolean;
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

/**
 * Ownership proof returned by TON Connect (`ton_proof`). The wallet signs a
 * message built from our one-time `payload`, its address, the dApp `domain`
 * and a `timestamp`; the backend re-derives that message and verifies the
 * ed25519 `signature` against the wallet's public key.
 */
export interface TonProof {
  timestamp: number;
  domain: { lengthBytes: number; value: string };
  payload: string;
  signature: string;
}

export interface ConnectWalletRequest {
  provider: WalletProvider;
  /** Raw address from TON Connect, e.g. `0:abcd…` (workchain:hash). */
  address?: string;
  /** Hex ed25519 public key of the connected wallet. */
  publicKey?: string;
  /** Base64 wallet `stateInit` — binds the public key to the address. */
  walletStateInit?: string;
  /** Derived from the TON Connect chain id (`-239` → mainnet, `-3` → testnet). */
  network?: TonNetwork;
  /** Signed ownership proof; present on a fresh connect, absent on the mock path. */
  proof?: TonProof;
}

export interface ConnectWalletResponse {
  success: boolean;
  address: string;
  provider: WalletProvider;
}

/** One-time nonce the wallet must sign in its `ton_proof` on the next connect. */
export interface TonProofPayloadResponse {
  payload: string;
}
