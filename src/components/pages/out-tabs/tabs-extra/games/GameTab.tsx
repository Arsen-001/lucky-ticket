'use client';

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface GameTabProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Плитка выбора игры в разделе «Игры».
 *
 * Выбранная горит, вторая приглушена, но остаётся читаемой: это переключатель,
 * а не «одна доступна, другая нет».
 */
export function GameTab({ title, subtitle, icon, active, onClick, className }: GameTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      // Непрозрачная подложка под тинт — на атмосферном фоне полупрозрачная
      // плитка становится окном и берёт яркость неба.
      style={{ backgroundColor: 'var(--color-background)' }}
      className={twMerge(
        'flex flex-col items-start gap-1 rounded-2xl border p-3 text-start transition-all active:scale-[0.98]',
        active
          ? 'border-electric-purple bg-gradient-to-br from-electric-purple/25 to-transparent'
          : 'border-white/10 opacity-70',
        className
      )}
    >
      <span
        className={twMerge(
          'flex-center h-9 w-9 rounded-xl',
          active ? 'bg-electric-purple/25 text-white' : 'bg-white/5 text-pink-secondary'
        )}
      >
        {icon}
      </span>
      <span className="text-sm font-extrabold leading-tight">{title}</span>
      <span className="text-pink-secondary text-[10px] leading-tight">{subtitle}</span>
    </button>
  );
}
