import logging
import requests
import json
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, MessageHandler, CallbackQueryHandler, filters

# ViralAI Configuration
# These are set via environment variables on Render
API_URL = os.getenv('API_URL', 'https://your-app-name.onrender.com/api/generate')
TOKEN = os.getenv('BOT_TOKEN', 'YOUR_BOT_TOKEN')

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
        [InlineKeyboardButton("💎 View Premium", callback_query_data='view_premium')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🔥 **WELCOME TO VIRALAI ENGINE**\n\n"
        "Transform your ideas into high-retention viral content.\n"
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
            text=f"✅ **Platform Set to {platform}**\n\n"
                 "Now, send me your **TOPIC** (e.g., 'How to grow a YouTube channel').",
            parse_mode='Markdown'
        )
    elif data == 'view_premium':
        await query.message.reply_text(
            "💎 **PREMIUM FEATURES**\n\n"
            "• Gemini 1.5 Pro Engine\n"
            "• 5 Hooks per generation\n"
            "• Advanced Psychological Triggers\n\n"
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
        hooks_list = data.get('hooks', [])
        hooks = "\n".join([f"🪝 **{i+1}.** {hook}" for i, hook in enumerate(hooks_list)])
        caption = data.get('caption', 'No caption generated.')
        hashtags = " ".join(data.get('hashtags', []))
        
        result_text = (
            f"🎯 **TOPIC: {topic.upper()}**\n"
            f"👤 **PLATFORM: {platform}**\n\n"
            f"{hooks}\n\n"
            f"✍️ **CAPTION:**\n{caption}\n\n"
            f"🏷️ **HASHTAGS:**\n{hashtags}"
        )
        
        await status_msg.edit_text(result_text, parse_mode='Markdown')
        
    except Exception as e:
        logging.error(e)
        await status_msg.edit_text("❌ **ERROR:** Failed to connect to ViralAI Engine. Ensure API_URL is correct.")

if __name__ == '__main__':
    if TOKEN == 'YOUR_BOT_TOKEN':
        print("❌ ERROR: BOT_TOKEN environment variable not set.")
    else:
        app = ApplicationBuilder().token(TOKEN).build()
        
        app.add_handler(CommandHandler('start', start))
        app.add_handler(CallbackQueryHandler(button_handler))
        app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), generate))
        
        print("🤖 ViralAI Bot is Online...")
        app.run_polling()
