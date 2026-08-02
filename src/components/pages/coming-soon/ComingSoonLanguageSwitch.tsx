'use client';

import Image from 'next/image';
import { useTransition } from 'react';
import { twMerge } from 'tailwind-merge';
import { useGetAvailableLanguages, type Language } from '@/hooks/useGetAvailableLanguages';
import { setAppLocale } from '@/services/locale';
import type { LocaleType } from '@/types/types/locale.types';

export interface ComingSoonLanguageSwitchProps {
  className?: string;
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
export function ComingSoonLanguageSwitch({ className }: ComingSoonLanguageSwitchProps) {
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
    <div className={twMerge('flex items-center justify-center gap-2', className)}>
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
              <Image src={lang.flag} alt={lang.name} className="h-full w-full object-cover" />
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
