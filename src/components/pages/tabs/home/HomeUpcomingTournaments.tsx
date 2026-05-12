'use client';

import 'swiper/css';
import 'swiper/css/autoplay';

import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { twMerge } from 'tailwind-merge';
import { useGetTopTournamentsQuery } from '@/api/tournaments.api';
import { HomeUpcomingTournamentCard } from '@/components/pages/tabs/home/HomeUpcomingTournamentCard';
import { HomeSectionHeader } from '@/components/pages/tabs/home/HomeSectionHeader';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

const SKELETON_TOURNAMENTS = new Array(4).fill({}) as Tournament[];

export function HomeUpcomingTournaments({ className }: ClassNameProps) {
  const t = useAppTranslations();
  const { data: tournaments, isLoading } = useGetTopTournamentsQuery();

  const items = isLoading || !tournaments?.length ? SKELETON_TOURNAMENTS : tournaments;

  if (!isLoading && !tournaments?.length) {
    return null;
  }

  return (
    <div className={twMerge('flex flex-col gap-3', className)}>
      <HomeSectionHeader
        title={t('upcoming tournaments')}
        actionLabel={t('see all')}
        actionHref={routes.tournaments.index}
      />
      <Swiper
        key={isLoading ? 'loading' : 'loaded'}
        className="-mt-[10px] w-full"
        modules={[Autoplay]}
        centeredSlides
        grabCursor
        observer
        observeParents
        watchOverflow
        loop={!isLoading && (tournaments?.length ?? 0) > 2}
        slidesPerView="auto"
        spaceBetween={20}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
      >
        {items.map((tournament, index) => (
          <SwiperSlide key={tournament.id ?? index} className="w-72! overflow-visible py-[14px]">
            <HomeUpcomingTournamentCard {...tournament} loading={isLoading} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
