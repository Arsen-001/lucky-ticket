'use client';

import { useState } from 'react';
import { FileText, House, type LucideIcon, ShoppingBag, Ticket, Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import '@/styles/components/lab-tab-bar.css';

/**
 * The conventional options, kept for comparison. Today's bar is not among them
 * — it is the ticket strip (С1), which now lives in the app itself.
 */
export type LabTabBarVariant = 'labeled' | 'quiet' | 'center' | 'stacked';

export interface LabTabBarProps {
  variant: LabTabBarVariant;
  className?: string;
}

type LabTabKey = 'tickets' | 'tournaments' | 'home' | 'market' | 'tasks';

/** The five live tabs, in the live order — the middle one is Home. */
const TABS: readonly { key: LabTabKey; Icon: LucideIcon }[] = [
  { key: 'tickets', Icon: Ticket },
  { key: 'tournaments', Icon: Trophy },
  { key: 'home', Icon: House },
  { key: 'market', Icon: ShoppingBag },
  { key: 'tasks', Icon: FileText },
];

/** Bar chrome copied from the live `TabBar` so every option is judged on the same surface. */
const SHELL = 'bg-header relative flex items-stretch justify-between gap-1 px-3 pt-3 pb-4';

/** The two corner lights of the live bar. */
const GLOW =
  'pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_100%,rgba(222,0,155,0.08),transparent_60%),radial-gradient(120%_80%_at_100%_0%,rgba(248,189,62,0.06),transparent_55%)]';

/**
 * A bottom bar under comparison. Self-contained on purpose: it holds its own
 * active tab and never navigates, so tapping through the options in the lab
 * cannot leave the page being judged.
 */
export function LabTabBar({ variant, className }: LabTabBarProps) {
  const t = useAppTranslations();
  const [active, setActive] = useState<LabTabKey>('home');

  // ── labeled: every label always on, active marked by colour and a top pip ──
  if (variant === 'labeled') {
    return (
      <div className={twMerge(SHELL, 'overflow-hidden', className)}>
        <span aria-hidden className={GLOW} />
        {TABS.map(({ key, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className="relative z-1 flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-xl px-1 pt-2 pb-1 active:scale-95"
            >
              <span
                aria-hidden
                className={twMerge(
                  'bg-pink-gradient absolute top-0 h-[3px] w-7 rounded-full transition-opacity duration-300',
                  isActive ? 'opacity-100' : 'opacity-0'
                )}
              />
              <Icon
                size={22}
                className={twMerge(
                  'transition-colors duration-300',
                  isActive ? 'text-electric-pink' : 'text-white/55'
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
    );
  }

  // ── quiet: no pill at all — the active tab is the only one that is lit and
  //    the only one that gets a label, which slides open under its icon ───────
  if (variant === 'quiet') {
    return (
      <div className={twMerge(SHELL, 'overflow-hidden', className)}>
        <span aria-hidden className={GLOW} />
        {TABS.map(({ key, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className="relative z-1 flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 px-1 py-2 active:scale-95"
            >
              <span
                aria-hidden
                className={twMerge(
                  'pointer-events-none absolute top-0 h-10 w-10 rounded-full transition-opacity duration-300',
                  isActive ? 'opacity-100' : 'opacity-0'
                )}
                style={{
                  background:
                    'radial-gradient(50% 50% at 50% 50%, rgba(222,0,155,0.45) 0%, transparent 70%)',
                }}
              />
              <Icon
                size={23}
                strokeWidth={isActive ? 2.4 : 2}
                className={twMerge(
                  'relative transition-colors duration-300',
                  isActive ? 'text-white' : 'text-white/45'
                )}
              />
              <span
                className={twMerge(
                  'max-w-full overflow-hidden truncate text-[10px] leading-none font-bold text-white transition-all duration-300',
                  isActive ? 'max-h-4 opacity-100' : 'max-h-0 opacity-0'
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

  // ── center: Home lifted out of the row into a raised button ────────────────
  if (variant === 'center') {
    return (
      <div className={twMerge(SHELL, 'items-end', className)}>
        <span aria-hidden className={twMerge(GLOW, 'overflow-hidden')} />
        {TABS.map(({ key, Icon }) => {
          const isActive = active === key;

          if (key === 'home') {
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className="relative z-1 flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 active:scale-95"
              >
                <span
                  className={twMerge(
                    'flex-center ring-header size-14 shrink-0 rounded-full ring-[6px] transition-all duration-300 -mt-7',
                    isActive
                      ? 'bg-pink-gradient shadow-[0_8px_24px_rgba(222,0,155,0.5)]'
                      : 'bg-gradient-purple'
                  )}
                >
                  <Icon size={26} className="text-white" />
                </span>
                <span
                  className={twMerge(
                    'text-[10px] leading-none font-bold',
                    isActive ? 'text-white' : 'text-white/45'
                  )}
                >
                  {t(key)}
                </span>
              </button>
            );
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className="relative z-1 flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1.5 px-1 pt-2 pb-0 active:scale-95"
            >
              <Icon
                size={22}
                className={twMerge(
                  'transition-colors duration-300',
                  isActive ? 'text-electric-pink' : 'text-white/50'
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
    );
  }

  // ── stacked: today's chip, but it grows DOWNWARD — the label sits under the
  //    icon, so "Tournaments" no longer has to fit across the bar ─────────────
  return (
    <div className={twMerge(SHELL, 'items-center overflow-hidden', className)}>
      <span aria-hidden className={GLOW} />
      {TABS.map(({ key, Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={twMerge(
              'relative z-1 flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-all duration-300 active:scale-95',
              isActive && 'lab-tab-flow shadow-[0_4px_18px_rgba(222,0,155,0.45)]'
            )}
          >
            <Icon size={22} className={isActive ? 'text-white' : 'text-white/50'} />
            <span
              className={twMerge(
                'max-w-full overflow-hidden truncate text-[10px] leading-none font-bold text-white transition-all duration-300',
                isActive ? 'max-h-4 opacity-100' : 'max-h-0 opacity-0'
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
