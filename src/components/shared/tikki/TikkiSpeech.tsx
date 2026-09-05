'use client';

import { twMerge } from 'tailwind-merge';
import '@/styles/components/tikki.css';

export interface TikkiSpeechProps {
  text: string;
  className?: string;
}

/**
 * Облако над головой Тикки — одна строка, которая живёт состоянием кликера.
 *
 * Небо над персонажем было пустым на треть экрана: он прижат к чипам снизу,
 * счёт — к шапке, и всё между ними ничем не занято. Реплика делает это небо
 * его, а не пустотой. Облако сидит внутри кнопки героя: тап по нему — тап по
 * Тикки, это одна и та же цель.
 *
 * Центровка физическая (`left` + `translate-x`), не логическая: на ar/fa
 * `start-1/2` уехал бы вправо, а сдвиг остался бы влево.
 *
 * `tikki-speech` — зацепка для контейнерного запроса в `tikki.css`: когда
 * сцене не хватает высоты, облако легло бы на карточку цели, и оно прячется.
 */
export function TikkiSpeech({ text, className }: TikkiSpeechProps) {
  return (
    <span
      aria-hidden
      className={twMerge(
        'tikki-speech animate-fade-in absolute bottom-[calc(100%-10px)] left-1/2 -translate-x-1/2',
        'text-background max-w-[270px] whitespace-nowrap rounded-2xl bg-white/95 px-3.5 py-2',
        'text-center text-[13px] font-extrabold leading-tight shadow-[0_10px_24px_-10px_rgba(0,0,0,0.8)]',
        className
      )}
    >
      {text}
      <span
        aria-hidden
        className="absolute -bottom-[7px] left-1/2 size-3.5 -translate-x-1/2 rotate-45 rounded-[3px] bg-inherit"
      />
    </span>
  );
}
