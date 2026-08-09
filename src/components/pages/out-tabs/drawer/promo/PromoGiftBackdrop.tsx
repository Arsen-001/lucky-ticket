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
 * Hand-placed, not random: the card ends 54% down a 390×844 screen, so above
 * that line only the extreme edges carry art — cropped hints that never reach
 * under the input — and everything below it, the 392px the screen used to leave
 * flat and empty, carries the field at full strength. Deliberately motionless:
 * animating a full-bleed backdrop is what made the tab screens blink when the
 * drawer opened.
 */
const PIECES: GiftPiece[] = [
  // Above and beside the card — mostly cropped by the edge, they only hint.
  { src: icons.goldenTicket, x: -4, y: 6, w: 104, rotate: -18, opacity: 0.16, blur: 0.4 },
  { src: icons.coin, x: 96, y: 3, w: 58, rotate: 12, opacity: 0.14 },
  { src: icons.telegramStar, x: 84, y: 13, w: 30, rotate: -14, opacity: 0.1, blur: 0.3 },
  { src: icons.diamondTicket, x: -6, y: 30, w: 88, rotate: 14, opacity: 0.1, blur: 0.5 },
  { src: icons.silverTicket, x: 104, y: 41, w: 96, rotate: -12, opacity: 0.11, blur: 0.5 },
  { src: icons.coin, x: -3, y: 52, w: 44, rotate: 0, opacity: 0.09, blur: 0.4 },

  // Below the card — the part of the screen that used to be empty.
  { src: icons.telegramStar, x: 47, y: 61, w: 42, rotate: 10, opacity: 0.26 },
  { src: icons.goldenTicket, x: 8, y: 64, w: 122, rotate: -14, opacity: 0.18, blur: 0.4 },
  { src: icons.platinumTicket, x: 20, y: 72, w: 130, rotate: -11, opacity: 0.28 },
  { src: icons.bronzeTicket, x: 84, y: 70, w: 120, rotate: 15, opacity: 0.26 },
  { src: icons.coin, x: 62, y: 80, w: 70, rotate: -8, opacity: 0.32 },
  { src: icons.goldenTicketOverlap, x: 30, y: 88, w: 124, rotate: 8, opacity: 0.24, blur: 0.3 },
  { src: icons.telegramStar, x: 9, y: 91, w: 36, rotate: -20, opacity: 0.22, blur: 0.3 },
  { src: icons.diamondTicket, x: 90, y: 92, w: 110, rotate: -10, opacity: 0.2, blur: 0.4 },
  { src: icons.silverTicket, x: 52, y: 98, w: 108, rotate: 13, opacity: 0.16, blur: 0.5 },
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

      {/* Vignette: keeps the field from competing with text near the edges. */}
      <span
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 70% at 50% 38%, transparent 40%, rgba(15,13,32,0.55) 100%)',
        }}
      />
    </div>
  );
}
