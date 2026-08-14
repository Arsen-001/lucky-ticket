'use client';

import { Check, Globe } from 'lucide-react';
import { useTransition } from 'react';
import { twMerge } from 'tailwind-merge';
import { LanguageFlag } from '@/components/shared/icons/LanguageFlag';
import { useGetAvailableLanguages, type Language } from '@/hooks/useGetAvailableLanguages';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { setAppLocale } from '@/services/locale';
import type { LocaleType } from '@/types/types/locale.types';
import { staggerMs } from '@/utils/global/animation.utils';

export default function LanguagesPage() {
  const t = useAppTranslations();
  const { languages, currentLocale } = useGetAvailableLanguages();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (code: string) => {
    if (code === currentLocale) return;
    startTransition(async () => {
      await setAppLocale(code as LocaleType);
      // A full reload, not router.refresh(): refresh only re-renders the route
      // you are standing on, while every other screen you already visited stays
      // in the client router cache as the payload rendered under the OLD
      // locale. Those screens then keep reading the old `useLocale()` — which
      // is how «Пригласить друзей» could still send lang=en long after the app
      // had been switched to German.
      window.location.reload();
    });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <div
        className="shine-card relative overflow-hidden rounded-2xl p-3"
        style={{ ['--shine-card-accent' as string]: 'var(--color-electric-pink)' }}
      >
        <span
          aria-hidden
          className="bg-electric-pink/12 pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl"
        />
        <div className="relative flex items-center gap-3">
          <div className="bg-electric-pink/15 ring-electric-pink/30 flex-center h-10 w-10 flex-shrink-0 rounded-xl ring-1">
            <Globe size={20} className="text-electric-pink" strokeWidth={2.2} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 className="text-sm font-extrabold leading-tight text-white">
              {t('choose your language')}
            </h2>
            <p className="text-pink-secondary truncate text-[11px]">{t('language description')}</p>
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {languages.map((lang: Language, index) => {
          const isActive = lang.code === currentLocale;
          return (
            <li key={lang.code}>
              <button
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isPending}
                style={{
                  animationDelay: `${staggerMs(index, 60)}ms`,
                  ...(isActive
                    ? { ['--shine-card-accent' as string]: 'var(--color-electric-pink)' }
                    : {}),
                }}
                className={twMerge(
                  'animate-slide-in-bottom relative flex w-full items-center gap-3 overflow-hidden rounded-2xl p-3 text-start transition-all active:scale-99 disabled:opacity-60',
                  isActive ? 'shine-card' : 'bg-background-overlay'
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
                    style={{
                      background:
                        'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)',
                    }}
                  />
                )}
                <LanguageFlag flag={lang.flag} name={lang.name} className="relative" />
                <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={twMerge(
                      'truncate text-sm font-bold',
                      isActive ? 'text-white' : 'text-white/85'
                    )}
                  >
                    {lang.nativeName}
                  </span>
                  <span className="text-pink-secondary truncate text-[11px] font-semibold">
                    {lang.name}
                  </span>
                </div>
                {isActive ? (
                  <span className="bg-pink-gradient flex-center relative h-7 w-7 flex-shrink-0 rounded-full">
                    <Check size={14} className="text-white" strokeWidth={2.8} />
                  </span>
                ) : (
                  <span className="text-pink-secondary relative text-[10px] font-bold uppercase tracking-wider">
                    {lang.code}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {isPending && (
        <span className="text-pink-secondary mt-1 text-center text-[11px] font-semibold">
          {t('language applied')}
        </span>
      )}
    </div>
  );
}
