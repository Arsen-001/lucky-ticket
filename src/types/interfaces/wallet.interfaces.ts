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
  /**
   * Invited friends required before a wallet may be bound (admin-editable,
   * `walletConfig.connectMinReferrals`; 0 = no gate). Binding opens the way IN
   * (deposit / buy), so this is the cheap gate. Optional because an older
   * backend doesn't serve it — the UI then treats the wallet as open.
   */
  connectMinReferrals?: number;
  /**
   * Invited friends required before TON may be withdrawn (`walletConfig.
   * withdrawMinReferrals`; 0 = no gate) — the way OUT, so it costs more.
   */
  withdrawMinReferrals?: number;
  /** Friends this player has invited — both gates' progress. */
  referralsCount?: number;
  /**
   * Master switch on binding a wallet (`walletConfig.connectEnabled`): false =
   * the wallet opens after the test period. Served apart from `canConnect`
   * because the two refusals need different screens — this one has no
   * requirement to show and no progress to make. Optional: an older backend
   * omits it, and the wallet is then treated as open.
   */
  connectEnabled?: boolean;
  /**
   * Server's verdict on the connect gate: false = `POST /wallet/connect` will
   * 403. A wallet bound before the gate stays connectable, so this is not simply
   * `referralsCount >= connectMinReferrals`.
   */
  canConnect?: boolean;
  /**
   * Server's verdict on the withdrawal gate: false = `POST /wallet/withdraw`
   * will 403. Never grandfathered by an existing binding — an old wallet says
   * nothing about invited friends.
   */
  canWithdraw?: boolean;
  /**
   * The withdrawal minimum THIS account is held to right now. The rule is two
   * numbers — a lower one for an account's first cash-out, the real threshold
   * for every one after it — and only the server knows which applies, so the
   * form validates against this rather than deciding for itself. Optional: an
   * older backend omits it and the form falls back to `GET /config`.
   */
  minWithdrawTon?: number;
  /** True while the account is still on the cheaper first-withdrawal minimum. */
  firstWithdrawal?: boolean;
  /** What the minimum becomes after the first withdrawal — stated up front. */
  nextWithdrawMinTon?: number;
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
  /**
   * Null when the transfer was broadcast but not yet confirmed on-chain — the
   * backend records a PENDING row and answers success, because the money HAS
   * left. Typed nullable so nobody builds an explorer link out of it: doing so
   * produced `tonscan.org/tx/null`, a 404 on the one flow where real TON moved.
   */
  txHash: string | null;
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
