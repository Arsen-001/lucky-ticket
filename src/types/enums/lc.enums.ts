export enum LcTransactionType {
  TOURNAMENT_PRIZE = 'tournament_prize',
  STAKE_REWARD = 'stake_reward',
  TASK_REWARD = 'task_reward',
  REFERRAL = 'referral',
  MARKET_PURCHASE = 'market_purchase',
  MARKET_SALE = 'market_sale',
  ENGINE_UPGRADE = 'engine_upgrade',
  CONVERT_FROM_STARS = 'convert_from_stars',
  CONVERT_TO_STARS = 'convert_to_stars',
  CONVERT_TO_TON = 'convert_to_ton',
  JACKPOT = 'jackpot',
  PROMO = 'promo',
  AVATAR_REWARD = 'avatar_reward',
  /** Paid for extra rewarded-ad views past the free daily cap. */
  AD_EXTRA_VIEWS = 'ad_extra_views',
  /**
   * Bought a Telegram gift in the Market. Its own type rather than a
   * `MARKET_PURCHASE`: this is the only coin sink that costs the platform real
   * Stars, and the economy report has to be able to price it apart.
   */
  GIFT_PURCHASE = 'gift_purchase',
  /**
   * The Lucky Player daily gift (DOCS §7.2a). Apart from `TASK_REWARD` because
   * it is not earned by playing — it is a recurring emission a subscription
   * pays for, and the economy report separates the two.
   */
  LP_DAILY_GIFT = 'lp_daily_gift',
  ADMIN_ADJUST = 'admin_adjust',
}

export enum LcTransactionDirection {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum LcTransactionFilter {
  ALL = 'all',
  EARN = 'earn',
  SPEND = 'spend',
  CONVERT = 'convert',
}
