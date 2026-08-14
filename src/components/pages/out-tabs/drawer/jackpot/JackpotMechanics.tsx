'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useJackpotDisplayConfig } from '@/hooks/useJackpotDisplayConfig';

/**
 * The mechanic, folded away. Three explainer cards used to own a whole screen
 * between the pot and the drops feed — a player reads that text once, if ever,
 * so it now costs one row until asked for.
 */
export function JackpotMechanics() {
  const t = useAppTranslations();
  const jackpot = useJackpotDisplayConfig();
  const [open, setOpen] = useState(false);

  const steps = [
    {
      title: t('jackpot step grow title'),
      text: t('jackpot step grow text', { percent: jackpot.accrualPercent }),
    },
    { title: t('jackpot step arm title'), text: t('jackpot step arm text') },
    { title: t('jackpot step drop title'), text: t('jackpot step drop text') },
  ];

  return (
    <section className="border-b border-white/5">
      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-4 text-start"
      >
        <span className="text-[13px] font-bold text-white">{t('how it works')}</span>
        <ChevronDown
          size={18}
          aria-hidden
          className={`text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ol className="animate-fade-in flex flex-col gap-3 pb-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-3">
              <span className="w-6 flex-shrink-0 pt-0.5 text-[11px] font-black tabular-nums text-white/25">
                {`0${index + 1}`}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px] font-bold text-white">{step.title}</span>
                <span className="text-white-secondary text-[12px] font-medium leading-snug">
                  {step.text}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
