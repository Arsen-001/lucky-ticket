import { cloneElement, type CSSProperties, type ReactElement } from 'react';
import { twMerge } from 'tailwind-merge';
import type { LucideProps } from 'lucide-react';

export interface TabBarActiveDiscProps {
  /** Icon of the tab the disc currently stands on. */
  icon: ReactElement<LucideProps>;
  /** Changes with the active tab, so the icon crossfades instead of blinking. */
  iconKey: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * The raised disc that marks the active tab. There is exactly one of it: on a
 * tap it slides along the bar to the tab that was pressed, carrying that tab's
 * icon, and the tab underneath hides its own icon while the disc stands there.
 *
 * It needs no ring of its own — it stands in the hole `TabBarCut` leaves in the
 * bar, and that empty space is what separates it from the surface. The bar
 * positions it (it owns the column geometry) and the disc only knows how it
 * looks. It is inert to pointers: the tab buttons underneath take every tap,
 * and the tab the disc sits on is the one tap that does nothing anyway.
 */
export function TabBarActiveDisc({ icon, iconKey, className, style }: TabBarActiveDiscProps) {
  return (
    <span
      aria-hidden
      style={style}
      className={twMerge(
        'flex-center bg-pink-gradient pointer-events-none absolute z-2 size-14 rounded-full shadow-[0_8px_24px_rgba(222,0,155,0.5)]',
        className
      )}
    >
      <span key={iconKey} className="flex-center animate-fade-in">
        {cloneElement<LucideProps>(icon, { size: 26, className: 'text-white' })}
      </span>
    </span>
  );
}
