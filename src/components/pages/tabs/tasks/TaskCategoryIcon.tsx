import { twMerge } from 'tailwind-merge';
import {
  Crown,
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
  [TaskCategory.SOCIAL]: Sparkles,
  [TaskCategory.PROFILE]: UserCircle2,
  [TaskCategory.FRIENDS]: Users,
  [TaskCategory.QUEST]: Flag,
  [TaskCategory.MARKET]: ShoppingBag,
  [TaskCategory.STAKES]: PiggyBank,
  [TaskCategory.PREMIUM]: Star,
  [TaskCategory.VIP]: Crown,
  [TaskCategory.ACHIEVEMENTS]: Mountain,
  [TaskCategory.PARTNERS]: Handshake,
};

const GRADIENT_MAP: Record<TaskCategory, string> = {
  [TaskCategory.ADS]: 'from-electric-pink to-pink',
  [TaskCategory.TOURNAMENTS]: 'from-gold to-orange',
  [TaskCategory.SOCIAL]: 'from-electric-purple to-pink',
  [TaskCategory.PROFILE]: 'from-teal to-electric-purple',
  [TaskCategory.FRIENDS]: 'from-pink to-electric-pink',
  [TaskCategory.QUEST]: 'from-diamond to-teal',
  [TaskCategory.MARKET]: 'from-orange to-pink',
  [TaskCategory.STAKES]: 'from-teal to-diamond',
  [TaskCategory.PREMIUM]: 'from-gold to-electric-pink',
  [TaskCategory.VIP]: 'from-platinum to-gold',
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
