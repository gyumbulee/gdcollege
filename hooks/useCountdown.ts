"use client";

import { useEffect, useState } from "react";

export interface CountdownValue {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

function computeRemaining(targetDate: string): CountdownValue {
  const diffMs = new Date(targetDate).getTime() - Date.now();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isComplete: false,
  };
}

/**
 * Live countdown to `targetDate`. Recomputes from wall-clock time every
 * second, so it stays correct even if the tab was backgrounded/throttled —
 * it never just decrements a stale counter.
 */
export function useCountdown(targetDate: string): CountdownValue {
  const [value, setValue] = useState<CountdownValue>(() => computeRemaining(targetDate));

  useEffect(() => {
    setValue(computeRemaining(targetDate));
    const intervalId = setInterval(() => {
      setValue(computeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [targetDate]);

  return value;
}
