// utils/getCountdown.ts
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { getRandomNumber } from '@/utils/global/number.utils';
import type { Duration } from '@/types/interfaces/date.interfaces';

dayjs.extend(duration);

export interface CountdownState {
  expired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const getCountdown = (targetDate?: string | Date | number): CountdownState => {
  const expiredResult = {
    expired: true,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };
  if (!targetDate) return expiredResult;
  const end = dayjs(targetDate);
  const now = dayjs();
  const diff = end.diff(now);

  if (diff <= 0) {
    return expiredResult;
  }

  const dur = dayjs.duration(diff);

  return {
    expired: false,
    days: dur.days(),
    hours: dur.hours(),
    minutes: dur.minutes(),
    seconds: dur.seconds(),
  };
};

export const pad = (n: number) => String(n).padStart(2, '0');

export const getRandomUpcomingDate = (minSeconds: number, maxSeconds: number) =>
  dayjs().add(getRandomNumber(minSeconds, maxSeconds), 'second').toISOString();

export const getTimeText = (
  countDown: { hours: number; minutes: number; seconds: number },
  units: { hours: string; minutes: string; seconds: string }
) =>
  `${countDown.hours || ''}${countDown.hours ? units.hours : ''} ${countDown.minutes || ''}${countDown.minutes ? units.minutes : ''} ${countDown.seconds}${units.seconds}`;

export const getLeftTimestamp = (targetDate?: string | Date | number) =>
  dayjs(targetDate).valueOf() - dayjs().valueOf();

export const durationToMilliseconds = (duration: Duration) => {
  const { day = 0, hours = 0, minutes = 0, seconds = 0 } = duration;
  return day * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
};
