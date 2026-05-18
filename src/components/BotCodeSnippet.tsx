import React, { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';

export default function BotCodeSnippet({ customToken, customUrl }: { customToken?: string, customUrl?: string }) {
  const [copied, setCopied] = useState(false);
  
  const pythonCode = useMemo(() => {
    const origin = customUrl || (typeof window !== 'undefined' ? window.location.origin : 'YOUR_DEPLOYED_APP_URL');
    const token = customToken || 'YOUR_BOT_TOKEN';
    return `import logging
import requests
import json
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, MessageHandler, CallbackQueryHandler, filters

# ViralAI Configuration
API_URL = "${origin}/api/generate"
TOKEN = "${token}"

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [
            InlineKeyboardButton("🚀 TikTok", callback_query_data='platform_TikTok'),
            InlineKeyboardButton("📸 Reels", callback_query_data='platform_Reels'),
        ],
        [
            InlineKeyboardButton("📺 Shorts", callback_query_data='platform_Shorts'),
            InlineKeyboardButton("🐦 Twitter", callback_query_data='platform_Twitter'),
        ],
        [InlineKeyboardButton("💎 Go Premium", callback_query_data='view_premium')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🔥 **WELCOME TO VIRALAI ENGINE**\\n\\n"
        "Transform your ideas into high-retention viral content.\\n"
        "Select your target platform below:",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    data = query.data
    if data.startswith('platform_'):
        platform = data.split('_')[1]
        context.user_data['platform'] = platform
        await query.edit_message_text(
            text=f"✅ **Platform Set to {platform}**\\n\\n"
                 "Now, send me your **TOPIC** (e.g., 'How to save money in June').",
            parse_mode='Markdown'
        )
    elif data == 'view_premium':
        await query.message.reply_text(
            "💎 **PREMIUM FEATURES ACTIVE**\\n\\n"
            "• Gemini 1.5 Pro Engine\\n"
            "• 5 Hooks per generation\\n"
            "• Custom Tone Selection\\n\\n"
            "Contact @Admin to activate.",
            parse_mode='Markdown'
        )

async def generate(update: Update, context: ContextTypes.DEFAULT_TYPE):
    topic = update.message.text
    platform = context.user_data.get('platform', 'TikTok')
    
    status_msg = await update.message.reply_text(f"⏳ **Mining Viral Triggers for {platform}...**", parse_mode='Markdown')
    
    try:
        response = requests.post(API_URL, json={
            "topic": topic,
            "platform": platform,
            "niche": "General",
            "tone": "Energetic",
            "isPremium": False
        })
        
        data = response.json()
        
        # Build the final message
        hooks = "\\n".join([f"🪝 **{i+1}.** {hook}" for i, hook in enumerate(data['hooks'])])
        
        result_text = (
            f"🎯 **TOPIC: {topic.upper()}**\\n"
            f"👤 **PLATFORM: {platform}**\\n\\n"
            f"{hooks}\\n\\n"
            f"✍️ **CAPTION:**\\n{data['caption']}\\n\\n"
            f"🏷️ **HASHTAGS:**\\n{' '.join(data['hashtags'])}"
        )
        
        await status_msg.edit_text(result_text, parse_mode='Markdown')
        
    except Exception as e:
        logging.error(e)
        await status_msg.edit_text("❌ **ERROR:** Failed to connect to ViralAI. Check API URL.")

if __name__ == '__main__':
    # Initialize the application
    app = ApplicationBuilder().token(TOKEN).build()
    
    app.add_handler(CommandHandler('start', start))
    app.add_handler(CallbackQueryHandler(button_handler))
    app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), generate))
    
    print("🤖 Bot is Online...")
    app.run_polling()`;
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="brutal-card mt-8 bg-brutal-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-xl uppercase">Native Python Engine (.py)</h3>
        <button 
          onClick={handleCopy}
          className="brutal-border bg-neon p-2 brutal-hover flex items-center gap-2 text-sm font-bold"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'SCRIP COPIED!' : 'COPY BOT SCRIPT'}
        </button>
      </div>
      <div className="bg-brutal-black text-neon p-6 font-mono text-[10px] overflow-x-auto rounded border-4 border-brutal-black">
        <pre>{pythonCode}</pre>
      </div>
      <div className="mt-4 p-4 bg-gray-100 border-2 border-brutal-black">
        <h4 className="text-xs font-black uppercase mb-2">Requirements</h4>
        <div className="font-mono text-[10px] flex gap-4">
          <span>pip install python-telegram-bot</span>
          <span>pip install requests</span>
        </div>
      </div>
    </div>
  );
}
