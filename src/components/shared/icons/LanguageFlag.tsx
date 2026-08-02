import Image, { type StaticImageData } from 'next/image';
import { twMerge } from 'tailwind-merge';

export interface LanguageFlagProps {
  /** Flag artwork from `flags.constants` — always an SVG static import. */
  flag: StaticImageData;
  /** Localized language name; the flag's only accessible text. */
  name: string;
  className?: string;
  classNames?: {
    image?: string;
  };
}

/**
 * The flag next to a language name (settings list, onboarding step, anywhere a
 * locale is offered).
 *
 * It exists to own one detail: `unoptimized`. The flags are SVGs, and Next's
 * image optimizer answers 400 for SVG unless `dangerouslyAllowSVG` is on — which
 * it deliberately is not, since that switch would also apply to every remote
 * host in `next.config`. In dev the optimizer passes SVG through, so an
 * optimized flag looks right locally and renders an empty box in production;
 * that is exactly how both flag rows shipped broken. Nothing to optimize anyway
 * — these are ~1 KB of first-party vector.
 *
 * A `span`, not a `div`: every current caller puts it inside a `<button>`.
 */
export function LanguageFlag({ flag, name, className, classNames }: LanguageFlagProps) {
  return (
    <span
      className={twMerge(
        'border-white/15 block h-9 w-12 flex-shrink-0 overflow-hidden rounded-md border',
        className
      )}
    >
      <Image
        src={flag}
        alt={name}
        unoptimized
        className={twMerge('h-full w-full object-cover', classNames?.image)}
      />
    </span>
  );
}
