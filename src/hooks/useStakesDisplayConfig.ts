import { useGetPublicConfigQuery } from '@/api/config.api';
import { defaultStakeKnobs, type StakeMathKnobs } from '@/utils/global/stakes.utils';
import { GlobalConstants } from '@/constants/global.constants';

export interface StakesDisplayConfig extends StakeMathKnobs {
  freeStartCount: number;
}

/**
 * Live stake-builder knobs (slider bounds, APR range, AP math inputs) from
 * `GET /config` — admin edits reach the form without a redeploy. Falls back to
 * the bundled constants while loading or on an older backend. The backend
 * recomputes the real APR/AP on create and claim regardless; these only keep
 * the projections honest.
 */
export function useStakesDisplayConfig(): StakesDisplayConfig {
  const { data } = useGetPublicConfigQuery();
  const s = data?.stakes;
  if (!s) {
    return {
      ...defaultStakeKnobs,
      freeStartCount: GlobalConstants.stakeFreeStartCount,
    };
  }
  return {
    durationMinMonths: s.durationMinMonths,
    durationMaxMonths: s.durationMaxMonths,
    aprMinPercent: s.aprMinPercent,
    aprMaxPercent: s.aprMaxPercent,
    apDivisor: s.apDivisor,
    apCompletionBonusPercent: s.apCompletionBonusPercent,
    freeStartCount: s.freeStartCount,
  };
}
