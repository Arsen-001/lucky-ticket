'use client';

import { Globe } from 'lucide-react';
import { BottomSheet } from '@/components/shared/modals/BottomSheet';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useGetAvailableLanguages, type Language } from '@/hooks/useGetAvailableLanguages';
import { ComingSoonLanguageOption } from './ComingSoonLanguageOption';
import type { LocaleType } from '@/types/types/locale.types';

export interface ComingSoonLanguageSheetProps {
  open: boolean;
  onClose: () => void;
  /** Applies the locale; the sheet only reports the choice. */
  onSelect: (code: LocaleType) => void;
  /** A locale change is in flight — the whole list goes inert. */
  pending?: boolean;
}

/**
 * The full language list behind the pre-launch screen's compact trigger.
 *
 * A sheet rather than a row of pills because the catalogue is 18 languages
 * wide: laid out side by side they were ~890px of content inside a 342px
 * column, and the app's scroll container (`overflow-x: auto`) let the *whole
 * countdown screen* slide sideways with them.
 *
 * Store-free on purpose — nothing behind the gate is mounted inside the Redux
 * provider, and `BottomSheet` and its hooks are the overlay pieces that hold no
 * store dependency. @see PreLaunchGate
 */
export function ComingSoonLanguageSheet({
  open,
  onClose,
  onSelect,
  pending,
}: ComingSoonLanguageSheetProps) {
  const t = useAppTranslations();
  const { languages, currentLocale } = useGetAvailableLanguages();

  return (
    <BottomSheet open={open} onClose={onClose} label={t('choose your language')}>
      <div className="bg-background-overlay flex flex-col gap-4 rounded-t-2xl border-t border-white/10 px-5 pb-[calc(var(--tg-inset-bottom)+1.5rem)] pt-7">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="bg-electric-pink/15 ring-electric-pink/30 flex-center h-11 w-11 rounded-2xl ring-1">
            <Globe size={22} className="text-electric-pink" strokeWidth={2.2} />
          </span>
          <h3 className="text-base font-extrabold text-white">{t('choose your language')}</h3>
          <p className="text-white-secondary text-xs leading-relaxed">
            {t('language description')}
          </p>
        </div>

        <ul className="main-scrollbar flex max-h-[52vh] flex-col gap-2 overflow-y-auto pe-1">
          {languages.map((lang: Language, index) => (
            <li key={lang.code}>
              <ComingSoonLanguageOption
                language={lang}
                index={index}
                active={lang.code === currentLocale}
                disabled={pending}
                onSelect={() => onSelect(lang.code)}
              />
            </li>
          ))}
        </ul>
      </div>
    </BottomSheet>
  );
}
