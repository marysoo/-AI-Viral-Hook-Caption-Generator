import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import * as admin from "firebase-admin";

dotenv.config();

const app = express();
const PORT = 3000;

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

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API Routes
app.post("/api/generate", async (req, res) => {
  try {
    const { topic, platform, niche, tone, isPremium, userId } = req.body;

    // Optional: usage tracking if userId is provided
    const firestore = getDb();
    if (firestore && userId) {
      const userRef = firestore.collection('users').doc(userId);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (!isPremium && data?.dailyCount >= 3) {
          return res.status(403).json({ error: "Daily limit reached. Upgrade to Premium!" });
        }
        await userRef.update({ dailyCount: (data?.dailyCount || 0) + 1 });
      }
    }

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

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Topic: ${topic}. Please generate the hooks and caption in JSON format.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    res.json(JSON.parse(response.text || "{}"));
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
