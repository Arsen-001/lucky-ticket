import { twMerge } from 'tailwind-merge';

export interface MarketItemImageProps {
  src: string;
  alt: string;
  /** Fixed square size in px (for the detail-modal icon slot). Omit to fill the parent. */
  size?: number;
  className?: string;
}

/**
 * A market item's admin-set photo. Plain `<img>` (not next/image) on purpose:
 * the URL is admin-provided from any host — an uploaded Vercel Blob link or a
 * pasted URL — so the next/image `remotePatterns` allow-list can't cover it.
 */
export function MarketItemImage({ src, alt, size, className }: MarketItemImageProps) {
  return (
    <div
      className={twMerge('relative overflow-hidden rounded-2xl', className)}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Contained, not cropped, like the grid card: the box is square but an
          admin uploads any aspect ratio, and `cover` on a 16:9 banner shows its
          middle third only. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-contain" />
    </div>
  );
}
