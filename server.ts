import express from "express";
import path from "path";
import fs from "fs";

console.log("📂 Current Directory:", process.cwd());
console.log("📂 Directory Contents:", fs.readdirSync(process.cwd()));
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as admin from "firebase-admin";
import { Telegraf, Markup } from "telegraf";

dotenv.config();

const app = express();
const PORT = 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_URL = process.env.APP_URL;

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Lazy Firebase Admin
let db: admin.firestore.Firestore | null = null;
function getDb() {
  if (!db && process.env.FIREBASE_PROJECT_ID) {
    try {
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      }
      db = admin.firestore();
    } catch (e) {
      console.warn("Firebase Admin failed to init:", e);
    }
  }
  return db;
}

// Internal Generation logic for both API and Bot
async function generateViralContent({ topic, platform, niche, tone, isPremium }: any) {
    const modelName = isPremium ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
    const hookCount = isPremium ? 5 : 3;
    
    const systemPrompt = `You are a Viral Content Growth Expert.
Goal: Create high-retention content for ${platform}.
Niche: ${niche}
Tone: ${tone}
Generate ${hookCount} "Viral Hooks" and 1 "Golden Caption".

VIRAL PSYCHOLOGY PRINCIPLES:
- The First 3 Seconds: Must disrupt the user's dopamine loop.
- The Knowledge Gap: Present a problem they didn't know they had.
- The Specific Outcome: Use data/numbers (e.g., "$0 to $10k", "5 mins a day").

JSON FORMAT:
{
  "hooks": ["..."],
  "caption": "...",
  "hashtags": ["#..."]
}`;

    const responseContent = await ai.models.generateContent({
      model: modelName,
      contents: `Topic: ${topic}. Please generate the hooks and caption in JSON format.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(responseContent.text || "{}");
}

// Bot logic using Telegraf
let bot: Telegraf | null = null;
if (BOT_TOKEN) {
  bot = new Telegraf(BOT_TOKEN);

  bot.start((ctx) => {
    ctx.reply(
      "🚀 *WELCOME TO VIRALAI BOT*\n\n" +
      "I generate high-retention content hooks and captions.\n\n" +
      "Select your platform:",
      Markup.inlineKeyboard([
        [Markup.button.callback('🚀 TikTok', 'platform_TikTok'), Markup.button.callback('📸 Reels', 'platform_Reels')],
        [Markup.button.callback('📺 Shorts', 'platform_Shorts'), Markup.button.callback('🐦 Twitter', 'platform_Twitter')]
      ])
    );
  });

  bot.action(/platform_(.+)/, async (ctx) => {
    const platform = ctx.match[1];
    await ctx.answerCbQuery();
    await ctx.reply(`✅ *Platform set to ${platform}*\nNow, send me your **TOPIC** (e.g., 'How to grow a business online').`);
  });

  bot.on('text', async (ctx) => {
    const topic = ctx.message.text;
    const platform = 'TikTok'; // Simplified for this version
    
    const status = await ctx.reply("✨ Mining viral patterns...");
    
    try {
      const result = await generateViralContent({ topic, platform, niche: 'General', tone: 'Energetic', isPremium: false });
      
      const hooks = (result.hooks || []).map((h: string, i: number) => `🪝 *${i+1}.* ${h}`).join('\n');
      const caption = result.caption || "No caption generated.";
      const hashtags = (result.hashtags || []).join(' ');
      
      const message = `🎯 *RESULT FOR: ${topic.toUpperCase()}*\n\n${hooks}\n\n✍️ *CAPTION:*\n${caption}\n\n🏷️ ${hashtags}`;
      
      await ctx.telegram.editMessageText(ctx.chat.id, status.message_id, undefined, message, { parse_mode: 'Markdown' });
    } catch (e) {
      console.error(e);
      await ctx.reply("❌ Error generating content.");
    }
  });
}

app.use(express.json());
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Bot Initialization
if (bot && BOT_TOKEN) {
  if (APP_URL) {
    const webhookPath = `/api/bot-webhook-${BOT_TOKEN.slice(-8)}`;
    app.use(bot.webhookCallback(webhookPath));
    bot.telegram.setWebhook(`${APP_URL}${webhookPath}`)
        .then(() => console.log("🤖 Telegram Webhook Registered"))
        .catch(err => console.error("❌ Webhook Error:", err));
  } else {
    bot.launch()
        .then(() => console.log("🤖 Telegram Bot Polling Started"))
        .catch(err => console.error("❌ Bot Launch Error:", err));
  }

  // Graceful stop
  process.once('SIGINT', () => bot?.stop('SIGINT'));
  process.once('SIGTERM', () => bot?.stop('SIGTERM'));
} else if (BOT_TOKEN) {
    console.warn("⚠️ Bot instance not created. Check your configuration.");
} else if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ BOT_TOKEN missing in production. Bot will not start.");
}

// API Routes
app.post("/api/generate", async (req, res) => {
  try {
    const result = await generateViralContent(req.body);
    res.json(result);
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to generate content: " + error.message });
  }
});

// Vite Middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
