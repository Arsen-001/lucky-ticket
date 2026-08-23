// utils/getCountdown.ts
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
// Registers the ru/de locales and the `ll` pattern these helpers format with.
import '@/lib/dayjs/locale';
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

/**
 * A calendar date in the reader's own language **and order**:
 * `Aug 6, 2026` · `6 авг. 2026 г.` · `6. Aug. 2026`.
 *
 * Hardcoded patterns can't do this — `MMM D, YYYY` puts the month first for
 * everyone, which is American, not universal. `ll` is dayjs's per-locale
 * pattern, so the order follows the language instead of fighting it.
 */
export const formatLocalDate = (date?: string | Date | number) => {
  if (!date) return '';
  return dayjs(date).format('ll');
};

/** Сегодняшний день по UTC как `YYYY-MM-DD` — метка для локальных счётчиков. */
export const utcDay = (date: Date = new Date()) => date.toISOString().slice(0, 10);

/**
 * Сколько календарных UTC-дней прошло с метки `YYYY-MM-DD`.
 *
 * Календарные дни, а не «сколько часов назад»: у игрока, заходящего каждое
 * утро, счёт от часа к часу сдвигал бы повторный показ на всё более позднее
 * время. `null` — метки нет или она не разбирается (переставленные часы, чужая
 * запись); читатель обязан трактовать это как «ограничение не действует»:
 * промолчать из-за испорченного значения хуже, чем показать лишний раз.
 */
export const utcDaysSince = (stamp: string | null | undefined): number | null => {
  if (!stamp) return null;
  const then = Date.parse(`${stamp}T00:00:00Z`);
  if (Number.isNaN(then)) return null;
  const days = Math.floor((Date.parse(`${utcDay()}T00:00:00Z`) - then) / 86_400_000);
  // Метка из будущего — тоже испорченная: часы игрока могли уйти вперёд.
  return days < 0 ? null : days;
};
