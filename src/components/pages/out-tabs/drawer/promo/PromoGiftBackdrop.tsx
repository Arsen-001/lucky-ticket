import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { icons } from '@/constants/icons';
import type { StaticImageData } from 'next/image';

interface GiftPiece {
  src: StaticImageData;
  /** Position of the piece's centre, in % of the backdrop box. */
  x: number;
  y: number;
  /** Rendered width in px; height follows the art's own ratio. */
  w: number;
  rotate: number;
  opacity: number;
  blur?: number;
}

/**
 * The prize art itself, scattered behind the screen.
 *
 * Only things a code can actually hold are here — the five ticket tiers, the
 * coin and the Star. Engines, chips and trophies are prettier still, but a
 * player reads a background as a promise, and codes never drop those.
 *
 * Hand-placed, not random, and placed around the card rather than under it: on a
 * 390×844 screen the centred card spans y 27–72%, so that band carries only
 * cropped hints at the extreme edges, while the free space above and below it —
 * the 226px header gap and the 238px foot — carries the field at full strength.
 * Deliberately motionless: animating a full-bleed backdrop is what made the tab
 * screens blink when the drawer opened.
 */
const PIECES: GiftPiece[] = [
  // Above the card.
  { src: icons.coin, x: 34, y: 3, w: 42, rotate: -6, opacity: 0.18, blur: 0.4 },
  { src: icons.goldenTicket, x: 10, y: 8, w: 128, rotate: -16, opacity: 0.26 },
  { src: icons.coin, x: 84, y: 6, w: 64, rotate: 12, opacity: 0.3 },
  { src: icons.telegramStar, x: 55, y: 15, w: 42, rotate: -12, opacity: 0.24 },
  { src: icons.diamondTicket, x: -6, y: 20, w: 112, rotate: 14, opacity: 0.2, blur: 0.3 },
  { src: icons.platinumTicket, x: 94, y: 21, w: 122, rotate: -13, opacity: 0.22 },

  // Beside the card — cropped by the edge, they only hint.
  { src: icons.silverTicket, x: -8, y: 38, w: 96, rotate: -12, opacity: 0.1, blur: 0.5 },
  { src: icons.coin, x: 104, y: 50, w: 48, rotate: 0, opacity: 0.09, blur: 0.5 },
  { src: icons.telegramStar, x: -4, y: 63, w: 32, rotate: 16, opacity: 0.08, blur: 0.5 },

  // Below the card.
  { src: icons.coin, x: 62, y: 79, w: 70, rotate: -8, opacity: 0.32 },
  { src: icons.platinumTicket, x: 20, y: 84, w: 130, rotate: -11, opacity: 0.28 },
  { src: icons.bronzeTicket, x: 90, y: 87, w: 120, rotate: 15, opacity: 0.24 },
  { src: icons.telegramStar, x: 9, y: 94, w: 38, rotate: -20, opacity: 0.24 },
  { src: icons.goldenTicketOverlap, x: 38, y: 96, w: 126, rotate: 8, opacity: 0.24, blur: 0.3 },
  { src: icons.diamondTicket, x: 92, y: 99, w: 112, rotate: -10, opacity: 0.18, blur: 0.4 },
];

export interface PromoGiftBackdropProps {
  className?: string;
}

export function PromoGiftBackdrop({ className }: PromoGiftBackdropProps) {
  return (
    <div
      aria-hidden
      className={twMerge('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      {/* Warm glow where the coupon sits, so the art reads as light falling on it. */}
      <span
        className="absolute -top-24 left-1/2 h-72 w-[22rem] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(closest-side, rgba(219,52,158,0.22) 0%, rgba(140,60,220,0.12) 55%, transparent 100%)',
        }}
      />
      <span
        className="absolute -bottom-20 left-1/2 h-80 w-[26rem] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(closest-side, rgba(248,189,62,0.13) 0%, transparent 100%)',
        }}
      />

      {PIECES.map((piece, index) => (
        <Image
          key={index}
          src={piece.src}
          alt=""
          aria-hidden
          className="absolute h-auto -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.w,
            opacity: piece.opacity,
            rotate: `${piece.rotate}deg`,
            filter: piece.blur ? `blur(${piece.blur}px)` : undefined,
          }}
        />
      ))}

      {/* Vignette: only the far corners, since the art now lives at the top and
          bottom of the screen — the old one centred at 38% dimmed exactly the
          two bands that are meant to carry it. */}
      <span
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(135% 88% at 50% 50%, transparent 58%, rgba(15,13,32,0.45) 100%)',
        }}
      />
    </div>
  );
}
