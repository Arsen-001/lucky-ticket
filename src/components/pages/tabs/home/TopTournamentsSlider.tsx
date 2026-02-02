'use client';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/virtual';

import { EffectCoverflow } from 'swiper/modules';

import { Swiper, SwiperSlide } from 'swiper/react';

import { useGetTopTournamentsQuery } from '@/api/tournaments.api';
import { TournamentSlideCards } from '@/components/pages/tabs/home/TournamentSlideCards';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { twMerge } from 'tailwind-merge';
import type { CSSProperties } from 'react';

export function TopTournamentsSlider({
  className,
  style,
}: ClassNameProps & { style?: CSSProperties }) {
  const { data: tournamentsData, isLoading } = useGetTopTournamentsQuery();

  const tournaments =
    isLoading || !tournamentsData?.length ? new Array(20).fill(0) : tournamentsData;
  return (
    <Swiper
      className={twMerge('w-full', className)}
      style={style}
      modules={[EffectCoverflow]}
      effect={'coverflow'}
      centeredSlides
      grabCursor
      loop
      slidesPerView={1.5}
      breakpointsBase="window"
      breakpoints={{
        1024: { slidesPerView: 5 },
        580: { slidesPerView: 3 },
        430: { slidesPerView: 2 },
      }}
      spaceBetween={-50}
      coverflowEffect={{
        rotate: 0,
        slideShadows: false,
        depth: 500,
        modifier: 1,
      }}
    >
      {tournaments?.map(({ id, ...rest }, index) => {
        return (
          <SwiperSlide className="overflow-visible pt-10" key={id || index}>
            <TournamentSlideCards id={id} loading={isLoading} {...rest} />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
