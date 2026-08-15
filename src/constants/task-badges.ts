import { TaskRarity } from '@/types/enums/tasks.enums';
import { tierAccentColors } from '@/constants/tier-colors';

/**
 * The medal a one-time achievement wears on the tasks screen.
 *
 * The same badge art the profile's achievement wall uses (`Achievement` →
 * `taskBadgeMap`), keyed by the task's own rarity: a Gold achievement is the
 * gold badge in both places, so a player who saw a badge on their profile
 * recognises the row that pays it.
 *
 * `silver--task-badge` really does carry two dashes — the asset shipped that
 * way and renaming it would break the profile wall's copy of this map.
 */
export const taskRarityBadgeSrc: Record<TaskRarity, string> = {
  [TaskRarity.BRONZE]: '/assets/icons/badges/bronze-task-badge.webp',
  [TaskRarity.SILVER]: '/assets/icons/badges/silver--task-badge.webp',
  [TaskRarity.GOLD]: '/assets/icons/badges/golden-task-badge.webp',
  [TaskRarity.PLATINUM]: '/assets/icons/badges/platinum-task-badge.webp',
};

/**
 * Accent for the frame, the glow and the rarity pill behind that badge — the
 * metal ramp tickets already use, not the achievement-wall progression ramp
 * (which reads silver as cyan and gold as violet). The badge art is metallic,
 * so the ring around it has to be too.
 */
export const taskRarityAccentColors: Record<TaskRarity, string> = {
  [TaskRarity.BRONZE]: tierAccentColors.bronze,
  [TaskRarity.SILVER]: tierAccentColors.silver,
  [TaskRarity.GOLD]: tierAccentColors.gold,
  [TaskRarity.PLATINUM]: tierAccentColors.platinum,
};
