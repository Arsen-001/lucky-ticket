'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { tikkiImages } from './tikki.images';
import { TikkiSpeech } from './TikkiSpeech';
import { TikkiTapPop } from './TikkiTapPop';
import type { TikkiTier } from './tikki.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { triggerHaptic } from '@/utils/global/haptic.utils';
import '@/styles/components/tikki.css';

interface Pop {
  id: number;
  x: number;
  y: number;
  amount: number;
}

export interface TikkiHeroProps {
  tier: TikkiTier;
  /** Сколько уносит одно нажатие прямо сейчас. */
  tapValue: number;
  /** Кликер пуст — нажимать можно, но брать нечего. */
  empty: boolean;
  /** Кликер набит доверху: доход встал, и персонаж об этом просит. */
  full?: boolean;
  /** Реплика над головой — уже переведённая строка; пустая — облака нет. */
  speech?: string;
  onTap: () => void;
  className?: string;
  /** Картинка отдельно: на главной Тикки стоит в карточке, а не на сцене. */
  classNames?: { image?: string };
}

/** Сколько цифр держим в воздухе: больше не читается, а рендерятся все. */
const MAX_POPS = 6;

/** Приседание на нажатие — столько же, сколько длится `tikki-squash` в CSS. */
const SQUASH_MS = 320;

/**
 * Сколько Тикки остаётся «разошедшимся» после последнего нажатия: ровно один
 * круг покачивания `tikki-ready-bob`, чтобы он не обрывался на полпути.
 */
const EXCITED_MS = 1500;

/**
 * Перезапуск CSS-анимации без смены класса: снять, заставить браузер
 * пересчитать стиль, вернуть. Инлайновое `animation: none` перекрывает класс,
 * пустая строка снимает перекрытие — класс снова в силе, и анимация идёт с
 * нуля. Без принудительного пересчёта браузер склеил бы снятие и возврат в
 * один кадр и ничего не перезапустил.
 */
const restartAnimation = (el: HTMLElement | null) => {
  if (!el) return;
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
};

/**
 * Тикки на сцене — главное действие экрана и единственное, ради которого сюда
 * заходят чаще раза в день.
 *
 * Нажатие обрабатывается по `pointerdown`, а не по `click`: на телефоне между
 * касанием и `click` проходит до 300 мс, и при быстрых тапах половина их
 * терялась бы — а тап тут повторяют десятками подряд.
 *
 * Под пальцем Тикки «расходится»: обе руки вверх и покачивание с золотом — та
 * же анимация, что у набитого доверху кликера, — и держится круг после
 * последнего нажатия. Так решено 06.09.2026: игрок запомнил именно её как
 * отклик на тап. На деле она попадала на тап из-за бага — сервер отбивал
 * пачки нажатий, экран откатывался к «всё ещё полный», и Тикки снова прыгал;
 * починка `5ccd0829` убрала отказы, а с ними и прыжки. Теперь это нарочно.
 *
 * Приседание перезапускается на КАЖДОЕ нажатие. Класс анимации между
 * нажатиями не меняется, а CSS перезапускает анимацию только от смены
 * класса: без сброса серия из восьми нажатий давала одно приседание и 860 мс
 * неподвижного персонажа — замер 06.09.2026, Chromium и WebKit.
 */
export function TikkiHero({
  tier,
  tapValue,
  empty,
  full = false,
  speech,
  onTap,
  className,
  classNames,
}: TikkiHeroProps) {
  const t = useAppTranslations();
  const [pops, setPops] = useState<Pop[]>([]);
  const [squash, setSquash] = useState(false);
  // «Разошёлся» от нажатий — отдельно от `full`: полный кликер качается сам,
  // а этот флаг поднимает серия тапов и снимает таймер после последнего.
  const [excitedByTaps, setExcitedByTaps] = useState(false);
  const popId = useRef(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const squashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const excitedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (squashTimer.current) clearTimeout(squashTimer.current);
      if (excitedTimer.current) clearTimeout(excitedTimer.current);
    },
    []
  );

  const handleTap = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      // Приседает на любое нажатие — иначе кнопка кажется мёртвой. И на
      // каждое: сброс идёт до смены класса, поэтому первый тап серии
      // перезапускает дыхание (безвредно), а все следующие — приседание.
      restartAnimation(imageRef.current);
      setSquash(true);
      if (squashTimer.current) clearTimeout(squashTimer.current);
      squashTimer.current = setTimeout(() => setSquash(false), SQUASH_MS);

      // Брать нечего: ни цифры, ни отклика, ни запроса. До 06.09.2026 нажатие
      // по пустому Тикки всё равно уходило в хук — на экране мелькало «+1»,
      // которое сервер тут же отнимал, а каждое такое нажатие шло в минутный
      // потолок сервера, откуда потом отказывали и настоящим.
      if (empty) return;

      setExcitedByTaps(true);
      if (excitedTimer.current) clearTimeout(excitedTimer.current);
      excitedTimer.current = setTimeout(() => setExcitedByTaps(false), EXCITED_MS);

      const box = event.currentTarget.getBoundingClientRect();
      const id = ++popId.current;
      triggerHaptic('light');
      setPops(prev => [
        ...prev.slice(-MAX_POPS),
        {
          id,
          x: ((event.clientX - box.left) / box.width) * 100,
          y: ((event.clientY - box.top) / box.height) * 100,
          amount: tapValue,
        },
      ]);
      setTimeout(() => setPops(prev => prev.filter(pop => pop.id !== id)), 800);

      onTap();
    },
    [empty, tapValue, onTap]
  );

  // Поза говорит состояние прямее, чем фильтр поверх обычного кадра: пустой
  // кликер — расстроенный Тикки, полный и тот, по которому стучат, — он же с
  // обеими руками вверх. Все кадры сняты с одного рига, поэтому подмена не
  // двигает ни пикселя вокруг.
  const poses = tikkiImages[tier];
  const excited = full || excitedByTaps;

  // Кадры смены поз греются заранее. Иначе первый раз, когда кликер пустеет
  // или наполняется, картинка запрашивается прямо в этот момент — и вместо
  // смены выражения игрок видит пустое место на треть секунды.
  useEffect(() => {
    for (const src of [poses.happy.src, poses.jump.src, poses.sad.src]) {
      const img = new window.Image();
      img.src = src;
    }
  }, [poses]);
  // Кадр с одной рукой остаётся только на приседании пустого Тикки: брать
  // нечего, расходиться незачем.
  const pose = excited ? poses.jump : squash ? poses.happy : empty ? poses.sad : poses.idle;

  return (
    <button
      type="button"
      onPointerDown={handleTap}
      aria-label={t('tap tikki')}
      data-testid="tikki-hero"
      className={twMerge(
        'relative mx-auto block touch-manipulation select-none rounded-3xl',
        'focus-visible:outline-teal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4',
        className
      )}
    >
      {/* Покачивание — на обёртке, приседание — на картинке. Две анимации
          одного `transform` на одном элементе не складываются, а перебивают
          друг друга, и перезапуск приседания сбрасывал бы и покачивание —
          при серии тапов оно не сдвинулось бы с нуля. Золотое свечение живёт
          в том же классе: обёртка без фона, тень идёт по контуру картинки. */}
      <span
        className={twMerge('block', excited && 'animate-tikki-ready')}
        data-testid="tikki-hero-body"
      >
        <Image
          ref={imageRef}
          src={pose}
          alt=""
          width={348}
          height={356}
          // Тикки — самая крупная картинка первого экрана: ждать ленивой
          // загрузки нечего. `priority` в Next 16 молча ничего не делает,
          // поэтому словами.
          loading="eager"
          fetchPriority="high"
          className={twMerge(
            // 348×356 — размер из макета; на узком телефоне ужимается по
            // ширине, на коротком — по высоте сцены. `100cqh` — рост сцены
            // (она size-контейнер), а не кнопки: у кнопки высота от
            // содержимого, и `max-h-full` от неё молча равнялся «без
            // потолка». Коробка при этом остаётся 348 в ширину —
            // `object-contain` рисует персонажа по центру, поля прозрачные.
            'mx-auto h-auto max-h-[100cqh] w-[348px] max-w-full object-contain',
            squash ? 'animate-tikki-squash' : 'animate-tikki-breathe',
            classNames?.image
          )}
        />
      </span>
      {/* `key` — чтобы смена строки заново проигрывала появление. */}
      {speech && <TikkiSpeech key={speech} text={speech} />}
      {pops.map(pop => (
        <TikkiTapPop key={pop.id} x={pop.x} y={pop.y} amount={pop.amount} />
      ))}
    </button>
  );
}
