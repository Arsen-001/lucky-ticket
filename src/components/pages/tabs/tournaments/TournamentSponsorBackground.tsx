'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import type { TournamentSponsor } from '@/types/interfaces/tournaments.interfaces';

export interface TournamentSponsorBackgroundProps {
  sponsor: TournamentSponsor;
  className?: string;
}

/** Top-right anchor of the spiderweb — spokes fan down-left into the card. */
const CORNER = { x: 120, y: 0 };
const ANGLES = [94, 108, 122, 136, 150, 164, 178];
const RINGS = [24, 50, 78, 110, 144];
const MAX_R = RINGS[RINGS.length - 1];

const toPoint = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: CORNER.x + r * Math.cos(a), y: CORNER.y + r * Math.sin(a) };
};

/**
 * Background layer for a sponsored tournament card, sitting behind the content
 * (`z-0`; the card lifts its content to `z-10`). Two modes:
 *   • a chosen banner image (`bannerUrl`) under a dark wash for legibility, or
 *   • the default abstract **spiderweb** ("паутина") woven from the top-right
 *     corner over the card's purple skin.
 */
export function TournamentSponsorBackground({
  sponsor,
  className,
}: TournamentSponsorBackgroundProps) {
  const layer = twMerge('absolute inset-0 z-0 overflow-hidden rounded-[inherit]', className);

  if (sponsor.bannerUrl) {
    return (
      <div className={layer} aria-hidden>
        <Image
          src={sponsor.bannerUrl}
          alt=""
          fill
          unoptimized
          sizes="320px"
          className="object-cover"
        />
        {/* Dark wash so the white title + logo stay legible over any banner */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
      </div>
    );
  }

  return (
    <div className={layer} aria-hidden>
      <svg
        viewBox="0 0 120 120"
        preserveAspectRatio="xMaxYMin slice"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <g
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {ANGLES.map((deg, i) => {
            const p = toPoint(deg, MAX_R);
            return (
              <line
                key={`spoke-${i}`}
                x1={CORNER.x}
                y1={CORNER.y}
                x2={p.x.toFixed(2)}
                y2={p.y.toFixed(2)}
              />
            );
          })}
          {RINGS.map((r, i) => {
            const points = ANGLES.map(deg => {
              const p = toPoint(deg, r);
              return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
            }).join(' ');
            return <polyline key={`ring-${i}`} points={points} />;
          })}
        </g>
      </svg>
    </div>
  );
}
