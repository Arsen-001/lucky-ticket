export enum TaskCategory {
  ADS = 'ads',
  TOURNAMENTS = 'tournaments',
  LEADERBOARD = 'leaderboard',
  SOCIAL = 'social',
  PROFILE = 'profile',
  FRIENDS = 'friends',
  QUEST = 'quest',
  MARKET = 'market',
  ENGINES = 'engines',
  TICKETS = 'tickets',
  STAKES = 'stakes',
  STARS = 'stars',
  PROFILE_STATUS = 'profile-status',
  ACHIEVEMENTS = 'achievements',
  PARTNERS = 'partners',
}

export enum TaskFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  ONCE = 'once',
}

export enum TaskStatus {
  LOCKED = 'locked',
  IN_PROGRESS = 'in_progress',
  READY_TO_CLAIM = 'ready_to_claim',
  COMPLETED = 'completed',
}

export enum TaskRewardType {
  LTC = 'ltc',
  TICKETS = 'tickets',
  ACTIVITY_POINTS = 'activity_points',
  STARS = 'stars',
  PREMIUM = 'premium',
  ENGINE = 'engine',
}

export enum TaskRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}
