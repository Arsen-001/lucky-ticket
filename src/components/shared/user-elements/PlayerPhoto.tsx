import { twMerge } from 'tailwind-merge';

export interface PlayerPhotoProps {
  src: string;
  alt: string;
  /** Box side in px — mirrored into the element so the layout does not jump. */
  size: number;
  className?: string;
  /** The first avatar on screen is worth fetching eagerly; the rest are not. */
  eager?: boolean;
}

/**
 * A player's photo — always a plain `<img>`, never `next/image`.
 *
 * The reason is the same one `MarketItemImage` states for storefront art: the
 * URL comes from outside this repo and its host cannot be listed in advance.
 * A live player's photo is Telegram's; a crowd row's is whatever the admin
 * panel put there — an uploaded Vercel Blob link, or a link pasted from any
 * site at all. `next/image` refuses every host missing from
 * `images.remotePatterns`: the optimizer answers **400** and the avatar is a
 * blank circle, while the file itself opens fine — which is exactly how this
 * was found on 24.08.2026, with the crowd's faces visible in the panel and
 * absent from the leaderboard.
 *
 * The optimizer is no loss here: avatars are 40–140 px and already arrive as
 * small webp files.
 */
export function PlayerPhoto({ src, alt, size, className, eager = false }: PlayerPhotoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      className={twMerge('object-cover', className)}
    />
  );
}
