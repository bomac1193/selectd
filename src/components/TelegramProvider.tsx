"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getTelegramUser, getTelegramWebApp, TelegramUser } from "@/lib/telegram";

type TelegramContextValue = {
  isTelegram: boolean;
  user: TelegramUser | null;
};

const TelegramContext = createContext<TelegramContextValue>({
  isTelegram: false,
  user: null,
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TelegramContextValue>({
    isTelegram: false,
    user: null,
  });

  useEffect(() => {
    const tg = getTelegramWebApp();
    if (!tg) return;

    tg.ready();
    tg.expand();

    if (typeof document !== "undefined") {
      document.documentElement.classList.add("tg-app");
    }

    const user = getTelegramUser();
    if (user?.id) {
      console.log("Telegram user id:", user.id);
    }

    setState({ isTelegram: true, user });

    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("tg-app");
      }
    };
  }, []);

  return (
    <TelegramContext.Provider value={state}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  return useContext(TelegramContext);
}
