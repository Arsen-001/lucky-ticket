'use client';

import Image from 'next/image';
import { useTransition } from 'react';
import { twMerge } from 'tailwind-merge';
import { useGetAvailableLanguages, type Language } from '@/hooks/useGetAvailableLanguages';
import { setAppLocale } from '@/services/locale';
import type { CSSProperties } from 'react';
import type { LocaleType } from '@/types/types/locale.types';

export interface ComingSoonLanguageSwitchProps {
  className?: string;
  /** Carries the screen's entry-animation delay. */
  style?: CSSProperties;
}

/**
 * Compact language row for the pre-launch screen.
 *
 * The gate renders before the app boots, so none of the usual places to pick a
 * language exist yet (the drawer, the onboarding step) — without this every
 * visitor would read the launch date in English regardless of where they are.
 * Reloads rather than `router.refresh()` for the same reason the drawer picker
 * does: the locale is resolved server-side from the cookie.
 */
export function ComingSoonLanguageSwitch({ className, style }: ComingSoonLanguageSwitchProps) {
  const { languages, currentLocale } = useGetAvailableLanguages();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (code: LocaleType) => {
    if (code === currentLocale) return;
    startTransition(async () => {
      await setAppLocale(code);
      window.location.reload();
    });
  };

  return (
    <div className={twMerge('flex items-center justify-center gap-2', className)} style={style}>
      {languages.map((lang: Language) => {
        const isActive = lang.code === currentLocale;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isPending}
            aria-current={isActive || undefined}
            className={twMerge(
              'flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all active:scale-99 disabled:opacity-60',
              isActive
                ? 'border-electric-pink/60 bg-electric-pink/10'
                : 'border-white/10 bg-white/5'
            )}
          >
            <span className="border-white/15 h-4 w-6 overflow-hidden rounded-sm border">
              {/* `unoptimized`, unlike the app's other flag rows: the flags are
                  SVGs, and the image optimizer answers 400 for SVG unless
                  `dangerouslyAllowSVG` is on — so an optimized flag renders
                  blank in production while looking fine in dev. Nothing to gain
                  either way; these are ~1 KB of first-party vector. */}
              <Image
                src={lang.flag}
                alt={lang.name}
                unoptimized
                className="h-full w-full object-cover"
              />
            </span>
            <span
              className={twMerge(
                'text-[11px] font-extrabold uppercase tracking-wider',
                isActive ? 'text-white' : 'text-white/70'
              )}
            >
              {lang.code}
            </span>
          </button>
        );
      })}
    </div>
  );
}
