'use client';

import { useState } from 'react';
import { FileText, House, type LucideIcon, ShoppingBag, Ticket, Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import '@/styles/components/lab-tab-bar.css';

/**
 * Options that exist nowhere else, because each one is made of something only
 * this product owns: the ticket it prints, the ball it draws, the cube its
 * engine is.
 */
export type LabTabBarSignatureVariant = 'ticket' | 'ball' | 'cube';

export interface LabTabBarSignatureProps {
  variant: LabTabBarSignatureVariant;
  className?: string;
}

type LabTabKey = 'tickets' | 'tournaments' | 'home' | 'market' | 'tasks';

const TABS: readonly { key: LabTabKey; Icon: LucideIcon }[] = [
  { key: 'tickets', Icon: Ticket },
  { key: 'tournaments', Icon: Trophy },
  { key: 'home', Icon: House },
  { key: 'market', Icon: ShoppingBag },
  { key: 'tasks', Icon: FileText },
];

/** Bar chrome copied from the live `TabBar`, so only the idea differs. */
const SHELL = 'bg-header relative flex items-stretch justify-between px-0 pt-3 pb-4';

/** Percent position of a tab's centre — drives the ball and its beam. */
const centreOf = (index: number) => `${(index + 0.5) * (100 / TABS.length)}%`;

/**
 * A signature bottom bar under comparison. Owns its active tab and never
 * navigates, so tapping through the options stays on the lab page.
 */
export function LabTabBarSignature({ variant, className }: LabTabBarSignatureProps) {
  const t = useAppTranslations();
  const [active, setActive] = useState<LabTabKey>('home');
  const activeIndex = TABS.findIndex(tab => tab.key === active);

  // ── С1 · the bar is a ticket, the active tab is the stub torn off it ──────
  if (variant === 'ticket') {
    return (
      <div className={twMerge(SHELL, 'lab-tab-ticket pt-0', className)}>
        <span aria-hidden className="lab-tab-tear absolute top-1.5 end-0 start-0 h-px" />
        {TABS.map(({ key, Icon }, index) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={twMerge(
                'relative flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 px-1 pt-5 pb-1 transition-transform duration-300',
                isActive && 'lab-tab-stub-active -translate-y-0.5'
              )}
            >
              {index > 0 && (
                <span
                  aria-hidden
                  className="lab-tab-perforation absolute top-1 bottom-1 start-0 w-px"
                />
              )}
              {isActive && (
                <span
                  aria-hidden
                  className="lab-tab-tear-lit absolute top-1.5 end-0 start-0 h-px"
                />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.4 : 2}
                className={twMerge(
                  'transition-colors duration-300',
                  isActive ? 'text-white' : 'text-white/45'
                )}
              />
              <span
                className={twMerge(
                  'max-w-full truncate text-[10px] leading-none font-bold transition-colors duration-300',
                  isActive ? 'text-white' : 'text-white/40'
                )}
              >
                {t(key)}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── С2 · a draw ball rolls along the rail and lights the tab it stops on ──
  if (variant === 'ball') {
    return (
      <div className={twMerge(SHELL, 'overflow-hidden pt-5', className)}>
        <span aria-hidden className="lab-tab-rail absolute top-2 end-4 start-4 h-px" />
        <span
          aria-hidden
          className="lab-tab-beam pointer-events-none absolute top-2 bottom-0 w-24"
          style={{ left: centreOf(activeIndex) }}
        />
        <span
          aria-hidden
          className="lab-tab-ball absolute top-[3px] size-3.5 rounded-full"
          style={{
            left: centreOf(activeIndex),
            ['--lab-roll' as string]: `${activeIndex * 320}deg`,
          }}
        />
        {TABS.map(({ key, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className="relative z-1 flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 px-1 pt-3 pb-1 active:scale-95"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.4 : 2}
                className={twMerge(
                  'transition-colors duration-500',
                  isActive ? 'text-white' : 'text-white/40'
                )}
              />
              <span
                className={twMerge(
                  'max-w-full truncate text-[10px] leading-none font-bold transition-colors duration-500',
                  isActive ? 'text-white' : 'text-white/35'
                )}
              >
                {t(key)}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // ── С3 · the tile is a cube and turns its lit face up when selected ───────
  return (
    <div className={twMerge(SHELL, 'px-3', className)}>
      {TABS.map(({ key, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className="relative flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 px-1 pb-1"
          >
            <span className="lab-tab-cube relative h-10 w-11 shrink-0" data-active={isActive}>
              <span className="lab-tab-cube-inner">
                <span className="lab-tab-cube-face lab-tab-cube-front bg-white/5">
                  <Icon size={22} className="text-white/45" />
                </span>
                <span className="lab-tab-cube-face lab-tab-cube-bottom">
                  <Icon size={22} className="text-white" strokeWidth={2.4} />
                </span>
              </span>
            </span>
            <span
              className={twMerge(
                'max-w-full truncate text-[10px] leading-none font-bold transition-colors duration-500',
                isActive ? 'text-white' : 'text-white/40'
              )}
            >
              {t(key)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
