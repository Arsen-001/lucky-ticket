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
