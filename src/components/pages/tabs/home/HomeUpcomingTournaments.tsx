'use client';

import 'swiper/css';
import 'swiper/css/autoplay';
import '@/styles/components/home-tournament-ticket.css';

import { useEffect, useState } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { twMerge } from 'tailwind-merge';
import { useGetTopTournamentsQuery } from '@/api/tournaments.api';
import { HomeUpcomingTournamentCard } from '@/components/pages/tabs/home/HomeUpcomingTournamentCard';
import { byStartTime } from '@/utils/global/tournament.utils';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';

const SKELETON_TOURNAMENTS = new Array(4).fill({}) as Tournament[];

/** Below this, Swiper cannot fill both sides with clones and refuses to loop. */
const MIN_TOURNAMENTS_TO_LOOP = 3;

/**
 * Gap between advances. The old strip ran at 2s, which read as a screen that
 * would not sit still — long enough to notice a card, too short to read one.
 * At 3.5s a full pass over seven tournaments takes ~25s and the countdown on
 * the centred card is legible before it leaves.
 */
const AUTOPLAY_DELAY_MS = 3500;

/**
 * The upcoming tournaments on Home: an endless centred carousel, nearest start
 * first.
 *
 * Endless is the point — a plain scroll rail runs out at both ends, so the
 * first ticket has nothing on its left and the last nothing on its right, and
 * the strip stops reading as a carousel exactly where the player starts. With
 * the loop, whichever ticket is centred always has a neighbour peeking in from
 * both sides.
 *
 * What did NOT come back with Swiper is the autoplay: the strip used to pull
 * the next card in every two seconds, which put six of the seven tournaments
 * behind a 14-second wait and kept the screen moving on its own. Nothing here
 * moves unless the player moves it; the only thing ticking is the countdowns.
 */
export function HomeUpcomingTournaments({ className }: ClassNameProps) {
  const { data: tournaments, isLoading } = useGetTopTournamentsQuery();
  // Autoplay is JS, so the global `prefers-reduced-motion` rule in
  // animations.css cannot reach it — a strip that advances on its own is
  // exactly what that setting is asking us not to do. Read after mount: the
  // media query does not exist on the server.
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const items = isLoading || !tournaments?.length ? SKELETON_TOURNAMENTS : byStartTime(tournaments);
  const canLoop = !isLoading && items.length >= MIN_TOURNAMENTS_TO_LOOP;

  if (!isLoading && !tournaments?.length) {
    return null;
  }

  return (
    <Swiper
      // Swiper builds its loop clones once, from the slides it has at init —
      // remounting it when the data lands is what stops the strip from looping
      // over four skeletons for the rest of the session.
      key={isLoading ? 'loading' : 'loaded'}
      className={twMerge('home-tournament-rail w-full', className)}
      modules={[Autoplay]}
      centeredSlides
      grabCursor
      observer
      observeParents
      watchOverflow
      loop={canLoop}
      slidesPerView="auto"
      spaceBetween={10}
      autoplay={
        canLoop && !reduceMotion
          ? {
              delay: AUTOPLAY_DELAY_MS,
              // A swipe means the player is reading this strip on purpose —
              // resume, but never take the carousel away mid-gesture.
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
          : false
      }
    >
      {items.map((tournament, index) => (
        // `py` rather than nothing: Swiper clips its slides, and the card's
        // press-scale and glow need the room.
        <SwiperSlide key={tournament.id ?? index} className="w-[238px]! py-1">
          <HomeUpcomingTournamentCard {...tournament} loading={isLoading} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
