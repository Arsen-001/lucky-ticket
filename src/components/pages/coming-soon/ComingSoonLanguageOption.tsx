'use client';

import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { LanguageFlag } from '@/components/shared/icons/LanguageFlag';
import { staggerMs } from '@/utils/global/animation.utils';
import type { Language } from '@/hooks/useGetAvailableLanguages';

export interface ComingSoonLanguageOptionProps {
  language: Language;
  active: boolean;
  /** Position in the list — drives the entry stagger only. */
  index: number;
  disabled?: boolean;
  onSelect: () => void;
}

/** One row of the pre-launch language sheet. @see ComingSoonLanguageSheet */
export function ComingSoonLanguageOption({
  language,
  active,
  index,
  disabled,
  onSelect,
}: ComingSoonLanguageOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-current={active || undefined}
      style={{ animationDelay: `${staggerMs(index, 40)}ms` }}
      className={twMerge(
        'animate-slide-in-bottom flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition-all active:scale-99 disabled:opacity-60',
        active ? 'border-electric-pink/60 bg-electric-pink/10' : 'border-white/10 bg-white/5'
      )}
    >
      <LanguageFlag flag={language.flag} name={language.name} className="h-8 w-11" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={twMerge('truncate text-sm font-bold', active ? 'text-white' : 'text-white/85')}
        >
          {language.nativeName}
        </span>
        <span className="text-pink-secondary truncate text-[11px] font-semibold">
          {language.name}
        </span>
      </div>
      {active ? (
        <span className="bg-pink-gradient flex-center h-7 w-7 flex-shrink-0 rounded-full">
          <Check size={14} className="text-white" strokeWidth={2.8} />
        </span>
      ) : (
        <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
          {language.code}
        </span>
      )}
    </button>
  );
}
