export enum StarsTransactionType {
  PURCHASE = 'purchase',
  REFERRAL = 'referral',
  TASK_REWARD = 'task_reward',
  STAKE_REWARD = 'stake_reward',
  PROMO = 'promo',
  ENGINE_SKIP = 'engine_skip',
  ENGINE_UPGRADE = 'engine_upgrade',
  STAKE_FEE = 'stake_fee',
  STAKE_CANCEL_FEE = 'stake_cancel_fee',
  SHOWCASE_SLOT = 'showcase_slot',
  MARKET_PURCHASE = 'market_purchase',
  AVATAR_REWARD = 'avatar_reward',
  /** Paid for extra rewarded-ad views past the free daily cap. */
  AD_EXTRA_VIEWS = 'ad_extra_views',
  ADMIN_ADJUST = 'admin_adjust',
}

export enum StarsTransactionDirection {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum StarsTransactionFilter {
  ALL = 'all',
  EARN = 'earn',
  SPEND = 'spend',
}
