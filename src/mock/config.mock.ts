import { appConfig } from '@/config/app.config';
import { GlobalConstants } from '@/constants/global.constants';
import { DEFAULT_ENGINE_LEVEL_TABLES } from '@/utils/global/ticket-engine.utils';
import { walletConstants } from '@/utils/pages/wallet.utils';
import type { PublicConfig } from '@/types/interfaces/config.interfaces';

/**
 * Public config (`GET /config`). In mock mode everything comes straight from
 * the local constants — the real backend serves the same shape with the
 * rate/referral/jackpot values overridable from the admin panel.
 */
const getPublicConfig = (): PublicConfig => ({
  lcUsdRate: appConfig.wallet.lcUsdRate,
  tonUsdRate: appConfig.wallet.tonUsdRate,
  lsUsdRate: appConfig.wallet.lsUsdRate,
  wallet: {
    withdrawalsEnabled: appConfig.wallet.withdrawalsEnabled,
    withdrawFeeTon: appConfig.wallet.withdrawFeeTon,
    minWithdrawTon: walletConstants.TON_MIN_WITHDRAW,
    firstWithdrawMinTon: walletConstants.TON_FIRST_MIN_WITHDRAW,
    maxWithdrawTon: walletConstants.TON_MAX_WITHDRAW,
    withdrawDailyCapTon: walletConstants.TON_WITHDRAW_DAILY_CAP,
    minDepositTon: walletConstants.TON_MIN_DEPOSIT,
    minWithdrawLc: appConfig.wallet.minWithdrawLc,
  },
  adsEnabled: true,
  partnersEnabled: appConfig.partners.enabled,
  leaderboardEnabled: appConfig.leaderboard.enabled,
  referral: {
    signup: {
      ap: GlobalConstants.inviteActivityPoints,
      stars: GlobalConstants.inviteStars,
      // Equal to the flat pair on purpose — the doubling is gone, and a mock
      // that still showed 20/2 would be the only place it survived.
      premiumAp: GlobalConstants.inviteActivityPoints,
      premiumStars: GlobalConstants.inviteStars,
    },
    hasRewardLadder: false,
    tournamentLcPct: GlobalConstants.referralTournamentLcPercentage,
    tournamentLcL2Pct: GlobalConstants.referralTournamentLcL2Percentage,
  },
  jackpot: {
    accrualPercent: appConfig.jackpot.accrualPercent,
    participantsSharePercent: appConfig.jackpot.participantsSharePercent,
    podiumSplitPercent: appConfig.jackpot.podiumSplitPercent,
  },
  tournaments: {
    shardRewards: GlobalConstants.tournamentShardRewards,
    joinApByTier: GlobalConstants.apRewards.tournamentJoinByTier,
  },
  engines: {
    upgrade: appConfig.economy.engineUpgrades,
    levelTables: {
      speedLevelBoostPct: [...DEFAULT_ENGINE_LEVEL_TABLES.speedLevelBoostPct],
      capacityLevelBonusTickets: [...DEFAULT_ENGINE_LEVEL_TABLES.capacityLevelBonusTickets],
      engineLevelSpeedBoostPct: [...DEFAULT_ENGINE_LEVEL_TABLES.engineLevelSpeedBoostPct],
      engineLevelBaseCapacity: [...DEFAULT_ENGINE_LEVEL_TABLES.engineLevelBaseCapacity],
    },
  },
  stakes: {
    durationMinMonths: GlobalConstants.stakeDurationMinMonths,
    durationMaxMonths: GlobalConstants.stakeDurationMaxMonths,
    aprMinPercent: GlobalConstants.stakeAprMinPercent,
    aprMaxPercent: GlobalConstants.stakeAprMaxPercent,
    apDivisor: GlobalConstants.stakeApDivisor,
    apCompletionBonusPercent: GlobalConstants.stakeApCompletionBonusPercent,
    bronzeFreeStartCount: GlobalConstants.stakeBronzeFreeStartCount,
  },
});

export const configMock = {
  config: getPublicConfig,
};
