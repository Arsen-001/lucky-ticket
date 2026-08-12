import { cloneElement, type CSSProperties, type ReactElement } from 'react';
import { Button } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';
import type { LucideProps } from 'lucide-react';
import { ClaimableDot } from '@/components/shared/badges/ClaimableDot';

export interface TabBarItemProps {
  active: boolean;
  onClick?: () => void;
  icon: ReactElement<LucideProps>;
  name: string;
  className?: string;
  style?: CSSProperties;
  flightTarget?: string;
  /** There is something to collect on the screen behind this tab. */
  claimable?: boolean;
  /** Accessible name for the claimable dot — already translated. */
  claimableLabel?: string;
}

/**
 * One tab of the row. All five are equal here: the active one is marked by the
 * raised disc that travels to it (`TabBarActiveDisc`), so while the disc stands
 * on this tab the tab hides its own icon and lends it to the disc. It comes
 * back late enough for the disc to have left, so the two are never seen at once.
 */
export function TabBarItem({
  active,
  onClick,
  name,
  icon,
  className,
  style,
  flightTarget,
  claimable = false,
  claimableLabel,
}: TabBarItemProps) {
  return (
    <Button
      variant="transparent"
      onClick={onClick}
      style={style}
      data-flight-target={flightTarget}
      aria-current={active ? 'page' : undefined}
      className={twMerge(
        // No padding of its own and a tight gap: the label has to sit close
        // under the disc, and every pixel above it pushes the two apart.
        'tap-target relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-none px-1 py-0',
        className
      )}
    >
      {cloneElement<LucideProps>(icon, {
        size: 22,
        className: twMerge(
          'text-white/50 transition-opacity',
          active ? 'opacity-0 duration-100' : 'opacity-100 delay-200 duration-200'
        ),
      })}
      {/* Badged onto the tab's own icon, so it goes when the disc takes the
          icon over: the player is already standing on that screen, where every
          claimable row carries the same dot. */}
      {claimable && !active && (
        <ClaimableDot label={claimableLabel} className="absolute top-0 left-1/2 ml-1.5" />
      )}
      <span
        className={twMerge(
          'max-w-full truncate text-[13px] leading-none font-bold transition-colors duration-300',
          active ? 'text-white' : 'text-white/45'
        )}
      >
        {name}
      </span>
    </Button>
  );
}
