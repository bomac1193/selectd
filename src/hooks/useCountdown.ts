"use client";

import { useState, useEffect, useCallback } from "react";

interface CountdownState {
  minutes: number;
  seconds: number;
  total: number;
  expired: boolean;
  formatted: string;
}

export function useCountdown(endTime: Date | null): CountdownState {
  const [state, setState] = useState<CountdownState>({
    minutes: 0,
    seconds: 0,
    total: 0,
    expired: true,
    formatted: "0:00",
  });

  const calculate = useCallback(() => {
    if (!endTime) {
      return {
        minutes: 0,
        seconds: 0,
        total: 0,
        expired: true,
        formatted: "0:00",
      };
    }

    const now = new Date();
    const total = Math.max(0, endTime.getTime() - now.getTime());
    const expired = total <= 0;
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    return { minutes, seconds, total, expired, formatted };
  }, [endTime]);

  useEffect(() => {
    setState(calculate());

    const interval = setInterval(() => {
      const newState = calculate();
      setState(newState);

      if (newState.expired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculate]);

  return state;
}
