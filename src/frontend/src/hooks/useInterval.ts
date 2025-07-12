import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';

/**
 * Custom hook for setting up intervals with cleanup
 * @param callback - Function to execute on interval
 * @param delay - Delay in milliseconds, null to pause
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(() => {});

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current?.();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}


export default useInterval;
