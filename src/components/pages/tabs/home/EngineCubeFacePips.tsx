import { twMerge } from 'tailwind-merge';
import '@/styles/components/engine-cube-face-pips.css';

/** Front · top · back · bottom — the order a downward swipe walks the cube. */
const FACE_COUNT = 4;

export interface EngineCubeFacePipsProps {
  /** Live cube rotation in degrees — drag included, and deliberately unbounded. */
  rotation: number;
  /** Tier colour the current face's mark is painted with. */
  accent: string;
  /** Pulses the rail once, alongside the cube's teaser, until the first rotation. */
  hinting?: boolean;
  className?: string;
}

/**
 * The vertical-axis indicator for {@link EngineCardCube}: four marks, the
 * current face's one grown and tinted. Purely decorative (`aria-hidden`,
 * `pointer-events: none`) — it reports the cube's state, it never drives it.
 */
export function EngineCubeFacePips({
  rotation,
  accent,
  hinting = false,
  className,
}: EngineCubeFacePipsProps) {
  // One 90° step is one face. The cube can be spun any number of turns in
  // either direction, so the rotation is folded back into 0…3 — the double
  // modulo is what keeps a negative angle (swipe up) from landing off-range.
  const face = ((Math.round(rotation / 90) % FACE_COUNT) + FACE_COUNT) % FACE_COUNT;

  return (
    <div
      aria-hidden
      className={twMerge(
        'engine-cube-face-pips',
        hinting && 'engine-cube-face-pips--hinting',
        className
      )}
    >
      {Array.from({ length: FACE_COUNT }).map((_, index) => (
        <span
          key={index}
          className={twMerge(
            'engine-cube-face-pip',
            index === face && 'engine-cube-face-pip--active'
          )}
          style={
            index === face ? { background: accent, boxShadow: `0 0 8px ${accent}` } : undefined
          }
        />
      ))}
    </div>
  );
}
