import { useGetPublicConfigQuery } from '@/api/config.api';
import { appConfig } from '@/config/app.config';

export interface JackpotDisplayConfig {
  accrualPercent: number;
  participantsSharePercent: number;
  podiumSplitPercent: { first: number; second: number; third: number };
}

/**
 * Live jackpot split percentages from `GET /config` (admin-editable), falling
 * back to the bundled `appConfig.jackpot` anchors while loading or on an older
 * backend. Display-only — the backend computes the real distribution.
 */
export function useJackpotDisplayConfig(): JackpotDisplayConfig {
  const { data } = useGetPublicConfigQuery();
  return {
    accrualPercent: data?.jackpot?.accrualPercent ?? appConfig.jackpot.accrualPercent,
    participantsSharePercent:
      data?.jackpot?.participantsSharePercent ?? appConfig.jackpot.participantsSharePercent,
    podiumSplitPercent: data?.jackpot?.podiumSplitPercent ?? appConfig.jackpot.podiumSplitPercent,
  };
}
