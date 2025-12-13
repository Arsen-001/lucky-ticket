// utils/getCountdown.ts
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

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
