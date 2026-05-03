import {
  Bell,
  CheckSquare,
  Crown,
  Gift,
  Layers,
  Trophy,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import type { MessageIds } from '@/types/types/i18n.types';
import type { NotificationType } from '@/types/interfaces/notifications.interfaces';

export interface NotificationTheme {
  icon: LucideIcon;
  bg: string;
  fg: string;
  border: string;
  labelKey: MessageIds;
  actionLabelKey: MessageIds;
}

const fallback: NotificationTheme = {
  icon: Bell,
  bg: 'bg-white/10',
  fg: 'text-white-secondary',
  border: 'border-white/15',
  labelKey: 'system',
  actionLabelKey: 'open',
};

export const NOTIFICATION_THEME: Record<NotificationType, NotificationTheme> = {
  tournament: {
    icon: Trophy,
    bg: 'bg-gold/15',
    fg: 'text-gold',
    border: 'border-gold/30',
    labelKey: 'tournament',
    actionLabelKey: 'go to tournament',
  },
  task: {
    icon: CheckSquare,
    bg: 'bg-electric-pink/15',
    fg: 'text-electric-pink',
    border: 'border-electric-pink/30',
    labelKey: 'task',
    actionLabelKey: 'go to tasks',
  },
  reward: {
    icon: Gift,
    bg: 'bg-gold/15',
    fg: 'text-gold',
    border: 'border-gold/30',
    labelKey: 'reward',
    actionLabelKey: 'open',
  },
  friend: {
    icon: UserPlus,
    bg: 'bg-electric-pink/15',
    fg: 'text-electric-pink',
    border: 'border-electric-pink/30',
    labelKey: 'friends',
    actionLabelKey: 'go to friends',
  },
  stake: {
    icon: Layers,
    bg: 'bg-electric-purple/15',
    fg: 'text-electric-purple',
    border: 'border-electric-purple/30',
    labelKey: 'stakes',
    actionLabelKey: 'go to stakes',
  },
  leaderboard: {
    icon: Crown,
    bg: 'bg-gold/15',
    fg: 'text-gold',
    border: 'border-gold/30',
    labelKey: 'leaderboard',
    actionLabelKey: 'go to leaderboard',
  },
  system: fallback,
};

export const getNotificationTheme = (type?: NotificationType): NotificationTheme =>
  type ? (NOTIFICATION_THEME[type] ?? fallback) : fallback;
