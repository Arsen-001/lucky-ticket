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
  /**
   * Paid a chip slot — a move onto another engine, or an unequip. Split off
   * ENGINE_UPGRADE on 17.08.2026: the Test-Quest counts engine-upgrade rows, so
   * a chip shuffled between engines ticked off «прокачай двигатель N раз».
   */
  CHIP_SLOT = 'chip_slot',
  /**
   * The account was wiped because its owner blocked the bot.
   * @see LcTransactionType.BOT_BLOCK_RESET
   */
  BOT_BLOCK_RESET = 'bot_block_reset',
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
