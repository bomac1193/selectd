"use client";

import { useEffect, useState } from "react";
import { isTelegramWebApp } from "@/lib/telegram";

type TelegramBannerProps = {
  botUsername: string;
  appShortName: string;
};

export function TelegramBanner({ botUsername, appShortName }: TelegramBannerProps) {
  const [isTg, setIsTg] = useState(false);

  useEffect(() => {
    setIsTg(isTelegramWebApp());
  }, []);

  if (isTg) return null;

  const href = `https://t.me/${botUsername}/${appShortName}`;

  return (
    <div className="max-w-4xl mx-auto mb-6 rounded-md border border-border bg-white/5 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Telegram Mini App
          </div>
          <div className="text-sm text-white/90">
            Open SELECTD inside Telegram.
          </div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-black hover:bg-white/90"
        >
          Open
        </a>
      </div>
    </div>
  );
}
