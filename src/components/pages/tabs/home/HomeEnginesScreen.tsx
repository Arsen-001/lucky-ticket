'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { HomeEnginesSlider } from '@/components/pages/tabs/home/HomeEnginesSlider';
import { HomeUpcomingTournaments } from '@/components/pages/tabs/home/HomeUpcomingTournaments';
import { HomeJackpotBanner } from '@/components/pages/tabs/home/HomeJackpotBanner';
import { HomeTestQuestCard } from '@/components/pages/tabs/home/HomeTestQuestCard';
import { HomeGamesPill } from '@/components/pages/tabs/home/HomeGamesPill';
import { HomeScreenPill } from '@/components/pages/tabs/home/HomeScreenPill';
import { HomeScreenPillRow } from '@/components/pages/tabs/home/HomeScreenPillRow';
import { tikkiImages } from '@/components/shared/tikki/tikki.images';
import type { TikkiTier } from '@/components/shared/tikki/tikki.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TicketsEnum } from '@/types/enums/ticket.enums';

export interface HomeEnginesScreenProps {
  /**
   * Вернуться к Тикки. Передаётся, только когда Тикки открыт игроку: без него
   * это обычная главная, какой она и была, и нижнего ряда пилюль на ней нет.
   */
  onBack?: () => void;
  /** Тир того Тикки, что стоит на первом экране — пилюля показывает его же. */
  backTier?: TikkiTier;
}

/**
 * Второй экран главной: джекпот, турниры и движки — всё, что было главной до
 * того, как на неё встал Тикки.
 *
 * Внизу — тот же ряд пилюль, что у Тикки: «Игры» слева, «Тикки» справа,
 * вплотную к таб-бару. Ряд ЛИПКИЙ (`sticky`), а не `fixed`, и это не вкус.
 * Список экранов входит с анимацией, чьё конечное состояние оставляет на
 * прокручиваемом контейнере `transform`, а `fixed` внутри такого контейнера
 * отсчитывает низ от него, а не от окна. До 05.09.2026 пилюля «Тикки» из-за
 * этого висела на 85 px выше таб-бара (замер на 390×844: низ 679 при кромке
 * 764) — при том, что в коде стояло «5 px над ним». Липкий ряд стоит в конце
 * самого списка: липнет к низу прокрутки, а её низ и есть верх таб-бара;
 * инсет Telegram и ширина колонки на планшете учитываются сами. Ряд не
 * прячется, пока экран прокручивают, — как и раньше, контент едет под ним.
 */
export function HomeEnginesScreen({
  onBack,
  backTier = TicketsEnum.BRONZE,
}: HomeEnginesScreenProps) {
  const t = useAppTranslations();

  return (
    // `flex-available` + `mt-auto` у ряда: на экране, где контент короче
    // прокрутки, пилюли всё равно стоят у таб-бара, а не под последней
    // карточкой. Нижнее поле нужно только старой главной без ряда — с рядом
    // последняя строка и есть он сам.
    <div className={twMerge('flex flex-available flex-col gap-5 pt-3', !onBack && 'pb-6')}>
      <section className="flex items-stretch gap-3 px-4">
        <HomeJackpotBanner />
        <HomeTestQuestCard />
      </section>

      {/* Pulled tight against its neighbours: the strip is 88px of card and the
          page's 20px rhythm around it read as two gaps rather than one block. */}
      <HomeUpcomingTournaments className="-my-2.5" />

      <section className="flex flex-col gap-2">
        <HomeEnginesSlider />
      </section>

      {onBack && (
        <HomeScreenPillRow className="sticky bottom-0 z-40 mt-auto px-[14px]">
          <HomeGamesPill />
          <HomeScreenPill
            label={t('tikki')}
            onClick={onBack}
            icon={
              <Image
                src={tikkiImages[backTier].idle}
                alt=""
                width={22}
                height={24}
                className="h-6 w-[22px] object-contain"
              />
            }
          />
        </HomeScreenPillRow>
      )}
    </div>
  );
}
