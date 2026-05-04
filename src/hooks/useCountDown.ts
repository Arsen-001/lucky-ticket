import { useEffect, useState } from 'react';
import {
  type CountdownState,
  durationToMS,
  getCountdown,
  getLeftTimestamp,
  getTimeText,
  pad,
} from '@/utils/global/date.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { Duration } from '@/types/interfaces/date.interfaces';

export interface UseCountdownResult extends CountdownState {
  leftTime: string;
  leftTimeText: string;
  getPassedPercentage: (fullTime?: Duration) => number;
}

export const useCountDown = (targetDate?: string | Date | number): UseCountdownResult => {
  const [state, setState] = useState<CountdownState>(() => getCountdown(targetDate));
  const t = useAppTranslations();

  useEffect(() => {
    const timer = setInterval(() => {
      setState(getCountdown(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = {
    hours: t('hour')[0],
    minutes: t('minute')[0],
    seconds: t('second')[0],
  };

  const leftTime = `${pad(state.hours)}:${pad(state.minutes)}:${pad(state.seconds)}`;
  const leftTimeText = getTimeText(state, timeUnits);
  const getPassedPercentage = (fullDuration?: Duration) => {
    if (!fullDuration) return 0;
    const leftTimestamp = getLeftTimestamp(targetDate);
    const fullDurationTimestamp = durationToMS(fullDuration);
    const leftPercentage = Math.floor((leftTimestamp / fullDurationTimestamp) * 100);
    return 100 - leftPercentage;
  };

  return { ...state, leftTime, leftTimeText, getPassedPercentage };
};
