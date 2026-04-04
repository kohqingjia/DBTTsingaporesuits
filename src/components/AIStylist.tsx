'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuitConfig, StyleRecommendation, OutfitItem } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendation?: StyleRecommendation;
}

interface AIStylistProps {
  selectedOccasion?: string;
  onApplyToStudio?: (config: SuitConfig) => void;
}

/* ─── Map AI recommendation → SuitConfig ─────────────────── */
function mapRecommendationToConfig(rec: StyleRecommendation): SuitConfig {
  const colour = (rec.recommendation.suit.colour ?? '').toLowerCase();
  const fabric = (rec.recommendation.suit.fabric ?? '').toLowerCase();
  const combined = colour + ' ' + fabric;

  // Fabric mapping
  let fabricId: SuitConfig['fabric'] = 'navy-herringbone';
  if (combined.includes('charcoal'))                                    fabricId = 'charcoal-wool';
  else if (combined.includes('navy') || combined.includes('blue'))      fabricId = 'navy-herringbone';
  else if (combined.includes('midnight') || combined.includes('black') || combined.includes('velvet')) fabricId = 'midnight-velvet';
  else if (combined.includes('slate') || combined.includes('grey') || combined.includes('gray') || combined.includes('flannel')) fabricId = 'slate-flannel';
  else if (combined.includes('ivory') || combined.includes('cream') || combined.includes('beige') || combined.includes('linen')) fabricId = 'ivory-linen';
  else if (combined.includes('burgundy') || combined.includes('wine') || combined.includes('maroon') || combined.includes('red')) fabricId = 'burgundy-wool';

  // Lapel — infer from occasion via the stylist note / fabric
  let lapel: SuitConfig['lapel'] = 'notch';
  const note = (rec.stylistNote ?? '').toLowerCase();
  const explanation = (rec.styleExplanation ?? '').toLowerCase();
  const context = note + ' ' + explanation;
  if (fabricId === 'midnight-velvet' || context.includes('black tie') || context.includes('evening')) lapel = 'shawl';
  else if (context.includes('wedding') || context.includes('formal') || context.includes('corporate') || context.includes('interview')) lapel = 'peak';

  // Fit
  let fit: SuitConfig['fit'] = 'tailored';
  if (context.includes('slim') || context.includes('modern')) fit = 'slim';
  else if (context.includes('relaxed') || context.includes('comfort') || context.includes('casual')) fit = 'relaxed';

  // Lining — pick from colour palette
  let lining: SuitConfig['lining'] = 'black';
  if (rec.palette && rec.palette.length > 0) {
    const paletteNames = rec.palette.map(p => p.name.toLowerCase()).join(' ');
    if (paletteNames.includes('gold') || paletteNames.includes('amber'))        lining = 'gold';
    else if (paletteNames.includes('navy') || paletteNames.includes('blue'))    lining = 'navy';
    else if (paletteNames.includes('burgundy') || paletteNames.includes('red') || paletteNames.includes('wine')) lining = 'red';
    else if (paletteNames.includes('teal') || paletteNames.includes('green'))   lining = 'teal';
    else if (paletteNames.includes('ivory') || paletteNames.includes('cream'))  lining = 'ivory';
  }

  // Buttons
  const buttons: number = lapel === 'shawl' ? 1 : 2;

  return { fabric: fabricId, lapel, fit, lining, buttons };
}

/* ─── Budget Optimiser Types ─────────────────────────────── */
interface OutfitOption {
  label: string;
  suit: number;
  shirt: number;
  tie: number;
  shoes: number;
  styleScore: number;
  description: string;
}

/* ─── Budget Optimiser Logic ─────────────────────────────── */
function computeBudgetOptions(budget: number): { bestValue: OutfitOption; premiumPick: OutfitOption } {
  // Tiers spend different proportions of the total budget
  // Essential: 65% spend — best style-per-dollar ratio
  // Distinguished: 82% spend — balanced mid-tier
  // Masterwork: 100% spend — maximum quality
  const e = budget * 0.65;
  const d = budget * 0.82;
  const m = budget * 1.00;

  const tiers: OutfitOption[] = [
    {
      label: 'Essential',
      suit: Math.round(e * 0.58),
      shirt: Math.round(e * 0.16),
      tie: Math.round(e * 0.10),
      shoes: Math.round(e * 0.16),
      styleScore: 72,
      description: 'Clean, classic cuts in quality wool. Ideal for entry-level bespoke.',
    },
    {
      label: 'Distinguished',
      suit: Math.round(d * 0.62),
      shirt: Math.round(d * 0.15),
      tie: Math.round(d * 0.09),
      shoes: Math.round(d * 0.14),
      styleScore: 86,
      description: 'Elevated fabrics — Italian wool blends, hand-finishing on lapels.',
    },
    {
      label: 'Masterwork',
      suit: Math.round(m * 0.66),
      shirt: Math.round(m * 0.14),
      tie: Math.round(m * 0.08),
      shoes: Math.round(m * 0.12),
      styleScore: 96,
      description: 'Full canvas construction, Loro Piana cloths, surgeon\'s buttonholes.',
    },
  ];

  // Best value = highest style score per dollar spent
  const bestValue = tiers.reduce((prev, curr) => {
    const prevSpent = prev.suit + prev.shirt + prev.tie + prev.shoes;
    const currSpent = curr.suit + curr.shirt + curr.tie + curr.shoes;
    return (curr.styleScore / currSpent) > (prev.styleScore / prevSpent) ? curr : prev;
  });

  // Premium pick = highest style score overall
  const premiumPick = tiers.reduce((prev, curr) =>
    curr.styleScore > prev.styleScore ? curr : prev
  );

  return { bestValue, premiumPick };
}

/* ─── Occasions ──────────────────────────────────────────── */
const OCCASIONS = ['Wedding', 'Corporate', 'Black Tie', 'Smart Casual', 'Special Event'];
const STYLES = ['Classic', 'Modern', 'Bold'];

/* ─── Component ──────────────────────────────────────────── */
export default function AIStylist({ selectedOccasion, onApplyToStudio }: AIStylistProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stylist' | 'budget'>('stylist');

  // Form state
  const [occasion, setOccasion] = useState(selectedOccasion ?? '');
  const [budget, setBudget] = useState(1500);
  const [style, setStyle] = useState('Classic');
  const [requirements, setRequirements] = useState('');

  // Budget optimiser
  const budgetOptions = computeBudgetOptions(budget);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Update occasion if prop changes (from OccasionSelector)
  useEffect(() => {
    if (selectedOccasion) setOccasion(selectedOccasion);
  }, [selectedOccasion]);


  const handleSubmit = async () => {
    if (!occasion || loading) return;

    const userMessage = `${occasion} occasion · SGD ${budget.toLocaleString()} budget · ${style} style${requirements ? ` · ${requirements}` : ''}`;

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occasion, budget, style, requirements }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: StyleRecommendation = await res.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.styleExplanation,
          recommendation: data,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Our stylist is momentarily unavailable. Please try again shortly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-stylist" className="relative bg-obsidian py-28 overflow-hidden">
      {/* Gold ambient glow */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gold/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="max-w-screen-xl mx-auto px-8">

        {/* ── Section Header ── */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="font-josefin text-xs tracking-[0.3em] uppercase text-gold mb-5"
            >
              AI Smart Stylist
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="font-cormorant text-5xl md:text-6xl font-light text-cream leading-tight"
            >
              Your Personal <span className="italic text-gold">Style Oracle</span>
            </motion.h2>
          </div>

          {/* Tab toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex border border-gold/20"
          >
            {(['stylist', 'budget'] as const).map(tab => (
              <button
                key={tab}
                data-cursor
                onClick={() => setActiveTab(tab)}
                className={`font-josefin text-[0.6rem] tracking-[0.25em] uppercase px-6 py-3 transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gold text-obsidian'
                    : 'text-cream-muted/50 hover:text-cream'
                }`}
              >
                {tab === 'stylist' ? 'Stylist' : 'Budget Optimiser'}
              </button>
            ))}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {/* ── TAB: AI STYLIST ── */}
          {activeTab === 'stylist' && (
            <motion.div
              key="stylist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-[420px_1fr] gap-8"
            >
              {/* ── Left: Input Panel ── */}
              <div className="border border-gold/10 bg-obsidian-50/80 backdrop-blur-sm p-8 flex flex-col gap-8">
                <div>
                  <p className="font-josefin text-[0.55rem] tracking-[0.3em] uppercase text-gold/70 mb-4">
                    Occasion
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {OCCASIONS.map(occ => (
                      <button
                        key={occ}
                        data-cursor
                        onClick={() => setOccasion(occ)}
                        className={`text-left px-4 py-2.5 border transition-all duration-200 font-dm text-xs ${
                          occasion === occ
                            ? 'border-gold/60 text-gold bg-gold/5'
                            : 'border-cream/10 text-cream-muted/50 hover:border-gold/30 hover:text-cream-muted'
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-josefin text-[0.55rem] tracking-[0.3em] uppercase text-gold/70">
                      Budget
                    </p>
                    <span className="font-cormorant text-xl text-cream">
                      SGD {budget.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={5000}
                    step={100}
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                    className="w-full h-px bg-cream/10 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="font-dm text-[0.5rem] text-cream-muted/30">SGD 200</span>
                    <span className="font-dm text-[0.5rem] text-cream-muted/30">SGD 5,000</span>
                  </div>
                </div>

                <div>
                  <p className="font-josefin text-[0.55rem] tracking-[0.3em] uppercase text-gold/70 mb-4">
                    Style
                  </p>
                  <div className="flex gap-2">
                    {STYLES.map(s => (
                      <button
                        key={s}
                        data-cursor
                        onClick={() => setStyle(s)}
                        className={`flex-1 py-2 border font-josefin text-[0.5rem] tracking-[0.2em] uppercase transition-all duration-200 ${
                          style === s
                            ? 'border-gold/60 text-gold bg-gold/5'
                            : 'border-cream/10 text-cream-muted/40 hover:border-gold/30'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-josefin text-[0.55rem] tracking-[0.3em] uppercase text-gold/70 mb-4">
                    Special Requirements
                  </p>
                  <textarea
                    value={requirements}
                    onChange={e => setRequirements(e.target.value)}
                    placeholder="Any specific requests — fabric preferences, colours to avoid, dress code notes..."
                    rows={3}
                    className="w-full bg-obsidian border border-cream/10 text-cream/80 font-dm text-xs p-4 placeholder:text-cream-muted/20 resize-none focus:outline-none focus:border-gold/40 transition-colors"
                  />
                </div>

                <button
                  data-cursor
                  onClick={handleSubmit}
                  disabled={!occasion || loading}
                  className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase py-4 bg-gold text-obsidian hover:bg-gold-light transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Consulting the Stylist…' : 'Get My Recommendation'}
                </button>
              </div>

              {/* ── Right: Conversation + Recommendation Panel ── */}
              <div className="flex flex-col gap-6 min-h-[600px]">

                {/* Empty state */}
                {messages.length === 0 && !loading && (
                  <div className="flex-1 border border-gold/10 bg-obsidian-50/40 flex flex-col items-center justify-center p-16 text-center">
                    <div className="w-12 h-12 border border-gold/20 flex items-center justify-center mb-8">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gold/40">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <p className="font-cormorant text-2xl text-cream/40 mb-3">Your recommendation awaits</p>
                    <p className="font-dm text-xs text-cream-muted/30 max-w-xs leading-relaxed">
                      Select your occasion and preferences, then consult our AI stylist for a bespoke recommendation.
                    </p>
                  </div>
                )}

                {/* Chat thread */}
                <div className="flex flex-col gap-6 overflow-y-auto max-h-[700px] pr-2">
                  {messages.map((msg, i) => (
                    <div key={i}>
                      {msg.role === 'user' ? (
                        <div className="flex justify-end">
                          <div className="bg-obsidian-50 border border-gold/10 px-5 py-4 max-w-md">
                            <p className="font-josefin text-[0.55rem] tracking-[0.2em] uppercase text-gold/60 mb-2">Your Brief</p>
                            <p className="font-dm text-xs text-cream-muted/70">{msg.content}</p>
                          </div>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {/* Style explanation */}
                          <div className="border-l-2 border-gold/30 pl-6 mb-6">
                            <p className="font-josefin text-[0.55rem] tracking-[0.2em] uppercase text-gold/60 mb-3">Stylist&apos;s Note</p>
                            <p className="font-dm text-sm text-cream-muted/80 leading-relaxed italic">{msg.content}</p>
                          </div>

                          {/* Recommendation cards */}
                          {msg.recommendation && (
                            <RecommendationCard rec={msg.recommendation} onApplyToStudio={onApplyToStudio} />
                          )}
                        </motion.div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex items-center gap-3 px-2">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 bg-gold/60"
                          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                      <span className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-cream-muted/30 ml-2">
                        Consulting the wardrobe…
                      </span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TAB: BUDGET OPTIMISER ── */}
          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Budget slider — horizontal bar */}
              <div className="border border-gold/10 bg-obsidian-50/80 px-10 py-6 mb-6 flex items-center gap-10">
                <div className="flex-shrink-0">
                  <p className="font-josefin text-[0.55rem] tracking-[0.3em] uppercase text-gold/70 mb-1">
                    Your Budget
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="font-cormorant text-4xl text-cream font-light">
                      SGD {budget.toLocaleString()}
                    </span>
                    <span className="font-dm text-xs text-cream-muted/40">total</span>
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min={200}
                    max={5000}
                    step={100}
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                    className="w-full h-px bg-cream/10 appearance-none cursor-pointer mb-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between">
                    <span className="font-dm text-[0.5rem] text-cream-muted/30">SGD 200</span>
                    <span className="font-dm text-[0.5rem] text-cream-muted/30">SGD 5,000</span>
                  </div>
                </div>
              </div>

              {/* 3-column: bestValue | breakdown chart | premiumPick */}
              <div className="grid grid-cols-3 gap-6">
                <BudgetCard
                  option={budgetOptions.bestValue}
                  badge="Best Value"
                  accentClass="border-gold/40"
                  badgeClass="bg-gold text-obsidian"
                />
                <div className="border border-gold/10 bg-obsidian-50/80 p-8">
                  <p className="font-josefin text-[0.55rem] tracking-[0.3em] uppercase text-gold/70 mb-6">
                    Budget Allocation
                  </p>
                  <p className="font-josefin text-[0.45rem] tracking-[0.2em] uppercase text-cream-muted/30 mb-3">
                    Best Value — {budgetOptions.bestValue.label}
                  </p>
                  <BreakdownChart option={budgetOptions.bestValue} total={budget} />
                  <div className="mt-6 border-t border-gold/10 pt-6">
                    <p className="font-josefin text-[0.45rem] tracking-[0.2em] uppercase text-cream-muted/30 mb-3">
                      Premium Pick — {budgetOptions.premiumPick.label}
                    </p>
                    <BreakdownChart option={budgetOptions.premiumPick} total={budget} />
                  </div>
                </div>
                <BudgetCard
                  option={budgetOptions.premiumPick}
                  badge="Premium Pick"
                  accentClass="border-cream/20"
                  badgeClass="bg-obsidian border border-cream/20 text-cream"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── Recommendation Card ────────────────────────────────── */
function RecommendationCard({ rec, onApplyToStudio }: { rec: StyleRecommendation; onApplyToStudio?: (config: SuitConfig) => void }) {
  const items = [
    { label: 'Suit', item: rec.recommendation.suit },
    { label: 'Shirt', item: rec.recommendation.shirt },
    { label: 'Tie', item: rec.recommendation.tie },
    { label: 'Shoes', item: rec.recommendation.shoes },
  ];

  return (
    <div className="border border-gold/20 bg-obsidian-50/60 p-8 space-y-8">
      {/* Match score + total */}
      <div className="flex items-center justify-between border-b border-gold/10 pb-6">
        <div>
          <p className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-cream-muted/40 mb-1">
            Style Match
          </p>
          <div className="flex items-center gap-3">
            <span className="font-cormorant text-4xl text-gold font-light">{rec.matchScore}</span>
            <span className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-gold/60">/ 100</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-cream-muted/40 mb-1">
            Estimated Total
          </p>
          <span className="font-cormorant text-3xl text-cream font-light">
            SGD {rec.totalPrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Outfit items */}
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map(({ label, item }) => (
          <div key={label} className="border border-cream/5 p-5 hover:border-gold/20 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-5 h-5 border border-cream/10 flex-shrink-0"
                style={{ backgroundColor: item.hex }}
              />
              <p className="font-josefin text-[0.5rem] tracking-[0.25em] uppercase text-gold/60">{label}</p>
            </div>
            <p className="font-dm text-xs text-cream-muted/70 leading-relaxed mb-2">{item.description}</p>
            <p className="font-cormorant text-lg text-cream/60">SGD {item.price.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Colour palette */}
      {rec.palette && rec.palette.length > 0 && (
        <div>
          <p className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-cream-muted/40 mb-4">
            Your Palette
          </p>
          <div className="flex gap-3">
            {rec.palette.map(p => (
              <div key={p.name} className="flex flex-col items-center gap-2">
                <div
                  className="w-8 h-8 border border-cream/10"
                  style={{ backgroundColor: p.hex }}
                />
                <span className="font-dm text-[0.45rem] text-cream-muted/40 text-center max-w-[60px] leading-tight">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stylist note */}
      {rec.stylistNote && (
        <div className="border-t border-gold/10 pt-6">
          <p className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-cream-muted/30 mb-3">
            From the Atelier
          </p>
          <p className="font-dm text-xs text-cream-muted/50 italic leading-relaxed">{rec.stylistNote}</p>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col gap-3 pt-2">
        {onApplyToStudio && (
          <button
            data-cursor
            onClick={() => {
              const config = mapRecommendationToConfig(rec);
              onApplyToStudio(config);
              document.querySelector('#customization')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full py-4 bg-gold font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-obsidian hover:bg-gold-light transition-colors duration-300"
          >
            Build This Suit
          </button>
        )}
        <a
          href="#booking"
          onClick={e => { e.preventDefault(); document.querySelector('#booking')?.scrollIntoView({ behavior: 'smooth' }); }}
          data-cursor
          className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase px-6 py-3 border border-gold/40 text-gold hover:border-gold/70 transition-all duration-300 text-center"
        >
          Book a Fitting
        </a>
      </div>
    </div>
  );
}

/* ─── Budget Card ────────────────────────────────────────── */
function BudgetCard({
  option,
  badge,
  accentClass,
  badgeClass,
}: {
  option: OutfitOption;
  badge: string;
  accentClass: string;
  badgeClass: string;
}) {
  const total = option.suit + option.shirt + option.tie + option.shoes;

  return (
    <div className={`border ${accentClass} bg-obsidian-50/80 p-8 relative`}>
      {/* Badge */}
      <span className={`absolute top-4 right-4 font-josefin text-[0.5rem] tracking-[0.2em] uppercase px-3 py-1 ${badgeClass}`}>
        {badge}
      </span>

      <p className="font-cormorant text-2xl text-cream font-light mb-1">{option.label}</p>
      <p className="font-dm text-xs text-cream-muted/50 mb-6 leading-relaxed">{option.description}</p>

      {/* Style score */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-cream-muted/40">Style Score</span>
          <span className="font-cormorant text-xl text-gold">{option.styleScore}</span>
        </div>
        <div className="h-px bg-cream/5 relative">
          <motion.div
            className="absolute top-0 left-0 h-px bg-gold"
            initial={{ width: 0 }}
            animate={{ width: `${option.styleScore}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </div>
      </div>

      {/* Price items */}
      <div className="space-y-2 mb-6">
        {[
          { label: 'Suit', val: option.suit },
          { label: 'Shirt', val: option.shirt },
          { label: 'Tie', val: option.tie },
          { label: 'Shoes', val: option.shoes },
        ].map(({ label, val }) => (
          <div key={label} className="flex justify-between">
            <span className="font-dm text-xs text-cream-muted/40">{label}</span>
            <span className="font-dm text-xs text-cream-muted/70">SGD {val.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-cream/10 pt-4 flex justify-between items-center">
        <span className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-cream-muted/40">Total</span>
        <span className="font-cormorant text-2xl text-cream">SGD {total.toLocaleString()}</span>
      </div>
    </div>
  );
}

/* ─── Breakdown Chart ────────────────────────────────────── */
function BreakdownChart({ option, total }: { option: OutfitOption; total: number }) {
  const categories = [
    { label: 'Suit', value: option.suit, color: '#C5A230' },
    { label: 'Shirt', value: option.shirt, color: '#D4B84A' },
    { label: 'Tie', value: option.tie, color: '#8A6E1A' },
    { label: 'Shoes', value: option.shoes, color: '#F0E6C8' },
  ];

  const maxVal = Math.max(...categories.map(c => c.value));

  return (
    <div className="space-y-5">
      {categories.map(cat => {
        const pct = total > 0 ? (cat.value / total) * 100 : 0;
        const barWidth = maxVal > 0 ? (cat.value / maxVal) * 100 : 0;

        return (
          <div key={cat.label} className="flex items-center gap-6">
            <span className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-cream-muted/40 w-10 flex-shrink-0">
              {cat.label}
            </span>
            <div className="flex-1 h-px bg-cream/5 relative">
              <motion.div
                className="absolute top-0 left-0 h-px"
                style={{ backgroundColor: cat.color }}
                initial={{ width: 0 }}
                animate={{ width: `${barWidth}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              />
            </div>
            <div className="text-right flex-shrink-0 w-28">
              <span className="font-dm text-xs text-cream-muted/70">SGD {cat.value.toLocaleString()}</span>
              <span className="font-dm text-[0.5rem] text-cream-muted/30 ml-2">({pct.toFixed(0)}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
