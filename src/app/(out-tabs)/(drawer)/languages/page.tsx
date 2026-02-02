'use client';

import { useState, useTransition } from 'react';
import { type Language, useGetAvailableLanguages } from '@/hooks/useGetAvailableLanguages';
import { GradientSearchInput } from '@/components/pages/out-tabs/drawer/support/GradientSearchInput';
import { HighlightedText } from '@/components/shared/typography/HighlightedText';
import { CheckCircle2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/buttons/Button';
import { filterLanguages } from '@/utils/pages/languages.utils';
import { type LocaleType } from '@/types/types/locale.types';
import { setAppLocale } from '@/services/locale';

export default function LanguagesPage() {
  const { languages, currentLocale } = useGetAvailableLanguages();
  const [searchValue, setSearchValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredLanguages = filterLanguages(languages, searchValue);

  const handleLanguageChange = (code: string) => {
    if (code === currentLocale) return;

    startTransition(async () => {
      await setAppLocale(code as LocaleType);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <GradientSearchInput onChange={setSearchValue} />
      <div className="flex flex-col gap-2">
        {filteredLanguages.map((lang: Language) => (
          <Button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isPending}
            className={twMerge(
              'flex items-center justify-between gap-4 bg-purple-gradient px-4 py-3 rounded-xl transition-all active:opacity-80 disabled:opacity-50',
              lang.code === currentLocale && 'ring-2 ring-pink'
            )}
          >
            <div className="flex flex-col items-start gap-px overflow-hidden">
              <HighlightedText
                highlight={searchValue}
                className="text-white-secondary font-semibold text-base truncate"
              >
                {lang.nativeName}
              </HighlightedText>
              <HighlightedText
                highlight={searchValue}
                className="text-sm text-gray-secondary font-semibold truncate"
              >
                {lang.name}
              </HighlightedText>
            </div>
            {lang.code === currentLocale && (
              <CheckCircle2 size={24} className="text-pink shrink-0" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
