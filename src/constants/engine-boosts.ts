import { BadgeCheck, Cpu, Crown, Layers, Rocket, UserRound, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MessageIds } from '@/types/types/i18n.types';
import type { EngineSpeedBoostKey } from '@/utils/global/engine-boosts.utils';

/** i18n key per speed-stack contributor — labels stay translatable. */
export const ENGINE_BOOST_LABEL_KEY: Record<EngineSpeedBoostKey, MessageIds> = {
  engineLevel: 'engine level',
  speedLevel: 'speed upgrades',
  status: 'status',
  chip: 'chip',
  booster: 'booster',
  avatar: 'avatar',
  badge: 'tester badge',
};

/** One colour per contributor, so a stacked bar and its legend always agree. */
export const ENGINE_BOOST_COLOR: Record<EngineSpeedBoostKey, string> = {
  engineLevel: 'var(--color-electric-purple)',
  speedLevel: 'var(--color-electric-pink)',
  status: 'var(--color-gold)',
  chip: 'var(--color-teal)',
  booster: 'var(--color-orange)',
  avatar: 'var(--color-pink)',
  badge: 'var(--color-success)',
};

export const ENGINE_BOOST_ICON: Record<EngineSpeedBoostKey, LucideIcon> = {
  engineLevel: Layers,
  speedLevel: Zap,
  status: Crown,
  chip: Cpu,
  booster: Rocket,
  avatar: UserRound,
  badge: BadgeCheck,
};
