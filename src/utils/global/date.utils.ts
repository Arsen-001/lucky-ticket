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

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    expired: false,
    days,
    hours,
    minutes,
    seconds,
  };
};

export const pad = (n: number) => String(n).padStart(2, '0');

export const getRandomUpcomingDate = (minSeconds: number, maxSeconds: number) =>
  dayjs().add(getRandomNumber(minSeconds, maxSeconds), 'second').toISOString();

/**
 * Compact adaptive countdown: "2d 7h", "3h 1m", "12m 30s", "42s".
 * Always exactly two units (one at the tail) so it fits a narrow chip, and
 * returns '' once fully elapsed so callers can fall back to a status label.
 */
export const getTimeText = (
  countDown: { days: number; hours: number; minutes: number; seconds: number },
  units: { days: string; hours: string; minutes: string; seconds: string }
) => {
  const { days, hours, minutes, seconds } = countDown;
  if (days > 0) return `${days}${units.days} ${hours}${units.hours}`;
  if (hours > 0) return `${hours}${units.hours} ${minutes}${units.minutes}`;
  if (minutes > 0) return `${minutes}${units.minutes} ${seconds}${units.seconds}`;
  if (seconds > 0) return `${seconds}${units.seconds}`;
  return '';
};

export const getLeftTimestamp = (targetDate?: string | Date | number) =>
  dayjs(targetDate).valueOf() - dayjs().valueOf();

export const durationToMS = (duration: Duration) => {
  const { year = 0, week = 0, day = 0, hours = 0, minutes = 0, seconds = 0 } = duration;

  const totalDays = year * 365 + week * 7 + day;

  return (
    totalDays * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000
  );
};

export const formatDate = (date?: string | Date | number, format = 'DD.MM.YYYY HH:mm') => {
  if (!date) return '';
  return dayjs(date).format(format);
};
