import { cloneElement, type CSSProperties, type ReactElement } from 'react';
import { Button } from '@/components/shared/buttons/Button';
import { twMerge } from 'tailwind-merge';
import type { LucideProps } from 'lucide-react';

export interface TabBarCenterItemProps {
  active: boolean;
  onClick?: () => void;
  icon: ReactElement<LucideProps>;
  name: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * The middle tab, lifted out of the ticket strip into a raised disc that hangs
 * over its torn edge. It is the anchor of the bar and the easiest target for a
 * thumb; the ring is painted in the strip's own colour, so the disc reads as
 * punched out of the ticket rather than laid on top of it.
 *
 * It is positioned by the bar, not by the row — the strip masks its own
 * children into the notched shape, and anything inside it would be cut off at
 * the tear edge.
 */
export function TabBarCenterItem({
  active,
  onClick,
  name,
  icon,
  className,
  style,
}: TabBarCenterItemProps) {
  return (
    <Button
      variant="transparent"
      onClick={onClick}
      style={style}
      aria-current={active ? 'page' : undefined}
      className={twMerge('flex flex-col items-center gap-1.5 rounded-none px-1 py-0', className)}
    >
      <span
        className={twMerge(
          'flex-center ring-header size-14 shrink-0 rounded-full ring-[6px] transition-all duration-300',
          active ? 'bg-pink-gradient shadow-[0_8px_24px_rgba(222,0,155,0.5)]' : 'bg-gradient-purple'
        )}
      >
        {cloneElement<LucideProps>(icon, { size: 26, className: 'text-white' })}
      </span>
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
