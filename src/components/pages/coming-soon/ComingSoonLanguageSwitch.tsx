'use client';

import { ChevronDown } from 'lucide-react';
import { useState, useTransition } from 'react';
import { twMerge } from 'tailwind-merge';
import { LanguageFlag } from '@/components/shared/icons/LanguageFlag';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetAvailableLanguages } from '@/hooks/useGetAvailableLanguages';
import { setAppLocale } from '@/services/locale';
import { ComingSoonLanguageSheet } from './ComingSoonLanguageSheet';
import type { CSSProperties } from 'react';
import type { LocaleType } from '@/types/types/locale.types';

export interface ComingSoonLanguageSwitchProps {
  className?: string;
  /** Carries the screen's entry-animation delay. */
  style?: CSSProperties;
}

/**
 * Language control for the pre-launch screen: the current language as one
 * compact button, the other seventeen in a sheet behind it.
 *
 * The gate renders before the app boots, so none of the usual places to pick a
 * language exist yet (the drawer, the onboarding step) — without this every
 * visitor would read the launch date in English regardless of where they are.
 *
 * **Not a row of pills.** It was one while there were three languages. At 18 the
 * row measured ~890px inside a 342px column and never wrapped, so the app's
 * scroll container — `overflow-x: auto` — let the entire countdown screen slide
 * sideways: logo, headline and countdown drifting off to the left while the
 * player was only trying to scroll down. Wrapping instead of scrolling would
 * have cost five rows of pills under the invite list. @see ComingSoonLanguageSheet
 *
 * **No reload.** `setAppLocale` is a server action, and Next re-renders this
 * route from the server as part of the action's own response — with the cookie
 * it just set, so the whole screen comes back translated. It used to call
 * `window.location.reload()` on top of that, and the two landed 24ms apart
 * (measured on prod): the texts flipped, then the page visibly reloaded under
 * them — logo, countdown and every entry animation starting over for nothing.
 *
 * The in-app picker (`/languages`) still reloads, and has to: behind the gate a
 * refresh re-renders only the route you are standing on, while every screen you
 * already visited stays in the client router cache as it was rendered under the
 * old locale. There is no such cache here — the gate is one screen, and it is
 * the one being re-rendered.
 */
export function ComingSoonLanguageSwitch({ className, style }: ComingSoonLanguageSwitchProps) {
  const t = useAppTranslations();
  const { languages, currentLocale } = useGetAvailableLanguages();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const current = languages.find(lang => lang.code === currentLocale) ?? languages[0];

  const handleLanguageChange = (code: LocaleType) => {
    setOpen(false);
    if (code === currentLocale) return;
    startTransition(async () => {
      await setAppLocale(code);
    });
  };

  return (
    <div className={twMerge('flex w-full justify-center', className)} style={style}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('choose your language')}
        className="flex max-w-full items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-3 pe-3.5 ps-4 transition-all active:scale-99 disabled:opacity-60"
      >
        <LanguageFlag flag={current.flag} name={current.name} className="h-5 w-7 rounded-sm" />
        <span className="truncate text-[13px] font-bold text-white/85">{current.nativeName}</span>
        <ChevronDown size={16} className="text-white/50 flex-shrink-0" strokeWidth={2.4} />
      </button>

      <ComingSoonLanguageSheet
        open={open}
        onClose={() => setOpen(false)}
        onSelect={handleLanguageChange}
        pending={isPending}
      />
    </div>
  );
}
