'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Globe, Search } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { Button } from '@/components/shared/buttons/Button';
import { DebouncedInput } from '@/components/shared/form-elements/inputs/DebouncedInput';
import { LanguageFlag } from '@/components/shared/icons/LanguageFlag';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetAvailableLanguages, type Language } from '@/hooks/useGetAvailableLanguages';
import { setAppLocale } from '@/services/locale';
import { stringIncludes } from '@/utils/global/string.utils';
import type { LocaleType } from '@/types/types/locale.types';
import { staggerMs } from '@/utils/global/animation.utils';

export interface OnboardingLanguageStepProps {
  /** Fired once the chosen locale is persisted (and the tree refreshed) — starts the tour. */
  onConfirm: () => void;
}

/**
 * First-run language picker shown before the guided tour. Persists the locale
 * cookie and refreshes the server tree so the tour (every string of which is
 * localized) renders in the chosen language. Defaults the selection to the
 * current locale, so a player who just wants English taps "Continue".
 */
export function OnboardingLanguageStep({ onConfirm }: OnboardingLanguageStepProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const { languages, currentLocale } = useGetAvailableLanguages();
  const [selected, setSelected] = useState<LocaleType>(currentLocale as LocaleType);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  // Client-side filter — matches native name, English name, and locale code so
  // the picker stays usable once the catalogue grows (e.g. 15+ languages).
  const filtered = search
    ? languages.filter(lang => stringIncludes([lang.name, lang.nativeName, lang.code], search))
    : languages;

  // Narrowing the search to exactly one language selects it. Otherwise the list
  // shows a single unchecked row while the selection is still whatever it was
  // before the search — type "deu", see only Deutsch, tap Continue, get Russian.
  // Keyed on the query, not on `filtered`: that array is rebuilt every render.
  useEffect(() => {
    if (filtered.length === 1) setSelected(filtered[0].code);
  }, [search]);

  const handleConfirm = () => {
    if (selected === currentLocale) {
      onConfirm();
      return;
    }
    startTransition(async () => {
      await setAppLocale(selected);
      router.refresh();
      onConfirm();
    });
  };

  return (
    <ClientPortal>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[120] flex items-center justify-center px-4"
      >
        <div className="absolute inset-0 bg-[rgba(9,7,18,0.92)] backdrop-blur-sm" />

        <div className="border-electric-pink/30 bg-background-overlay/95 animate-slide-in-bottom relative w-full max-w-[var(--app-modal-max-w)] rounded-2xl border p-5 shadow-[0_18px_60px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md">
          <div className="mb-4 flex flex-col items-center text-center">
            <span className="bg-electric-pink/15 ring-electric-pink/30 flex-center mb-3 h-12 w-12 rounded-2xl ring-1">
              <Globe size={24} className="text-electric-pink" strokeWidth={2.2} />
            </span>
            <h3 className="text-lg font-extrabold text-white">{t('choose your language')}</h3>
            <p className="text-white-secondary mt-1 text-sm leading-relaxed">
              {t('language description')}
            </p>
          </div>

          <DebouncedInput
            name="language-search"
            debounce={150}
            onChange={setSearch}
            placeholder={t('search')}
            prefix={<Search size={18} className="text-white/55 stroke-2" />}
            className="mb-3 border border-white/10 bg-white/5 p-3"
            classNames={{ input: 'text-sm font-medium placeholder:text-white/45' }}
          />

          <div className="main-scrollbar max-h-[42vh] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-white/50">{t('no results found')}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {filtered.map((lang: Language, index) => {
                  const isActive = lang.code === selected;
                  return (
                    <li key={lang.code}>
                      <button
                        type="button"
                        onClick={() => setSelected(lang.code)}
                        disabled={isPending}
                        style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
                        className={twMerge(
                          'animate-slide-in-bottom flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all active:scale-99 disabled:opacity-60',
                          isActive
                            ? 'border-electric-pink/60 bg-electric-pink/10'
                            : 'border-white/10 bg-background-overlay'
                        )}
                      >
                        <LanguageFlag flag={lang.flag} name={lang.name} />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
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
                        {isActive && (
                          <span className="bg-pink-gradient flex-center h-7 w-7 flex-shrink-0 rounded-full">
                            <Check size={14} className="text-white" strokeWidth={2.8} />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Button onClick={handleConfirm} loading={isPending} className="mt-5 w-full">
            {t('continue')}
          </Button>
        </div>
      </div>
    </ClientPortal>
  );
}
