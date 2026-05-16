import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialSeconds = 120) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef(null);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback((newTime = initialSeconds) => {
    setIsRunning(false);
    setIsExpired(false);
    setTimeLeft(newTime);
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsRunning(false);
            setIsExpired(true);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const progress = timeLeft / initialSeconds;

  return { timeLeft, isRunning, isExpired, progress, start, pause, reset };
};
