import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import '@/styles/components/atmosphere.css';

export interface AtmosphericBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  classNames?: {
    rays?: string;
    dust?: string;
    bokeh?: string;
    vignette?: string;
  };
}

/**
 * Full-bleed cinematic backdrop: a deep indigo→purple radial field with god
 * rays from the upper-right, floating dust and glowing bokeh points — the
 * look of the brand key art, rendered in CSS.
 *
 * Purely decorative, so it is `aria-hidden` and never takes pointer events.
 * Mount it as a sibling of the page content (not inside it) — an ancestor with
 * a transform would turn `fixed` into `absolute` and make it scroll away.
 */
export function AtmosphericBackground({
  className,
  classNames,
  ...rest
}: AtmosphericBackgroundProps) {
  return (
    <div
      aria-hidden
      className={twMerge(
        'atmosphere fixed inset-0 -z-10 overflow-hidden pointer-events-none',
        className
      )}
      {...rest}
    >
      <div className={twMerge('atmosphere-rays', classNames?.rays)} />
      <div className={twMerge('atmosphere-dust', classNames?.dust)} />
      <div className={twMerge('atmosphere-bokeh', classNames?.bokeh)} />
      <div className={twMerge('atmosphere-vignette', classNames?.vignette)} />
    </div>
  );
}
