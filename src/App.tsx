import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles, Send, Copy, Instagram, Play, Youtube, Globe, Ghost, ShieldCheck, Crown, Check } from 'lucide-react';
import BotCodeSnippet from './components/BotCodeSnippet';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('TikTok');
  const [niche, setNiche] = useState('Business');
  const [tone, setTone] = useState('Energetic');
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generator' | 'bot'>('generator');
  const [botToken, setBotToken] = useState('');
  const [backendUrl, setBackendUrl] = useState(typeof window !== 'undefined' ? window.location.origin : '');

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, niche, tone, isPremium }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Marquee Banner */}
      <div className="marquee-container">
        <div className="marquee-content">
          Viral AI Hook Generator • 100x Your Organic Reach • Smart Caption Engine • Python Bot Integration • Viral AI Hook Generator • 100x Your Organic Reach • Smart Caption Engine • Python Bot Integration
        </div>
      </div>

      <header className="max-w-6xl mx-auto px-6 pt-12 text-center">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-display text-8xl md:text-9xl tracking-tighter leading-none mb-4"
        >
          VIRAL<span className="text-neon outline-neon">AI</span>
        </motion.h1>
        <p className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-8">
          The ultimate engine for high-retention content hooks
        </p>

        <div className="flex justify-center gap-4 mb-20">
          <button 
            onClick={() => setActiveTab('generator')}
            className={cn(
              "brutal-border px-8 py-3 font-display text-xl brutal-hover transition-colors",
              activeTab === 'generator' ? "bg-neon text-brutal-black" : "bg-white text-gray-400"
            )}
          >
            GENERATOR
          </button>
          <button 
            onClick={() => setActiveTab('bot')}
            className={cn(
              "brutal-border px-8 py-3 font-display text-xl brutal-hover transition-colors",
              activeTab === 'bot' ? "bg-neon text-brutal-black" : "bg-white text-gray-400"
            )}
          >
            TELEGRAM BOT
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'generator' ? (
            <motion.div 
              key="gen-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8"
            >
              <aside className="space-y-6">
                <div className="brutal-card">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-black uppercase">Plan Status</label>
                    <button 
                      onClick={() => setIsPremium(!isPremium)}
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 border-2 border-brutal-black brutal-hover",
                        isPremium ? "bg-neon" : "bg-gray-100"
                      )}
                    >
                      {isPremium ? "PREMIUM" : "FREE"}
                    </button>
                  </div>
                  
                  <label className="block text-xs font-black uppercase mb-2">Platform</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'TikTok', icon: <Ghost size={16} /> },
                      { name: 'Reels', icon: <Instagram size={16} /> },
                      { name: 'Shorts', icon: <Youtube size={16} /> },
                      { name: 'Twitter', icon: <Globe size={16} /> }
                    ].map(p => (
                      <button
                        key={p.name}
                        onClick={() => setPlatform(p.name)}
                        className={cn(
                          "flex items-center gap-2 p-2 text-xs font-bold border-2 border-brutal-black brutal-hover transition-all",
                          platform === p.name ? "bg-neon scale-105" : "bg-brutal-white shadow-none"
                        )}
                      >
                        {p.icon} {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="brutal-card">
                  <label className="block text-xs font-black uppercase mb-2">The Topic</label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. 5 secrets to high ticket sales"
                    className="w-full p-4 border-2 border-brutal-black font-mono text-sm h-32 focus:outline-none focus:bg-neon/5"
                  />
                  <p className="mt-2 text-[10px] text-gray-500 font-bold uppercase italic">
                    {isPremium ? "🚀 Premium Engine Active: Deep Latent Triggers Enabled" : "✨ Flash Engine: Fast & Direct Content"}
                  </p>
                </div>

                <div className="brutal-card">
                  <label className="block text-xs font-black uppercase mb-2">Niche & Tone</label>
                  <div className="space-y-4">
                    <select 
                      value={niche} 
                      onChange={(e) => setNiche(e.target.value)}
                      className="w-full p-2 border-2 border-brutal-black text-sm font-bold bg-white"
                    >
                      <option>E-Commerce</option>
                      <option>Personal Finance</option>
                      <option>AI & Tech</option>
                      <option>Self-Improvement</option>
                      <option>Fitness & Health</option>
                    </select>
                    <select 
                      value={tone} 
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full p-2 border-2 border-brutal-black text-sm font-bold bg-white"
                    >
                      <option>Energetic</option>
                      <option>Controversial</option>
                      <option>Storytelling</option>
                      <option>Educational</option>
                      <option>Sarcastic</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !topic}
                  className="w-full brutal-border bg-brutal-black text-neon py-5 font-display text-2xl uppercase brutal-hover disabled:opacity-50 flex justify-center items-center gap-3"
                >
                  {loading ? <Zap className="animate-spin text-neon" /> : "EXPLODE MY REACH"}
                </button>
              </aside>

              <section className="space-y-8">
                <AnimatePresence mode="wait">
                  {!result ? (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="brutal-card h-[600px] flex flex-col justify-center items-center border-dashed border-gray-300 opacity-50"
                    >
                      <Sparkles size={64} className="mb-6 animate-pulse" />
                      <p className="font-display text-2xl uppercase text-center">Awaiting Input</p>
                      <p className="font-mono text-xs max-w-xs text-center mt-4">Viral architecture requires a topic. Feed the machine to generate hooks that stop the scroll.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-end border-b-4 border-brutal-black pb-2">
                          <h2 className="font-display text-4xl uppercase">Viral Hooks</h2>
                          <span className="font-mono text-xs font-bold text-gray-500 uppercase">{result.hooks?.length} Hooks Generated</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          {result.hooks?.map((hook: string, i: number) => (
                            <motion.div 
                              key={i}
                              initial={{ x: 20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="brutal-card bg-white group hover:bg-neon/5 transition-colors"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <p className="font-black text-xl leading-tight tracking-tight italic">"{hook}"</p>
                                <button 
                                  onClick={() => copyToClipboard(hook, `hook-${i}`)}
                                  className="brutal-border p-2 bg-neon brutal-hover shrink-0"
                                >
                                  {copied === `hook-${i}` ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h2 className="font-display text-4xl uppercase border-b-4 border-brutal-black pb-2">The Caption</h2>
                        <div className="brutal-card relative group">
                          <button 
                            onClick={() => copyToClipboard(result.caption, 'caption')}
                            className="absolute top-4 right-4 brutal-border p-2 bg-neon brutal-hover"
                          >
                            {copied === 'caption' ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                          <div className="font-mono text-sm leading-relaxed p-2 whitespace-pre-wrap">
                            {result.caption}
                          </div>
                          <div className="mt-8 flex flex-wrap gap-2">
                            {result.hashtags?.map((tag: string) => (
                              <span key={tag} className="bg-brutal-black text-neon text-[10px] font-black px-3 py-1 uppercase tracking-tighter">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </motion.div>
          ) : (
            <motion.div 
              key="bot-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="brutal-card mb-8 bg-neon">
                <h2 className="font-display text-4xl uppercase mb-4">Launch Your Bot</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div className="brutal-border p-4 bg-white">
                    <h3 className="font-black text-sm uppercase mb-2">1. Bot Configuration</h3>
                    <div className="space-y-4 pt-2">
                        <div>
                            <label className="text-[10px] font-black uppercase block mb-1">Bot Token (from @BotFather)</label>
                            <input 
                                type="password" 
                                value={botToken}
                                onChange={(e) => setBotToken(e.target.value)}
                                placeholder="Paste token here..."
                                className="w-full p-2 border-2 border-brutal-black font-mono text-xs focus:bg-neon/10 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase block mb-1">Backend API URL</label>
                            <input 
                                type="text" 
                                value={backendUrl}
                                onChange={(e) => setBackendUrl(e.target.value)}
                                placeholder="https://your-app.onrender.com"
                                className="w-full p-2 border-2 border-brutal-black font-mono text-xs focus:bg-neon/10 outline-none"
                            />
                        </div>
                    </div>
                  </div>
                  <div className="brutal-border p-4 bg-white">
                    <h3 className="font-black text-sm uppercase mb-2">2. Deployment Guide</h3>
                    <ul className="text-[10px] space-y-2 mt-2 font-bold uppercase">
                        <li className="flex gap-2"><span className="text-neon bg-black px-1">GH</span> Create a GitHub Repo</li>
                        <li className="flex gap-2"><span className="text-neon bg-black px-1">RN</span> Connect to Render.com</li>
                        <li className="flex gap-2"><span className="text-neon bg-black px-1">EV</span> Set GEMINI_API_KEY in Render Vars</li>
                        <li className="flex gap-2"><span className="text-neon bg-black px-1">EV</span> Set BOT_TOKEN in Render Vars</li>
                    </ul>
                  </div>
                </div>
              </div>
              <BotCodeSnippet customToken={botToken} customUrl={backendUrl} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-6xl mx-auto px-6 mt-32 text-center">
        <div className="brutal-border p-12 bg-brutal-black text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-10">
            <Zap size={200} />
          </div>
          <h3 className="font-display text-6xl uppercase tracking-tighter">Destroy Content Block</h3>
          <p className="font-mono text-xs mt-4 opacity-50 uppercase tracking-widest">© 2024 ViralAI Engine • Anti-Generic Movement</p>
        </div>
      </footer>
    </div>
  );
}
