'use client';

import { twMerge } from 'tailwind-merge';
import { DuelPlayerAvatar } from '@/components/pages/out-tabs/tabs-extra/duel/DuelPlayerAvatar';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface DuelSideCardProps {
  name: string;
  avatarUrl?: string;
  ready: boolean;
  className?: string;
}

/**
 * Одна сторона в фазе готовности: кто это и подтвердил ли он.
 *
 * Готовность видно двумя способами сразу — цветом карточки и словом, — потому
 * что на этом экране решение принимают за секунды и читать мелкий текст
 * некогда.
 */
export function DuelSideCard({ name, avatarUrl, ready, className }: DuelSideCardProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge(
        'flex flex-1 flex-col items-center gap-1.5 rounded-2xl border p-3.5 transition-colors duration-300',
        ready
          ? 'border-success-text/50 from-success/15 bg-gradient-to-b to-transparent'
          : 'bg-background-overlay border-white/8',
        className
      )}
    >
      <DuelPlayerAvatar name={name} avatarUrl={avatarUrl} size={52} ready={ready} />
      <span className="max-w-full truncate text-[13px] font-bold">{name}</span>
      <span
        className={twMerge(
          'text-[10px] font-black tracking-[0.1em] uppercase',
          ready ? 'text-success-text' : 'text-disabled'
        )}
      >
        {ready ? t('duel ready') : t('duel not ready')}
      </span>
    </div>
  );
}
