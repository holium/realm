import { useRef, useCallback } from 'react';

export const useDoubleClick = (callback: () => void, delay = 300) => {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const handler = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      callback();
    } else {
      timer.current = setTimeout(() => {
        timer.current = null;
      }, delay);
    }
  }, [callback, delay]);

  return handler;
};
