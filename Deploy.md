# Deploy — SELECTD Telegram Mini App

This doc is the fast path from dev to production.

---

## 1) Deploy to Vercel

1. Push latest to `main`.
2. Connect the repo in Vercel.
3. Set Vercel **Production URL** (example):
   - `https://selectd.vercel.app`

Recommended Vercel env vars:

```
DATABASE_URL=...
DIRECT_URL=...
NEXTAUTH_URL=https://selectd.vercel.app
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
CANORA_API_URL=...
CANORA_API_KEY=...
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=SelectdBot
NEXT_PUBLIC_TELEGRAM_APP_SHORT_NAME=selectd
```

Deploy, then confirm the app loads:
```
https://selectd.vercel.app
```

---

## 2) Google OAuth (Prod)

Create a **Web application** OAuth client and use:

Authorized JavaScript origins:
```
https://selectd.vercel.app
```

Authorized redirect URIs:
```
https://selectd.vercel.app/api/auth/callback/google
```

Add the client ID/secret to Vercel env.

---

## 3) Discord OAuth (Prod)

In Discord Developer Portal → OAuth2:

Redirect URI:
```
https://selectd.vercel.app/api/auth/callback/discord
```

Add client ID/secret to Vercel env.

---

## 4) BotFather (Prod)

Update the Mini App URL to the Vercel URL:

1. `/myapps` → Select app → **Edit link** → `https://selectd.vercel.app`
2. `/setmenubutton` → Select bot → **Web App URL** → `https://selectd.vercel.app`

Direct Mini App link:
```
https://t.me/SelectdBot/selectd
```

---

## 5) Bot Webhook (Prod)

Set the webhook to your bot server URL (where `bot.ts` runs):

```
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://<your-bot-host>/telegram/webhook"
```

Check:
```
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

---

## 6) Next Steps

1. Add a prod OAuth owner (business email) for long‑term control.
2. Confirm Telegram menu button opens the Vercel Mini App.
3. Verify login and core flows (Drop → Battle → Vote).
4. Monitor logs for auth/webhook errors.

