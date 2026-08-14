'use client';

import { useState } from 'react';
import { FileText, House, type LucideIcon, ShoppingBag, Ticket, Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

/**
 * Three ways to leave a hole in the bar where the active tab stands, so the
 * disc sits in empty space instead of on top of a solid strip.
 */
export type LabTabBarNotchedVariant = 'cradle' | 'scoop' | 'gap';

export interface LabTabBarNotchedProps {
  variant: LabTabBarNotchedVariant;
  className?: string;
}

type LabTabKey = 'tickets' | 'tournaments' | 'home' | 'market' | 'tasks';

/** The five live tabs, in the live order. */
const TABS: readonly { key: LabTabKey; Icon: LucideIcon }[] = [
  { key: 'tickets', Icon: Ticket },
  { key: 'tournaments', Icon: Trophy },
  { key: 'home', Icon: House },
  { key: 'market', Icon: ShoppingBag },
  { key: 'tasks', Icon: FileText },
];

/** The bar is drawn in px, not in ems: the cut is a path, so its space is fixed. */
const BAR_H = 74;
const DISC = 56;
/** Empty space left between the disc and the cut edge. */
const CLEARANCE = 6;
const CUT_R = DISC / 2 + CLEARANCE;
/** Width of the drawn piece that carries the cut; the flats meet it either side. */
const PIECE_W = 120;
/** Radius of the two corners where the cut returns to the top edge. */
const FILLET = 12;
/** Full-height break of the `gap` option. */
const GAP_W = DISC + CLEARANCE * 3;

const centreOf = (index: number) => (index + 0.5) * (100 / TABS.length);

/**
 * The piece of bar that carries the cut: flat top edge, then (optionally) a
 * small corner radius, the arc around the disc, the mirrored corner, flat edge
 * again. `fillet: 0` leaves the arc meeting the edge head-on.
 */
function cutPath(fillet: number): string {
  const cx = PIECE_W / 2;

  if (!fillet) {
    return `M0 0 H${cx - CUT_R} A${CUT_R} ${CUT_R} 0 0 0 ${cx + CUT_R} 0 H${PIECE_W} V${BAR_H} H0 Z`;
  }

  // The corner circle is tangent to the top edge and to the cut, so it sits at
  // height `fillet` and at `CUT_R + fillet` from the centre of the cut.
  const dx = Math.sqrt((CUT_R + fillet) ** 2 - fillet ** 2);
  const edgeX = cx - dx;
  const armX = cx - (CUT_R * dx) / (CUT_R + fillet);
  const armY = (CUT_R * fillet) / (CUT_R + fillet);

  return [
    'M0 0',
    `H${edgeX.toFixed(2)}`,
    `A${fillet} ${fillet} 0 0 1 ${armX.toFixed(2)} ${armY.toFixed(2)}`,
    `A${CUT_R} ${CUT_R} 0 0 0 ${(2 * cx - armX).toFixed(2)} ${armY.toFixed(2)}`,
    `A${fillet} ${fillet} 0 0 1 ${(2 * cx - edgeX).toFixed(2)} 0`,
    `H${PIECE_W}`,
    `V${BAR_H}`,
    'H0',
    'Z',
  ].join(' ');
}

/**
 * A bar with a hole under the active tab. Self-contained on purpose: it holds
 * its own active tab and never navigates, so tapping through the options in the
 * lab cannot leave the page being judged. Tapping moves the hole too — that is
 * the thing to look at.
 */
export function LabTabBarNotched({ variant, className }: LabTabBarNotchedProps) {
  const t = useAppTranslations();
  const [active, setActive] = useState<LabTabKey>('home');

  const activeIndex = TABS.findIndex(tab => tab.key === active);
  const centre = centreOf(activeIndex);
  const ActiveIcon = TABS[activeIndex].Icon;
  const travel =
    'left 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <div className={twMerge('relative', className)} style={{ height: BAR_H }}>
      {variant === 'gap' ? (
        <>
          <span
            aria-hidden
            className="bg-header absolute top-0 bottom-0 start-0 rounded-e-2xl"
            style={{ width: `calc(${centre}% - ${GAP_W / 2}px)`, transition: travel }}
          />
          <span
            aria-hidden
            className="bg-header absolute top-0 end-0 bottom-0 rounded-s-2xl"
            style={{ left: `calc(${centre}% + ${GAP_W / 2}px)`, transition: travel }}
          />
        </>
      ) : (
        <>
          <span
            aria-hidden
            className="bg-header absolute top-0 bottom-0 start-0"
            style={{ width: `calc(${centre}% - ${PIECE_W / 2}px)`, transition: travel }}
          />
          <svg
            aria-hidden
            width={PIECE_W}
            height={BAR_H}
            viewBox={`0 0 ${PIECE_W} ${BAR_H}`}
            className="absolute top-0"
            style={{ left: `calc(${centre}% - ${PIECE_W / 2}px)`, transition: travel }}
          >
            <path d={cutPath(variant === 'cradle' ? FILLET : 0)} fill="var(--color-header)" />
          </svg>
          <span
            aria-hidden
            className="bg-header absolute top-0 end-0 bottom-0"
            style={{ left: `calc(${centre}% + ${PIECE_W / 2}px)`, transition: travel }}
          />
        </>
      )}

      <div className="absolute inset-0 flex items-end">
        {TABS.map(({ key, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className="relative z-1 flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 px-1 pb-4 active:scale-95"
            >
              <Icon
                size={22}
                className={twMerge(
                  'text-white/50 transition-opacity',
                  isActive ? 'opacity-0 duration-100' : 'opacity-100 delay-200 duration-200'
                )}
              />
              <span
                className={twMerge(
                  'max-w-full truncate text-[10px] leading-none font-bold transition-colors duration-300',
                  isActive ? 'text-white' : 'text-white/45'
                )}
              >
                {t(key)}
              </span>
            </button>
          );
        })}
      </div>

      <span
        aria-hidden
        className="flex-center bg-pink-gradient absolute z-2 rounded-full shadow-[0_8px_24px_rgba(222,0,155,0.5)]"
        style={{
          width: DISC,
          height: DISC,
          top: -DISC / 2,
          left: `calc(${centre}% - ${DISC / 2}px)`,
          transition: travel,
        }}
      >
        <span key={active} className="flex-center animate-fade-in">
          <ActiveIcon size={26} className="text-white" />
        </span>
      </span>
    </div>
  );
}
