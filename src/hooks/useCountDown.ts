import { useEffect, useState } from 'react';
import { type CountdownState, getCountdown, pad } from '@/utils/date.utils';

export interface UseCountdownResult extends CountdownState {
  leftTime: string;
}

export const useCountDown = (targetDate?: string | Date | number): UseCountdownResult => {
  const [state, setState] = useState<CountdownState>(() => getCountdown(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setState(getCountdown(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const leftTime = `${pad(state.hours)}:${pad(state.minutes)}:${pad(state.seconds)}`;

  return { ...state, leftTime };
};
