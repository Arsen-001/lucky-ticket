import { appConfig } from '@/config/app.config';
import { GlobalConstants } from '@/constants/global.constants';
import { DEFAULT_ENGINE_LEVEL_TABLES } from '@/utils/global/ticket-engine.utils';
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
  adsEnabled: true,
  partnersEnabled: appConfig.partners.enabled,
  referral: {
    signup: {
      ap: GlobalConstants.inviteActivityPoints,
      stars: GlobalConstants.inviteStars,
      premiumAp: GlobalConstants.inviteTelegramPremiumActivityPoints,
      premiumStars: GlobalConstants.inviteTelegramPremiumStars,
    },
    hasRewardLadder: false,
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
