'use client';

import Image from 'next/image';
import { ChevronRight, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Link } from '@/components/shared/links/Link';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { Route } from '@/constants/routes';

export interface GameCardProps {
  title: string;
  subtitle: string;
  /** Куда ведёт. У карточки «скоро» адреса нет — она не кликается. */
  href?: Route;
  /** Жетоны игры: показываются веером справа. */
  tokens?: string[];
  soon?: boolean;
  className?: string;
}

/**
 * Карточка игры на витрине раздела.
 *
 * Игру показывает её собственными предметами, а не иконкой из набора: жетоны
 * узнаются раньше, чем прочитано название.
 */
export function GameCard({ title, subtitle, href, tokens, soon, className }: GameCardProps) {
  const t = useAppTranslations();

  const body = (
    <>
      <span className="relative z-2 flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-center gap-2">
          <span className="text-[17px] font-extrabold leading-tight">{title}</span>
          {soon && (
            <span className="text-pink-secondary rounded-full border border-white/12 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em]">
              {t('soon')}
            </span>
          )}
        </span>
        <span className="text-pink-secondary text-[12px] leading-snug">{subtitle}</span>
      </span>

      {tokens?.length ? (
        <span aria-hidden className="relative z-2 flex shrink-0 items-center">
          {tokens.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt=""
              width={52}
              height={52}
              style={{ marginInlineStart: index === 0 ? 0 : -8 }}
              className="h-[52px] w-[52px] object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.6)]"
            />
          ))}
        </span>
      ) : (
        <span
          aria-hidden
          className="flex-center text-pink-secondary/70 relative z-2 h-12 w-12 shrink-0 rounded-2xl border border-white/10 bg-white/5"
        >
          <Sparkles size={20} />
        </span>
      )}

      {!soon && <ChevronRight size={18} className="text-pink-secondary relative z-2 shrink-0" />}
    </>
  );

  const shell = twMerge(
    'relative flex items-center gap-3 overflow-hidden rounded-3xl border p-4',
    soon
      ? 'border-white/8 opacity-60'
      : 'border-electric-purple/45 transition-transform active:scale-[0.985]',
    className
  );

  // Непрозрачная подложка под тинт — на атмосферном фоне полупрозрачная
  // карточка становится окном и берёт яркость неба.
  const style = { backgroundColor: 'var(--color-background)' };

  if (soon || !href) {
    return (
      <div className={shell} style={style}>
        {body}
      </div>
    );
  }

  return (
    <Link href={href} aria-label={title} className={shell} style={style}>
      <span
        aria-hidden
        className="from-electric-purple/30 absolute inset-0 z-1 bg-gradient-to-r to-transparent"
      />
      {body}
    </Link>
  );
}
