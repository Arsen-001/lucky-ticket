'use client';
import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { LongPressShield } from '@/components/shared/content-protection/LongPressShield';
import { isOptimizableImage } from '@/config/images.config';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export interface PlayerPhotoProps {
  src: string;
  alt: string;
  /** Box side in px — the size the photo is actually shown at. */
  size: number;
  className?: string;
  /** The first avatar on screen is worth fetching eagerly; the rest are not. */
  eager?: boolean;
}

/**
 * Фотография игрока: со скелетом под ней, пока грузится.
 *
 * Скелет здесь не украшение. Аватарка приходит по сети уже после того, как
 * экран нарисован, и без него на её месте стоит дырка — на доске лидеров это
 * десять дырок разом, и выглядит это как сломанный экран, а не как загрузка.
 * Появляется картинка не рывком, а проявлением (`opacity`), иначе подмена
 * скелета на лицо читается как мигание.
 *
 * Каким тегом рисовать — решает {@link isOptimizableImage}, и вот почему:
 *
 * - **свой хост из списка** (Blob админки, Telegram, `/assets/…`) →
 *   `next/image`. В кружок 40 px приезжает 748 байт вместо всего файла на
 *   30 КБ — замерено 24.08.2026 на проде; ради этой разницы список и заведён;
 * - **любой другой** → обычный `<img>`, как в маркете (@see MarketItemImage).
 *   Адрес аватарки приходит извне репозитория: панель разрешает вставить
 *   ссылку с какого угодно сайта, а `next/image` на незнакомом хосте отвечает
 *   400 оптимизатора — пустой кружок вместо лица.
 *
 * Не открылась совсем (404, хост лёг) — остаётся ровный кружок, а не битая
 * картинка: имя игрока рядом, и подпись «не загрузилось» ему ничего не даёт.
 */
export function PlayerPhoto({ src, alt, size, className, eager = false }: PlayerPhotoProps) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  // `width`/`height` НЕ здесь, а на каждом теге: `tests/image-sizes.test.ts`
  // читает исходник глазами регулярки и сквозь спред их не видит — а правило,
  // которое он стережёт (сказать оптимизатору ширину, иначе приедет картинка
  // во всю ширину экрана), стоило когда-то 170 КБ трафика.
  const shared = {
    alt,
    /**
     * Второй заход в приложение — картинка уже в кеше и успевает загрузиться
     * ДО того, как React повесит обработчик: `onLoad` тогда не случается
     * никогда, и фото навсегда остаётся прозрачным. Поэтому состояние
     * спрашивается ещё и у самого элемента, когда он появился.
     */
    ref: (node: HTMLImageElement | null) => {
      if (node?.complete && node.naturalWidth > 0) setState('ready');
    },
    onLoad: () => setState('ready'),
    onError: () => setState('failed'),
    className: twMerge(
      'h-full w-full rounded-[inherit] object-cover transition-opacity duration-300',
      state === 'ready' ? 'opacity-100' : 'opacity-0'
    ),
  };

  return (
    <span
      style={{ width: size, height: size }}
      className={twMerge('relative block overflow-hidden', className)}
    >
      {state !== 'ready' && (
        <Skeleton
          variant="round"
          className={twMerge(
            'absolute inset-0 h-full w-full rounded-[inherit]',
            // Не открылась — скелет замирает: бесконечное мерцание обещает
            // картинку, которой уже не будет.
            state === 'failed' && 'animate-none opacity-60'
          )}
        />
      )}

      {isOptimizableImage(src) ? (
        <Image
          src={src}
          width={size}
          height={size}
          {...shared}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          width={size}
          height={size}
          {...shared}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
        />
      )}

      {/* Аватар — самая крупная картинка профиля и всей доски лидеров.
          Глобальное `img { pointer-events: none }` уже уводит от неё
          длинный тап, накладка держит то же самое узлом. */}
      <LongPressShield />
    </span>
  );
}
