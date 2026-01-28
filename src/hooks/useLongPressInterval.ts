import { type MouseEvent, type TouchEvent, useRef } from 'react';

export function useLongPressInterval(callback: () => void, delay = 500, interval = 100) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = (e: MouseEvent | TouchEvent) => {
    if ('button' in e && e.button !== 0) return;

    callback(); // Initial call

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        callback();
      }, interval);
    }, delay);
  };

  const stop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
}
