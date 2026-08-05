import { cloneElement, type CSSProperties, type ReactElement } from 'react';
import { Button } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';
import type { LucideProps } from 'lucide-react';

export interface TabBarItemProps {
  active: boolean;
  onClick?: () => void;
  icon: ReactElement<LucideProps>;
  name: string;
  className?: string;
  style?: CSSProperties;
  flightTarget?: string;
}

/**
 * One of the four tabs that stay in the row. The fifth — Home — is lifted out
 * of it into `TabBarCenterItem`, so these keep an even, quiet weight: every
 * label is always on, and the active one is marked by colour alone.
 */
export function TabBarItem({
  active,
  onClick,
  name,
  icon,
  className,
  style,
  flightTarget,
}: TabBarItemProps) {
  return (
    <Button
      variant="transparent"
      onClick={onClick}
      style={style}
      data-flight-target={flightTarget}
      aria-current={active ? 'page' : undefined}
      className={twMerge(
        'relative flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-none px-1 pt-2 pb-0',
        className
      )}
    >
      {cloneElement<LucideProps>(icon, {
        size: 22,
        className: twMerge(
          'transition-colors duration-300',
          active ? 'text-electric-pink' : 'text-white/50'
        ),
      })}
      <span
        className={twMerge(
          'max-w-full truncate text-[10px] leading-none font-bold transition-colors duration-300',
          active ? 'text-white' : 'text-white/45'
        )}
      >
        {name}
      </span>
    </Button>
  );
}
