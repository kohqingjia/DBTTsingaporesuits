'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const GREETING: Message = {
  role: 'assistant',
  content: 'Good day. I am the Picadilly Tailors Style Concierge. How may I assist you today — whether about our bespoke process, styling platform, or booking a consultation?',
};

const PROMPTS = [
  'How long does a bespoke suit take?',
  'What is the starting price?',
  'How do I book a consultation?',
  'How does the AI Stylist work?',
  'What fabrics do you carry?',
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? 'I apologise — something went wrong. Please try again.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologise — something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  async function sendPrompt(text: string) {
    if (loading) return;
    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply ?? 'I apologise — something went wrong. Please try again.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologise — something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const showPrompts = messages.length === 1 && !loading;

  return (
    <div className="fixed bottom-8 right-8 z-[9500] flex flex-col items-end gap-4">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-[360px] bg-obsidian-50/95 backdrop-blur-sm border border-gold/20 flex flex-col"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gold/10">
              <div>
                <p className="font-josefin text-[10px] tracking-[0.3em] uppercase text-gold">
                  Style Concierge
                </p>
                <p className="font-cormorant text-cream text-lg font-light leading-tight mt-0.5">
                  Picadilly Tailors
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-cream-muted hover:text-cream transition-colors p-1"
                aria-label="Close chat"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 scrollbar-thin">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 text-sm font-dm font-light leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gold/10 border border-gold/20 text-cream'
                        : 'bg-obsidian/60 border border-gold/10 text-cream-muted'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              <AnimatePresence>
                {showPrompts && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-2 mt-1"
                  >
                    {PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendPrompt(prompt)}
                        className="text-left px-4 py-2.5 border border-gold/20 hover:border-gold/50 hover:bg-gold/5 text-cream-muted hover:text-cream font-dm text-xs font-light leading-snug transition-all"
                      >
                        {prompt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-obsidian/60 border border-gold/10 px-4 py-3">
                    <span className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="block w-1 h-1 bg-gold/60"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

            {/* Input */}
            <div className="px-6 py-4 flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about our services..."
                disabled={loading}
                className="flex-1 bg-transparent border-b border-gold/20 focus:border-gold/50 outline-none text-cream font-dm text-sm font-light placeholder:text-cream-muted/40 py-1 transition-colors"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="text-gold hover:text-gold-light disabled:text-cream-muted/30 transition-colors flex-shrink-0"
                aria-label="Send"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 9h14M10 3l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="w-14 h-14 bg-gold hover:bg-gold-light flex items-center justify-center transition-colors shadow-lg"
        aria-label="Open Style Concierge"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg
              key="close"
              initial={{ opacity: 0, rotate: -45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 45 }}
              transition={{ duration: 0.2 }}
              width="18" height="18" viewBox="0 0 18 18" fill="none"
            >
              <path d="M2 2l14 14M16 2L2 16" stroke="#0A0A0A" strokeWidth="1.8"/>
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ opacity: 0, rotate: 45 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -45 }}
              transition={{ duration: 0.2 }}
              width="20" height="20" viewBox="0 0 20 20" fill="none"
            >
              <path d="M2 2h16v12H11l-4 4v-4H2V2z" stroke="#0A0A0A" strokeWidth="1.8" strokeLinejoin="square"/>
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
