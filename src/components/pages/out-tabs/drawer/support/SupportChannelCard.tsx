'use client';

import { Megaphone, ExternalLink } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';

export function SupportChannelCard() {
  const t = useAppTranslations();

  return (
    <a
      href={GlobalConstants.telegramChannelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="card-outlined bg-purple-gradient relative flex items-center gap-3 overflow-hidden rounded-2xl p-4 transition-transform active:scale-99"
      style={{
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px -8px color-mix(in srgb, var(--color-electric-purple) 30%, transparent)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[6%] right-[6%] z-2 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-electric-purple) 60%, transparent) 35%, color-mix(in srgb, var(--color-electric-purple) 90%, transparent) 50%, color-mix(in srgb, var(--color-electric-purple) 60%, transparent) 65%, transparent 100%)',
          filter: 'blur(0.6px)',
        }}
      />
      <div className="bg-electric-purple/20 border-electric-purple/40 flex-center h-11 w-11 flex-shrink-0 rounded-xl border">
        <Megaphone size={20} className="text-electric-purple" strokeWidth={2.4} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-bold text-white">{t('follow channel')}</span>
        <span className="text-pink-secondary text-[11px] leading-snug">
          {t('follow channel description')}
        </span>
      </div>
      <ExternalLink size={14} className="text-pink-secondary flex-shrink-0" strokeWidth={2.2} />
    </a>
  );
}
