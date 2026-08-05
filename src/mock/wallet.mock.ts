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
import { walletConstants } from '@/utils/pages/wallet.utils';

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
  connectMinReferrals: appConfig.wallet.connectMinReferrals,
  withdrawMinReferrals: appConfig.wallet.withdrawMinReferrals,
  referralsCount: mockDb.user.referralsCount,
  connectEnabled: appConfig.wallet.connectEnabled,
  canConnect: canConnectWallet(),
  canWithdraw: canWithdrawTon(),
  minWithdrawTon: hasWithdrawnBefore()
    ? walletConstants.TON_MIN_WITHDRAW
    : walletConstants.TON_FIRST_MIN_WITHDRAW,
  firstWithdrawal: !hasWithdrawnBefore(),
  nextWithdrawMinTon: walletConstants.TON_MIN_WITHDRAW,
});

/**
 * Mirrors the backend's ledger read: an account that has cashed out before is
 * held to the repeat minimum, a fresh one to the lower first-withdrawal number.
 * FAILED rows don't count there and there are none here — the mock only writes
 * a row for a withdrawal it accepted.
 */
const hasWithdrawnBefore = () =>
  mockDb.wallet.transactions.some(tx => tx.type === WalletTransactionType.WITHDRAW_TON);

/** Set once a wallet has ever been bound — mirrors `WalletBindingHistory`. */
let everBoundWallet = Boolean(mockDb.wallet.address);

/**
 * Both gates the real backend enforces on `POST /wallet/connect`: the master
 * switch (`connectEnabled` — off for the test period) and the invite gate,
 * which enough invited friends clear. A wallet bound at some point is
 * grandfathered past both, because withdrawing needs an active connection: the
 * history counts too — removing a wallet clears the address, and the gate must
 * not become a one-way door.
 */
const canConnectWallet = () => {
  const grandfathered = Boolean(mockDb.wallet.address) || everBoundWallet;
  if (!appConfig.wallet.connectEnabled) return grandfathered;
  return mockDb.user.referralsCount >= appConfig.wallet.connectMinReferrals || grandfathered;
};

/**
 * The heavier gate on the way out (`POST /wallet/withdraw`). No grandfathering
 * here — an address bound earlier says nothing about invited friends.
 */
const canWithdrawTon = () => mockDb.user.referralsCount >= appConfig.wallet.withdrawMinReferrals;

/** Transaction history — fresh copies so RTK Query detects in-place mutations. */
const getTransactions = () => mockDb.wallet.transactions.map(tx => ({ ...tx }));

// Mirrors a backend whose treasury IS configured, so the full deposit flow
// (send-from-wallet + QR + attribution comment) is developable locally. A real
// deployment without a treasury returns `depositsEnabled: false` and no address.
const getDepositAddress = (): DepositAddressResponse => ({
  address: mockDb.wallet.address ?? '',
  network: mockDb.wallet.network,
  // Opaque tag, not a user id: the comment is public on-chain forever, so the
  // real backend mints a random one per deposit session (DOCS §15).
  comment: '9f2c41ab77e0d3b5',
  payloadBase64: 'te6ccgEBAQEADgAAGAAAAABtb2NrLXVzZXI=',
  viaWalletEnabled: true,
  depositsEnabled: true,
});

/** POST wallet/connect — mark the wallet connected with the chosen provider. */
const connectWallet = (args: FetchArgs) => {
  const { provider, address } = (args.body ?? {}) as Partial<ConnectWalletRequest>;
  // Same 403s the backend answers, so both refusals are developable against the
  // mock layer — and they stay distinguishable: one names a requirement the
  // player can meet, the other a date nothing they do brings closer.
  if (!canConnectWallet())
    return {
      error: {
        status: 403,
        data: appConfig.wallet.connectEnabled
          ? {
              error: 'referrals-required',
              required: appConfig.wallet.connectMinReferrals,
              current: mockDb.user.referralsCount,
            }
          : { error: 'wallet-connect-disabled' },
      },
    };
  if (provider) mockDb.wallet.provider = provider;
  mockDb.wallet.isConnected = true;
  everBoundWallet = true;
  // Prefer the real TON Connect address when present; fall back to a stub so the
  // mock still resolves in a plain browser where no wallet is available.
  mockDb.wallet.address =
    address ?? mockDb.wallet.address ?? 'EQAbCdEfGhIjKlMnOpQrStUvWxYzAaBbCcDdEeFfGgHhIiJjKx9k2';
  return {
    data: {
      success: true,
      address: mockDb.wallet.address,
      provider: mockDb.wallet.provider,
    },
  };
};

/**
 * POST wallet/disconnect — remove the binding. The address is cleared (the real
 * backend archives it into `WalletBindingHistory` first), while the TON balance
 * stays: it belongs to the account, not to the wallet.
 */
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
  // The exit kill switch outranks the invite gate, exactly as on the server:
  // while withdrawals are closed for the test period, nothing else matters.
  if (!appConfig.wallet.withdrawalsEnabled)
    return { error: { status: 403, data: { error: 'withdrawals-disabled' } } };
  // Same 403 the backend answers when the cash-out gate isn't met, so the
  // locked withdrawal state is developable against the mock layer.
  if (!canWithdrawTon())
    return {
      error: {
        status: 403,
        data: {
          error: 'referrals-required',
          required: appConfig.wallet.withdrawMinReferrals,
          current: mockDb.user.referralsCount,
        },
      },
    };
  // The two-step minimum, same as the server: cheap first cash-out, real
  // threshold afterwards.
  const min = hasWithdrawnBefore()
    ? walletConstants.TON_MIN_WITHDRAW
    : walletConstants.TON_FIRST_MIN_WITHDRAW;
  if (value < min) {
    return { error: { status: 400, data: `Minimum withdrawal is ${min} TON` } };
  }
  if (value > walletConstants.TON_MAX_WITHDRAW) {
    return {
      error: {
        status: 400,
        data: `Maximum withdrawal is ${walletConstants.TON_MAX_WITHDRAW} TON`,
      },
    };
  }
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
  // One-time ton_proof nonce — any opaque string works in the mock (no real
  // signature is verified without a backend).
  'wallet/ton-proof/payload': () => ({ payload: randomHash() }),
  'POST wallet/connect': connectWallet,
  'POST wallet/disconnect': disconnectWallet,
  'POST wallet/withdraw': withdrawTon,
  'POST wallet/buy-stars': buyStars,
  // Native Stars invoice — `openInvoice` only exists inside Telegram, so in the
  // mock/browser the flow reports 'unavailable' and never uses this link.
  'POST wallet/stars/invoice': () => ({ link: 'https://t.me/invoice/mock' }),
};
