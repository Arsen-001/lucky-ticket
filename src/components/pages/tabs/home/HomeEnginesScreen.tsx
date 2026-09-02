'use client';

import Image from 'next/image';
import { HomeEnginesSlider } from '@/components/pages/tabs/home/HomeEnginesSlider';
import { HomeUpcomingTournaments } from '@/components/pages/tabs/home/HomeUpcomingTournaments';
import { HomeJackpotBanner } from '@/components/pages/tabs/home/HomeJackpotBanner';
import { HomeTestQuestCard } from '@/components/pages/tabs/home/HomeTestQuestCard';
import { HomeGamesChip } from '@/components/pages/tabs/home/HomeGamesChip';
import { HomeScreenPill } from '@/components/pages/tabs/home/HomeScreenPill';
import { tikkiImages } from '@/components/shared/tikki/tikki.images';
import type { TikkiTier } from '@/components/shared/tikki/tikki.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TicketsEnum } from '@/types/enums/ticket.enums';

export interface HomeEnginesScreenProps {
  /**
   * Вернуться к Тикки. Передаётся, только когда Тикки открыт игроку: без него
   * это обычная главная, какой она и была, и лишней пилюли на ней нет.
   */
  onBack?: () => void;
  /** Тир того Тикки, что стоит на первом экране — пилюля показывает его же. */
  backTier?: TikkiTier;
}

/**
 * Второй экран главной: джекпот, турниры и движки — всё, что было главной до
 * того, как на неё встал Тикки.
 *
 * Пилюля возврата ЗАКРЕПЛЕНА, а не стоит в конце потока: экран длинный, и
 * дойти до конца, чтобы вернуться, — не выход. `start`/`end` от
 * `--app-gutter`, иначе на широком экране она уедет из колонки приложения.
 */
export function HomeEnginesScreen({
  onBack,
  backTier = TicketsEnum.BRONZE,
}: HomeEnginesScreenProps) {
  const t = useAppTranslations();

  return (
    <div className="flex flex-col gap-5 pb-6 pt-3">
      {/* Поля и зазор тут уже, чем на остальной странице (10 px по бокам,
          6 px между плашками): третья плашка помещается в строку только так.
          Замер на 390: до поджатия заголовок тест-квеста терял 19 px и уходил
          в многоточие, после — читается целиком. */}
      <section className="flex items-stretch gap-1.5 px-2.5">
        <HomeJackpotBanner />
        <HomeTestQuestCard />
        <HomeGamesChip />
      </section>

      {/* Pulled tight against its neighbours: the strip is 88px of card and the
          page's 20px rhythm around it read as two gaps rather than one block. */}
      <HomeUpcomingTournaments className="-my-2.5" />

      <section className="flex flex-col gap-2">
        <HomeEnginesSlider />
      </section>

      {onBack && (
        <div className="end-[calc(var(--app-gutter)+0.625rem)] fixed bottom-[calc(5rem+var(--tg-inset-bottom)+5px)] z-40">
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
        </div>
      )}
    </div>
  );
}
