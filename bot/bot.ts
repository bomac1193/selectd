import "dotenv/config";
import express from "express";

type TelegramChat = {
  id: number;
  type: string;
};

type TelegramWebAppData = {
  data: string;
  button_text?: string;
};

type TelegramMessage = {
  message_id: number;
  text?: string;
  chat: TelegramChat;
  web_app_data?: TelegramWebAppData;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SELECTR_APP_URL =
  process.env.SELECTR_APP_URL || "https://selectr.vercel.app";

if (!TELEGRAM_BOT_TOKEN) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN");
}

const API_BASE = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function telegramRequest(method: string, payload: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Telegram API error ${res.status}: ${text}`);
  }

  return res.json();
}

async function sendMessage(
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>
) {
  return telegramRequest("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
  });
}

const app = express();
app.use(express.json());

app.post("/telegram/webhook", async (req, res) => {
  const update: TelegramUpdate = req.body;

  try {
    const message = update.message;
    if (!message) {
      res.sendStatus(200);
      return;
    }

    const chatId = message.chat.id;

    if (message.text) {
      const text = message.text.trim();

      if (text.startsWith("/start")) {
        await sendMessage(
          chatId,
          "Welcome to SELECTR. Tap below to open the Mini App.",
          {
            inline_keyboard: [
              [
                {
                  text: "Open SELECTR",
                  web_app: { url: SELECTR_APP_URL },
                },
              ],
            ],
          }
        );
      } else if (text.startsWith("/help")) {
        await sendMessage(
          chatId,
          "Commands: /start to open SELECTR, /help for this message."
        );
      } else {
        await sendMessage(chatId, "Use /start to open SELECTR.");
      }
    } else if (message.web_app_data?.data) {
      let payload: unknown = message.web_app_data.data;
      try {
        payload = JSON.parse(message.web_app_data.data);
      } catch {
        // ignore JSON parse errors
      }
      console.log("web_app_data:", payload);
      await sendMessage(chatId, "Got data from the Mini App. Thanks!");
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get("/health", (_req, res) => res.status(200).send("ok"));

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`Telegram bot server listening on ${PORT}`);
});
