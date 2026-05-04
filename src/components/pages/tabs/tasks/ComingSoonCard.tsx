'use client';

import Image, { type StaticImageData } from 'next/image';
import { Clock3, Sparkles, Trophy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Ticket as TicketImage } from '@/components/shared/icons/Ticket';
import { Medal, type MedalType } from '@/components/shared/icons/Medal';
import type { TicketType } from '@/types/types/ticket.types';

export interface ComingSoonCardProps {
  cardIconType?: TicketType;
  cardMedalType?: MedalType;
  cardImageSrc?: StaticImageData | string;
}

/**
 * Teaser card rendered after the last real milestone — signals "more coming"
 * with a muted version of the section's chosen card asset.
 */
export function ComingSoonCard({ cardIconType, cardMedalType, cardImageSrc }: ComingSoonCardProps) {
  const t = useAppTranslations();
  return (
    <div
      className={twMerge(
        'relative flex flex-col gap-2 rounded-2xl bg-background-overlay p-3 overflow-hidden min-h-[200px] task-card-default'
      )}
      aria-disabled
    >
      {/* Header — muted trophy/ticket/medal/image + clock badge */}
      <div className="relative flex items-start justify-between">
        {cardIconType ? (
          <div className="relative w-7 h-7 opacity-40">
            <TicketImage type={cardIconType} width={28} height={28} />
          </div>
        ) : cardMedalType ? (
          <div className="relative w-8 h-8 opacity-40">
            <Medal type={cardMedalType} width={32} />
          </div>
        ) : cardImageSrc ? (
          <div className="relative w-8 h-8 opacity-40">
            <Image src={cardImageSrc} alt="" width={32} height={32} />
          </div>
        ) : (
          <div className="flex-center w-7 h-7 rounded-lg bg-white/5 border border-white/10">
            <Trophy size={14} className="text-white/40" />
          </div>
        )}
        <div className="flex-center w-6 h-6 rounded-full bg-white/5 border border-white/10 shrink-0">
          <Clock3 size={12} className="text-white/40" />
        </div>
      </div>

      {/* Big sparkly placeholder */}
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-extrabold leading-none bg-gradient-to-r from-white/30 to-white/10 bg-clip-text text-transparent">
          ?
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
          {t('coming soon')}
        </span>
      </div>

      <h4 className="text-[12px] font-extrabold leading-snug text-white/70 line-clamp-2">
        {t('more milestones soon')}
      </h4>
      <p className="text-[10px] text-white/40 leading-tight line-clamp-2">
        {t('more milestones soon blurb')}
      </p>

      {/* Footer — soon pill instead of CTA */}
      <div className="mt-auto w-full rounded-xl py-1.5 text-[10px] font-bold uppercase tracking-wider flex-center gap-1 bg-white/5 text-white/50">
        <Sparkles size={11} />
        {t('coming soon')}
      </div>
    </div>
  );
}
