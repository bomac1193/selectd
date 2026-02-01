export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function getTelegramWebApp(): any | null {
  if (typeof window === "undefined") return null;
  return (window as any).Telegram?.WebApp ?? null;
}

export function getTelegramUser(): TelegramUser | null {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe?.user ?? null;
}

export function isTelegramWebApp(): boolean {
  return !!getTelegramWebApp();
}

export function sendTelegramData(payload: unknown): boolean {
  const tg = getTelegramWebApp();
  if (!tg) return false;
  tg.sendData(JSON.stringify(payload));
  return true;
}
