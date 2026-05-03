'use client';

import Image from 'next/image';
import { Check, Globe } from 'lucide-react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import { useGetAvailableLanguages, type Language } from '@/hooks/useGetAvailableLanguages';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { setAppLocale } from '@/services/locale';
import type { LocaleType } from '@/types/types/locale.types';

export default function LanguagesPage() {
  const t = useAppTranslations();
  const { languages, currentLocale } = useGetAvailableLanguages();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLanguageChange = (code: string) => {
    if (code === currentLocale) return;
    startTransition(async () => {
      await setAppLocale(code as LocaleType);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <div className="bg-purple-gradient card-outlined relative overflow-hidden rounded-2xl p-4">
        <span
          aria-hidden
          className="bg-electric-purple/30 pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
        />
        <div className="relative flex items-center gap-3">
          <div className="bg-electric-pink/20 border-electric-pink/40 flex-center h-11 w-11 flex-shrink-0 rounded-xl border">
            <Globe size={20} className="text-electric-pink" strokeWidth={2.4} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-extrabold leading-tight text-white">
              {t('choose your language')}
            </h2>
            <p className="text-pink-secondary mt-0.5 text-[11px]">{t('language description')}</p>
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
                style={{ animationDelay: `${index * 60}ms` }}
                className={twMerge(
                  'animate-slide-in-bottom relative flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all active:scale-99 disabled:opacity-60',
                  isActive
                    ? 'border-electric-pink/50 bg-electric-pink/10 shadow-[0_0_18px_rgba(222,0,155,0.18)]'
                    : 'bg-background-overlay/50 border-white/5 hover:bg-white/5'
                )}
              >
                <div className="border-white/15 h-9 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                  <Image src={lang.flag} alt={lang.name} className="h-full w-full object-cover" />
                </div>
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
                {isActive ? (
                  <span className="bg-electric-pink/25 border-electric-pink/50 flex-center h-7 w-7 flex-shrink-0 rounded-full border">
                    <Check size={14} className="text-white" strokeWidth={2.8} />
                  </span>
                ) : (
                  <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
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
