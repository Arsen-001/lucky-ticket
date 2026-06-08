'use client';

import type { ReactNode } from 'react';
import { Coins, Crosshair, PartyPopper } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { appConfig } from '@/config/app.config';

interface Step {
  icon: ReactNode;
  title: string;
  text: string;
}

export function JackpotHowItWorks() {
  const t = useAppTranslations();

  const steps: Step[] = [
    {
      icon: <Coins size={18} />,
      title: t('jackpot step grow title'),
      text: t('jackpot step grow text', { percent: appConfig.jackpot.accrualPercent }),
    },
    {
      icon: <Crosshair size={18} />,
      title: t('jackpot step arm title'),
      text: t('jackpot step arm text'),
    },
    {
      icon: <PartyPopper size={18} />,
      title: t('jackpot step drop title'),
      text: t('jackpot step drop text'),
    },
  ];

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="px-1 text-sm font-bold text-white">{t('how it works')}</h2>
      <ul className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <li
            key={index}
            className="bg-background-overlay animate-slide-in-bottom flex items-center gap-3 rounded-2xl border border-white/5 px-3.5 py-3"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="bg-electric-pink/15 text-electric-pink flex-center h-9 w-9 flex-shrink-0 rounded-xl">
              {step.icon}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-bold text-white">{step.title}</span>
              <span className="text-white-secondary text-[12px] font-medium leading-snug">
                {step.text}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
