import { twMerge } from 'tailwind-merge';
import {
  BarChart3,
  Crown,
  Cog,
  Eye,
  Flag,
  Gem,
  Handshake,
  type LucideIcon,
  type LucideProps,
  Mountain,
  PiggyBank,
  ShoppingBag,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  UserCircle2,
  Users,
} from 'lucide-react';
import { TaskCategory } from '@/types/enums/tasks.enums';

export interface TaskCategoryIconProps {
  category: TaskCategory;
  size?: number;
  className?: string;
  iconProps?: LucideProps;
}

const ICON_MAP: Record<TaskCategory, LucideIcon> = {
  [TaskCategory.ADS]: Eye,
  [TaskCategory.TOURNAMENTS]: Trophy,
  [TaskCategory.LEADERBOARD]: BarChart3,
  [TaskCategory.SOCIAL]: Sparkles,
  [TaskCategory.PROFILE]: UserCircle2,
  [TaskCategory.FRIENDS]: Users,
  [TaskCategory.QUEST]: Flag,
  [TaskCategory.MARKET]: ShoppingBag,
  [TaskCategory.ENGINES]: Cog,
  [TaskCategory.TICKETS]: Ticket,
  [TaskCategory.STAKES]: PiggyBank,
  [TaskCategory.STARS]: Star,
  [TaskCategory.PROFILE_STATUS]: Crown,
  [TaskCategory.ACHIEVEMENTS]: Mountain,
  [TaskCategory.PARTNERS]: Handshake,
};

const GRADIENT_MAP: Record<TaskCategory, string> = {
  [TaskCategory.ADS]: 'from-electric-pink to-pink',
  [TaskCategory.TOURNAMENTS]: 'from-gold to-orange',
  [TaskCategory.LEADERBOARD]: 'from-diamond to-electric-purple',
  [TaskCategory.SOCIAL]: 'from-electric-purple to-pink',
  [TaskCategory.PROFILE]: 'from-teal to-electric-purple',
  [TaskCategory.FRIENDS]: 'from-pink to-electric-pink',
  [TaskCategory.QUEST]: 'from-diamond to-teal',
  [TaskCategory.MARKET]: 'from-orange to-pink',
  [TaskCategory.ENGINES]: 'from-platinum to-electric-purple',
  [TaskCategory.TICKETS]: 'from-electric-pink to-pink',
  [TaskCategory.STAKES]: 'from-teal to-diamond',
  [TaskCategory.STARS]: 'from-warning to-gold',
  [TaskCategory.PROFILE_STATUS]: 'from-gold to-platinum',
  [TaskCategory.ACHIEVEMENTS]: 'from-diamond to-electric-purple',
  [TaskCategory.PARTNERS]: 'from-electric-purple to-diamond',
};

export function TaskCategoryIcon({
  category,
  size = 22,
  className,
  iconProps,
}: TaskCategoryIconProps) {
  const Icon = ICON_MAP[category];
  const Gem2: LucideIcon = Gem;
  const Resolved = Icon ?? Gem2;

  return (
    <div
      className={twMerge(
        'flex-center rounded-xl bg-gradient-to-br shadow-lg shadow-black/20',
        GRADIENT_MAP[category],
        className
      )}
      style={{ width: size + 18, height: size + 18 }}
    >
      <Resolved size={size} className="text-white drop-shadow-sm" {...iconProps} />
    </div>
  );
}
