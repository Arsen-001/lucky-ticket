import { twMerge } from 'tailwind-merge';

export interface TabBarCutProps {
  /**
   * Horizontal centre of the cut, in percent of the bar — the middle of the
   * active tab's column. `null` leaves the bar whole, which is what a route
   * outside the five tabs gets: no disc stands there, so no hole either.
   */
  centre: number | null;
  className?: string;
}

/** Height of the band the cut is drawn in; below it the bar is a plain block. */
const BAND = 40;
/** Half of the disc, plus the empty space left around it. */
const CUT_R = 34;
/** Width of the drawn piece that carries the cut; the flats meet it either side. */
const PIECE_W = 120;
/** Radius of the two corners where the cut returns to the top edge. */
const FILLET = 12;

/**
 * The cut: flat top edge, a small corner radius, the arc around the disc, the
 * mirrored corner, flat edge again — then filled down to the bottom of the band.
 * The corner circle is tangent to both the top edge and the arc, so it sits at
 * height `FILLET` and at `CUT_R + FILLET` from the centre of the arc.
 */
const CUT_PATH = (() => {
  const cx = PIECE_W / 2;
  const dx = Math.sqrt((CUT_R + FILLET) ** 2 - FILLET ** 2);
  const edgeX = cx - dx;
  const armX = cx - (CUT_R * dx) / (CUT_R + FILLET);
  const armY = (CUT_R * FILLET) / (CUT_R + FILLET);

  return [
    'M0 0',
    `H${edgeX.toFixed(2)}`,
    `A${FILLET} ${FILLET} 0 0 1 ${armX.toFixed(2)} ${armY.toFixed(2)}`,
    `A${CUT_R} ${CUT_R} 0 0 0 ${(2 * cx - armX).toFixed(2)} ${armY.toFixed(2)}`,
    `A${FILLET} ${FILLET} 0 0 1 ${(2 * cx - edgeX).toFixed(2)} 0`,
    `H${PIECE_W}`,
    `V${BAND}`,
    'H0',
    'Z',
  ].join(' ');
})();

/**
 * How the hole travels when another tab is tapped — same curve as the disc.
 *
 * The offset animated here is `inset-inline-start`, not `left`: `centre` counts
 * tab COLUMNS, and in Arabic and Persian the row is laid out from the other
 * edge, so the hole has to be measured from the same edge the tabs start at.
 */
const TRAVEL =
  'inset-inline-start 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * The painted surface of the tab bar, with a hole under the active tab so the
 * raised disc stands in empty space and the page shows through around it.
 *
 * It is three pieces wide rather than one masked block: the arc has to keep its
 * radius whatever the screen width, and a mask stretched to the bar would turn
 * it into an ellipse. The band that carries the cut is a fixed 40px tall for the
 * same reason; everything below it is a plain block that grows with the
 * Telegram inset.
 */
export function TabBarCut({ centre, className }: TabBarCutProps) {
  if (centre === null) {
    return <span aria-hidden className={twMerge('bg-header absolute inset-0', className)} />;
  }

  const pieceLeft = `calc(${centre}% - ${PIECE_W / 2}px)`;

  return (
    <span aria-hidden className={twMerge('absolute inset-0', className)}>
      <span
        className="bg-header absolute top-0 start-0"
        style={{ height: BAND, width: pieceLeft, transition: TRAVEL }}
      />
      <svg
        width={PIECE_W}
        height={BAND}
        viewBox={`0 0 ${PIECE_W} ${BAND}`}
        className="absolute top-0"
        style={{ insetInlineStart: pieceLeft, transition: TRAVEL }}
      >
        <path d={CUT_PATH} fill="var(--color-header)" />
      </svg>
      <span
        className="bg-header absolute top-0 end-0"
        style={{
          height: BAND,
          insetInlineStart: `calc(${centre}% + ${PIECE_W / 2}px)`,
          transition: TRAVEL,
        }}
      />
      {/* Everything under the band, carrying the bar's two corner lights. The
          gradients are laid out over the whole bar and shifted up by the band,
          so they land where they did when the bar was a single block. */}
      <span
        className="bg-header absolute end-0 bottom-0 start-0 overflow-hidden"
        style={{ top: BAND }}
      >
        <span
          className="absolute end-0 bottom-0 start-0 bg-[radial-gradient(120%_80%_at_0%_100%,rgba(222,0,155,0.08),transparent_60%),radial-gradient(120%_80%_at_100%_0%,rgba(248,189,62,0.06),transparent_55%)]"
          style={{ top: -BAND }}
        />
      </span>
    </span>
  );
}
