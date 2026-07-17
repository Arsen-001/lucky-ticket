import { useGetPublicConfigQuery } from '@/api/config.api';
import { appConfig } from '@/config/app.config';
import type { EngineUpgradeKnobs } from '@/utils/global/economy.utils';
import {
  DEFAULT_ENGINE_LEVEL_TABLES,
  type EngineLevelTables,
} from '@/utils/global/ticket-engine.utils';
import type { PublicConfig } from '@/types/interfaces/config.interfaces';

export interface EngineConfig {
  /** Level-curve tables — what every engine/sub level grants (DOCS §9.7/§10). */
  tables: EngineLevelTables;
  /** Upgrade-price formula knobs (DOCS §10.1/§10.2). */
  upgrade: EngineUpgradeKnobs;
}

/**
 * Resolve the served `engines` config section over the bundled defaults —
 * shared by the hook and the non-React optimistic paths in `engines.api.ts`,
 * so the price the button shows and the price the optimistic patch deducts can
 * never diverge. Tier keys arrive lowercased; merging over the defaults keeps
 * every tier present even if an older backend serves a partial map.
 */
export const resolveEngineConfig = (config?: PublicConfig): EngineConfig => {
  const served = config?.engines;
  if (!served) {
    return { tables: DEFAULT_ENGINE_LEVEL_TABLES, upgrade: appConfig.economy.engineUpgrades };
  }
  return {
    tables: served.levelTables,
    upgrade: {
      ...served.upgrade,
      tierCostMultiplier: {
        ...appConfig.economy.engineUpgrades.tierCostMultiplier,
        ...served.upgrade.tierCostMultiplier,
      },
    },
  };
};

/**
 * Live engine development knobs (upgrade prices + level-curve tables) from
 * `GET /config` — admin edits reach the UI without a redeploy. Falls back to
 * the bundled constants while loading or on an older backend. The backend
 * charges and grants from the same config, so what this renders is what the
 * server actually does.
 */
export function useEngineConfig(): EngineConfig {
  const { data } = useGetPublicConfigQuery();
  return resolveEngineConfig(data);
}
