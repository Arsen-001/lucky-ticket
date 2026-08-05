import { cloneElement, type CSSProperties, type ReactElement } from 'react';
import { Button } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';
import '@/styles/components/tab-bar-item.css';
import type { LucideProps } from 'lucide-react';

export interface TabBarItemProps {
  active: boolean;
  onClick?: () => void;
  icon: ReactElement<LucideProps>;
  name: string;
  className?: string;
  style?: CSSProperties;
  flightTarget?: string;
  /** Tear line shared with the stub on the left. The first stub has none. */
  perforated?: boolean;
}

/**
 * One stub of the ticket the tab bar is made of.
 *
 * The active tab is not a chip laid over the bar — it is the stub torn off it:
 * lit from its own tear line downward and lifted 2px out of the strip. That is
 * why every label can stay visible (the old chip had to expand sideways to make
 * room for one, and capped "Tournaments" at 26vw).
 */
export function TabBarItem({
  active,
  onClick,
  name,
  icon,
  className,
  style,
  flightTarget,
  perforated = true,
}: TabBarItemProps) {
  return (
    <Button
      variant="transparent"
      onClick={onClick}
      style={style}
      data-flight-target={flightTarget}
      aria-current={active ? 'page' : undefined}
      className={twMerge(
        'relative flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-none px-1 pt-5 pb-1 transition-transform duration-300',
        active && 'tab-bar-stub-active -translate-y-0.5',
        className
      )}
    >
      {perforated && (
        <span aria-hidden className="tab-bar-perforation absolute top-1 bottom-1 left-0 w-px" />
      )}
      {active && (
        <span aria-hidden className="tab-bar-tear-lit absolute top-1.5 right-0 left-0 h-px" />
      )}
      {cloneElement<LucideProps>(icon, { size: 22, strokeWidth: active ? 2.4 : 2 })}
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
