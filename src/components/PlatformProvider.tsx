"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Platform } from "@/lib/platform";
import { detectPlatform } from "@/lib/platform";

type PlatformContextValue = {
  platform: Platform;
};

const PlatformContext = createContext<PlatformContextValue>({
  platform: "web",
});

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatform] = useState<Platform>("web");

  useEffect(() => {
    const current = detectPlatform();
    setPlatform(current);

    if (typeof document !== "undefined") {
      document.documentElement.dataset.platform = current;
    }
  }, []);

  const value = useMemo(() => ({ platform }), [platform]);

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  return useContext(PlatformContext);
}
