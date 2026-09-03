export enum LcTransactionType {
  TOURNAMENT_PRIZE = 'tournament_prize',
  STAKE_REWARD = 'stake_reward',
  /**
   * Тело стейка: списание при блокировке и возврат при завершении или отмене.
   *
   * Отдельно от `STAKE_REWARD`, потому что это не доход, а перекладывание
   * собственных денег: в отчёте по экономике тело не должно попадать ни в
   * эмиссию, ни в сток. До 23.08.2026 этих строк не было вовсе — тело двигало
   * баланс молча, и /lc не мог объяснить, куда делись деньги у игрока,
   * открывшего стейк.
   */
  STAKE_PRINCIPAL = 'stake_principal',
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
  /**
   * The account was wiped because its owner blocked the bot. Its own type and
   * not `ADMIN_ADJUST`: nobody adjusted anything, and «почему списался баланс»
   * has to be answerable from the player's own history.
   */
  BOT_BLOCK_RESET = 'bot_block_reset',
  /**
   * Заработано Тикки: нажатия и пассивный доход. Своя причина, а не
   * `TASK_REWARD`: это отдельная эмиссия, и отчёт по экономике обязан уметь
   * назвать её отдельно от заданий и турниров.
   */
  TIKKI_INCOME = 'tikki_income',
  /**
   * Потрачено на Тикки: покупка, уровни, бусты, сплав. Единственный сток
   * механики, поэтому тоже своей строкой.
   */
  TIKKI_SPEND = 'tikki_spend',
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
