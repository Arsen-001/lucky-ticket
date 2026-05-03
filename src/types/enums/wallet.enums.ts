export enum WalletProvider {
  TONKEEPER = 'tonkeeper',
  MYTONWALLET = 'mytonwallet',
  TELEGRAM_WALLET = 'telegram-wallet',
  TONHUB = 'tonhub',
}

export enum WalletTransactionType {
  DEPOSIT_TON = 'deposit_ton',
  WITHDRAW_TON = 'withdraw_ton',
  BUY_STARS = 'buy_stars',
}

export enum WalletTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum WalletTransactionFilter {
  ALL = 'all',
  DEPOSITS = 'deposits',
  WITHDRAWALS = 'withdrawals',
  STARS = 'stars',
}

export enum WalletCurrency {
  TON = 'TON',
  STARS = 'STARS',
}
