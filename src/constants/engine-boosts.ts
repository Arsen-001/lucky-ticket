import { BadgeCheck, Cpu, Crown, Layers, Rocket, Sparkles, UserRound, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MessageIds } from '@/types/types/i18n.types';
import type { EngineSpeedBoostKey } from '@/utils/global/engine-boosts.utils';

/** i18n key per speed-stack contributor — labels stay translatable. */
export const ENGINE_BOOST_LABEL_KEY: Record<EngineSpeedBoostKey, MessageIds> = {
  engineLevel: 'engine level',
  speedLevel: 'speed upgrades',
  vip: 'vip',
  booster: 'booster',
  avatar: 'avatar',
  badge: 'tester badge',
  chip: 'chip',
  luckyPlayer: 'lucky player',
};

/**
 * One colour per contributor, so a stacked bar and its legend always agree.
 *
 * The two multipliers are deliberately NOT neighbours of the additive rows
 * they used to share a colour with: Lucky Player carries its own pink (the
 * accent of its own screen), which is why `avatar` moved to silver.
 */
export const ENGINE_BOOST_COLOR: Record<EngineSpeedBoostKey, string> = {
  engineLevel: 'var(--color-electric-purple)',
  speedLevel: 'var(--color-electric-pink)',
  vip: 'var(--color-gold)',
  booster: 'var(--color-orange)',
  avatar: 'var(--color-silver)',
  badge: 'var(--color-success)',
  chip: 'var(--color-teal)',
  luckyPlayer: 'var(--color-pink)',
};

export const ENGINE_BOOST_ICON: Record<EngineSpeedBoostKey, LucideIcon> = {
  engineLevel: Layers,
  speedLevel: Zap,
  vip: Crown,
  booster: Rocket,
  avatar: UserRound,
  badge: BadgeCheck,
  chip: Cpu,
  luckyPlayer: Sparkles,
};
