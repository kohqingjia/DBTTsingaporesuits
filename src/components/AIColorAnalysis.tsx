'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

/* ─── Types ──────────────────────────────────────────────── */
interface Palette {
  skinTone: string;
  undertone: 'warm' | 'cool' | 'neutral';
  suits: { color: string; name: string; hex: string }[];
  shirts: { color: string; name: string; hex: string }[];
  ties: { color: string; name: string; hex: string }[];
  notes: string;
}

/* ─── Mock palette generator (replace with real OpenAI call) ─ */
function generatePalette(dominantColor: string): Palette {
  // In production: call OpenAI Vision API with the image
  // POST https://api.openai.com/v1/chat/completions
  // model: "gpt-4o", messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: imageDataUrl } }]}]
  // Prompt: "Analyse the skin tone and undertone. Return JSON with suit/shirt/tie colour recommendations."

  const warmPalette: Palette = {
    skinTone: '#C68642',
    undertone: 'warm',
    suits: [
      { color: 'bg-[#3D3523]', name: 'Tobacco Brown',   hex: '#3D3523' },
      { color: 'bg-[#1B2A4A]', name: 'Deep Navy',       hex: '#1B2A4A' },
      { color: 'bg-[#4A3728]', name: 'Dark Chocolate',  hex: '#4A3728' },
    ],
    shirts: [
      { color: 'bg-[#F5EFE0]', name: 'Ivory White',  hex: '#F5EFE0' },
      { color: 'bg-[#D4B89A]', name: 'Warm Ecru',    hex: '#D4B89A' },
      { color: 'bg-[#8FA8B0]', name: 'Slate Blue',   hex: '#8FA8B0' },
    ],
    ties: [
      { color: 'bg-[#7A1F2E]', name: 'Burgundy Silk', hex: '#7A1F2E' },
      { color: 'bg-[#C5A230]', name: 'Gold Silk',     hex: '#C5A230' },
      { color: 'bg-[#2F4F4F]', name: 'Teal Foulard',  hex: '#2F4F4F' },
    ],
    notes: 'Your warm undertones pair beautifully with earth-toned fabrics and rich jewel-toned accessories. Avoid cool greys and icy whites.',
  };

  return warmPalette;
}

/* ─── Component ──────────────────────────────────────────── */
export default function AIColorAnalysis() {
  const [step, setStep] = useState<'idle' | 'uploading' | 'analysing' | 'result'>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [palette, setPalette] = useState<Palette | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a photo (JPG, PNG, WEBP).');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setStep('analysing');

      // Simulate API call — replace with real OpenAI Vision call
      setTimeout(() => {
        const result = generatePalette(dataUrl);
        setPalette(result);
        setStep('result');
      }, 2200);
    };
    reader.readAsDataURL(file);
    setStep('uploading');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setStep('idle');
    setPreview(null);
    setPalette(null);
    setError(null);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] } }),
  };

  return (
    <section ref={sectionRef} className="relative bg-obsidian py-28 overflow-hidden">
      {/* Radial accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      <div className="max-w-screen-xl mx-auto px-8">

        {/* ── Header ── */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <motion.p custom={0.1} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="section-label mb-5">
            AI Colour Intelligence
          </motion.p>
          <motion.h2 custom={0.2} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="font-cormorant text-5xl md:text-6xl font-light text-cream mb-4"
          >
            Discover Your <span className="italic text-gold">Palette</span>
          </motion.h2>
          <motion.p custom={0.35} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="font-dm text-cream-muted/60 text-sm leading-relaxed"
          >
            Upload a portrait photograph. Our AI analyses your skin tone and undertone
            to recommend the ideal suit, shirt, and tie combinations — curated for you alone.
          </motion.p>
        </div>

        <motion.div custom={0.4} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto"
        >
          <AnimatePresence mode="wait">

            {/* ── Step: Idle (upload zone) ── */}
            {step === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="border border-dashed border-gold/30 hover:border-gold/60 transition-colors duration-500 p-16 text-center"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="w-16 h-16 mx-auto mb-8 border border-gold/30 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gold/60">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="font-cormorant text-2xl text-cream mb-3">Upload Your Portrait</p>
                <p className="font-dm text-xs text-cream-muted/40 mb-8 max-w-xs mx-auto">
                  Drag & drop a photo, or click to browse. Your image is never stored or transmitted.
                </p>
                <button
                  data-cursor
                  onClick={() => fileRef.current?.click()}
                  className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase px-8 py-3 border border-gold/60 text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
                >
                  Choose Photo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleChange}
                />
                {error && (
                  <p className="mt-4 font-dm text-xs text-red-400">{error}</p>
                )}

                {/* Or use demo */}
                <div className="mt-10 border-t border-cream/5 pt-8">
                  <p className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-cream-muted/30 mb-4">
                    — Or try a demo palette —
                  </p>
                  <button
                    data-cursor
                    onClick={() => { setStep('analysing'); setTimeout(() => { setPalette(generatePalette('')); setStep('result'); }, 2000); }}
                    className="font-josefin text-[0.55rem] tracking-[0.25em] uppercase text-cream-muted/40 hover:text-gold/70 transition-colors duration-300"
                  >
                    Run Demo Analysis
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Step: Uploading / Analysing ── */}
            {(step === 'uploading' || step === 'analysing') && (
              <motion.div
                key="analysing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="border border-gold/20 p-16 text-center"
              >
                {preview && (
                  <div className="w-24 h-24 mx-auto mb-8 overflow-hidden border border-gold/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gold"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
                <p className="font-cormorant text-2xl text-cream mb-2">Analysing Skin Tone</p>
                <p className="font-dm text-xs text-cream-muted/40">
                  {step === 'uploading' ? 'Reading colour data…' : 'Generating your bespoke palette…'}
                </p>
              </motion.div>
            )}

            {/* ── Step: Result ── */}
            {step === 'result' && palette && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <div className="grid md:grid-cols-[auto_1fr] gap-10 border border-gold/20 p-10">
                  {/* Photo + undertone */}
                  <div className="flex flex-col items-center gap-5">
                    {preview ? (
                      <div className="w-28 h-28 overflow-hidden border border-gold/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Your photo" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-28 h-28 border border-gold/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full" style={{ background: 'linear-gradient(135deg, #C68642, #E8A87C)' }} />
                      </div>
                    )}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 border border-gold/30">
                        <span className="w-2 h-2 rounded-full bg-gold" />
                        <span className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-gold">
                          {palette.undertone} undertone
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-8">
                    {[
                      { title: 'Suit Fabrics', items: palette.suits },
                      { title: 'Shirt Colours', items: palette.shirts },
                      { title: 'Tie Accents', items: palette.ties },
                    ].map(({ title, items }) => (
                      <div key={title}>
                        <p className="font-josefin text-[0.55rem] tracking-[0.3em] uppercase text-cream-muted/50 mb-3">
                          {title}
                        </p>
                        <div className="flex gap-4 flex-wrap">
                          {items.map((item) => (
                            <div key={item.name} className="flex flex-col items-center gap-2">
                              <div
                                className="w-10 h-10 border border-cream/10"
                                style={{ backgroundColor: item.hex }}
                              />
                              <span className="font-dm text-[0.45rem] text-cream-muted/50">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <p className="font-dm text-xs text-cream-muted/50 italic leading-relaxed border-t border-gold/10 pt-6">
                      {palette.notes}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-6">
                  <button
                    data-cursor
                    onClick={reset}
                    className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase px-6 py-3 border border-cream/20 text-cream-muted/60 hover:border-gold/40 hover:text-cream transition-all duration-300"
                  >
                    Analyse Another
                  </button>
                  <a
                    href="#contact"
                    data-cursor
                    className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase px-6 py-3 bg-gold text-obsidian hover:bg-gold-light transition-colors duration-300"
                  >
                    Book with This Palette
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* API Note */}
        <motion.p custom={0.6} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="text-center font-dm text-[0.5rem] text-cream-muted/20 mt-8 max-w-lg mx-auto"
        >
          Powered by OpenAI Vision API · Your photos are processed client-side and never stored · Add your API key to enable full analysis
        </motion.p>
      </div>
    </section>
  );
}
