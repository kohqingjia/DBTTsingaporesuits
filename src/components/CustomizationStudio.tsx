'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { SuitConfig, JacketDetails, PantsDetails, PersonalizationDetails } from '@/types';
import { DEFAULT_SUIT_CONFIG, mergeWithDefaults } from '@/lib/suit-defaults';
import { validateConfig, autoFixConfig } from '@/lib/suit-constraints';
import JacketDetailsSection from './JacketDetailsSection';
import TrousersSection from './TrousersSection';
import PersonalisationSection from './PersonalisationSection';

/* ─── Data ───────────────────────────────────────────────── */
const fabricMetadata = [
  { id: 'charcoal-wool',    name: 'Charcoal Wool',        color: '#3D3D3D', texture: 'Fine Worsted',     origin: 'Loro Piana, Italy' },
  { id: 'navy-herringbone', name: 'Navy Herringbone',      color: '#1B2A4A', texture: 'Herringbone Twill', origin: 'Scabal, Belgium'   },
  { id: 'midnight-velvet',  name: 'Midnight Velvet',       color: '#0D1117', texture: 'Velvet Finish',    origin: 'Dormeuil, France'  },
  { id: 'slate-flannel',    name: 'Slate Flannel',         color: '#5A6472', texture: 'Brushed Flannel',  origin: 'Holland & Sherry'  },
  { id: 'ivory-linen',      name: 'Ivory Linen',           color: '#E8DCC8', texture: 'Summer Linen',     origin: 'Solbiati, Italy'   },
  { id: 'burgundy-wool',    name: 'Burgundy Wool',         color: '#5C1A2A', texture: 'Smooth Worsted',   origin: 'Loro Piana, Italy' },
];

const lapelMetadata = [
  { id: 'peak',  name: 'Peak Lapel',  desc: 'Bold, formal authority' },
  { id: 'notch', name: 'Notch Lapel', desc: 'Versatile, timeless'    },
  { id: 'shawl', name: 'Shawl Collar',desc: 'Evening elegance'       },
];

const fitMetadata = [
  { id: 'slim',     name: 'Slim',     desc: 'Close to body, modern' },
  { id: 'tailored', name: 'Tailored', desc: 'Classic bespoke shape' },
  { id: 'relaxed',  name: 'Relaxed',  desc: 'Ease and comfort'      },
];

const liningMetadata = [
  { id: 'black',   color: '#0A0A0A', name: 'Obsidian'  },
  { id: 'gold',    color: '#C5A230', name: 'Aurum'     },
  { id: 'navy',    color: '#1B2A4A', name: 'Midnight'  },
  { id: 'red',     color: '#7A1F2E', name: 'Claret'    },
  { id: 'ivory',   color: '#F5EFE0', name: 'Ivory'     },
  { id: 'teal',    color: '#1A4A4A', name: 'Jade'      },
];

export default function CustomizationStudio({
  onCheckout,
  initialConfig,
}: {
  onCheckout?: (config: SuitConfig) => void;
  initialConfig?: Partial<SuitConfig>;
}) {
  const [config, setConfig] = useState<SuitConfig>(DEFAULT_SUIT_CONFIG);
  const [saved, setSaved] = useState(false);
  const [appliedFromStylist, setAppliedFromStylist] = useState(false);
  const [essentialsExpanded, setEssentialsExpanded] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  // Sync initialConfig from AI Stylist whenever it changes
  useEffect(() => {
    if (!initialConfig) return;
    const merged = mergeWithDefaults(initialConfig);
    const fixed = autoFixConfig(merged);
    setConfig(fixed);
    setAppliedFromStylist(true);
    const t = setTimeout(() => setAppliedFromStylist(false), 3000);
    return () => clearTimeout(t);
  }, [initialConfig]);

  const activeFabric = fabricMetadata.find(f => f.id === config.fabric) ?? fabricMetadata[0];

  const saveLook = () => {
    localStorage.setItem('picadilly-look', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] } }),
  };

  return (
    <section
      id="customization"
      ref={sectionRef}
      className="relative bg-obsidian-50 overflow-hidden py-28"
    >
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-radial-gold opacity-20 pointer-events-none" />

      <div className="max-w-screen-xl mx-auto px-8">

        {/* ── Header ── */}
        <div className="text-center mb-20">
          <motion.p custom={0.1} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="section-label mb-5">
            The Bespoke Experience
          </motion.p>
          <motion.h2 custom={0.2} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="font-cormorant text-5xl md:text-6xl font-light text-cream mb-4"
          >
            Build Your Suit
          </motion.h2>
          <motion.div custom={0.3} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="w-16 h-px bg-gold mx-auto"
          />
        </div>

        {/* ── AI Stylist applied banner ── */}
        <AnimatePresence>
          {appliedFromStylist && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mb-8 border border-gold/30 bg-gold/5 px-6 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="w-1.5 h-1.5 bg-gold block flex-shrink-0" />
                <p className="font-josefin text-[0.6rem] tracking-[0.25em] uppercase text-gold">
                  Your AI Stylist selection has been applied
                </p>
              </div>
              <p className="font-dm text-xs text-cream-muted/50">Adjust any option below to personalise further</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-start">

          {/* ── Left: Model Preview ── */}
          <motion.div
            custom={0.2}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="relative"
          >
            <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: '650px' }}>
              {/* Model image with color overlay to simulate fabric changes */}
              <div className="relative w-full h-full">
                <Image
                  src="/images/hero-model.jpg"
                  alt="Suit Preview"
                  fill
                  className="object-cover object-top transition-all duration-700"
                  style={{
                    filter: `hue-rotate(${
                      config.fabric === 'burgundy-wool'  ? '300deg' :
                      config.fabric === 'navy-herringbone' ? '0deg' :
                      config.fabric === 'charcoal-wool'  ? '0deg' :
                      config.fabric === 'ivory-linen'    ? '40deg' :
                      config.fabric === 'slate-flannel'  ? '180deg' :
                      '0deg'
                    }) saturate(${
                      config.fabric === 'midnight-velvet' ? '0.3' :
                      config.fabric === 'ivory-linen'     ? '0.5' :
                      config.fabric === 'charcoal-wool'   ? '0.2' :
                      '1'
                    }) brightness(${
                      config.fabric === 'midnight-velvet' ? '0.7' :
                      config.fabric === 'charcoal-wool'   ? '0.85' :
                      config.fabric === 'ivory-linen'     ? '1.2' :
                      '1'
                    })`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian-50/80" />
              </div>

              {/* Active fabric info overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-obsidian/80 backdrop-blur-sm border border-gold/20 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-cormorant text-xl text-cream">{activeFabric.name}</p>
                      <p className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-gold/70 mt-0.5">
                        {activeFabric.texture} · {activeFabric.origin}
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-none border border-gold/30"
                      style={{ backgroundColor: activeFabric.color }}
                    />
                  </div>
                </div>
              </div>

              {/* Lapel badge */}
              <div className="absolute top-6 left-6">
                <div className="bg-obsidian/70 backdrop-blur-sm px-3 py-1.5 border border-gold/15">
                  <p className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-gold/80">
                    {lapelMetadata.find(l => l.id === config.lapel)?.name}
                  </p>
                </div>
              </div>

              {/* Fit badge */}
              <div className="absolute top-6 right-6">
                <div className="bg-obsidian/70 backdrop-blur-sm px-3 py-1.5 border border-gold/15">
                  <p className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-gold/80">
                    {fitMetadata.find(f => f.id === config.fit)?.name} Fit
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Controls ── */}
          <motion.div
            custom={0.3}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="space-y-0"
          >

            {/* ─── ESSENTIALS Section (Fields 01–05 Collapsible) ─── */}
            <div className="border border-gold/10">
              <button
                onClick={() => setEssentialsExpanded(!essentialsExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-obsidian-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <motion.span
                    animate={{ rotate: essentialsExpanded ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gold text-lg"
                  >
                    ▸
                  </motion.span>
                  <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream">
                    Essentials
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {essentialsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-gold/10"
                  >
                    <div className="px-6 py-5 space-y-10">
                      {/* Fabric */}
                      <div>
                        <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-5">
                          01 &nbsp; Fabric
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {fabricMetadata.map((f) => (
                            <button
                              key={f.id}
                              data-cursor
                              onClick={() => setConfig(c => ({ ...c, fabric: f.id }))}
                              className={`group relative p-3 border transition-all duration-300 text-left
                                ${config.fabric === f.id ? 'border-gold' : 'border-cream/10 hover:border-gold/40'}`}
                            >
                              <div className="w-full h-6 mb-2 rounded-none" style={{ backgroundColor: f.color }} />
                              <p className={`font-josefin text-[0.48rem] tracking-[0.15em] uppercase leading-tight
                                ${config.fabric === f.id ? 'text-gold' : 'text-cream-muted/50 group-hover:text-cream-muted'}`}>
                                {f.name}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Lapel */}
                      <div>
                        <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-5">
                          02 &nbsp; Lapel Style
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {lapelMetadata.map((l) => (
                            <button
                              key={l.id}
                              data-cursor
                              onClick={() => setConfig(c => ({ ...c, lapel: l.id }))}
                              className={`p-4 border transition-all duration-300 text-center
                                ${config.lapel === l.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                            >
                              <p className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                                ${config.lapel === l.id ? 'text-gold' : 'text-cream-muted/60'}`}>
                                {l.name}
                              </p>
                              <p className="font-dm text-[0.45rem] text-cream-muted/30">{l.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fit */}
                      <div>
                        <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-5">
                          03 &nbsp; Fit
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {fitMetadata.map((f) => (
                            <button
                              key={f.id}
                              data-cursor
                              onClick={() => setConfig(c => ({ ...c, fit: f.id }))}
                              className={`p-4 border transition-all duration-300 text-center
                                ${config.fit === f.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                            >
                              <p className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                                ${config.fit === f.id ? 'text-gold' : 'text-cream-muted/60'}`}>
                                {f.name}
                              </p>
                              <p className="font-dm text-[0.45rem] text-cream-muted/30">{f.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Lining */}
                      <div>
                        <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-5">
                          04 &nbsp; Lining Colour
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          {liningMetadata.map((l) => (
                            <button
                              key={l.id}
                              data-cursor
                              title={l.name}
                              onClick={() => setConfig(c => ({ ...c, lining: l.id }))}
                              className={`relative w-9 h-9 transition-all duration-300 border
                                ${config.lining === l.id ? 'border-gold scale-110' : 'border-cream/10 hover:border-gold/40'}`}
                              style={{ backgroundColor: l.color }}
                            >
                              {config.lining === l.id && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="font-dm text-[0.5rem] text-cream-muted/30 mt-2">
                          {liningMetadata.find(l => l.id === config.lining)?.name}
                        </p>
                      </div>

                      {/* Buttons */}
                      <div>
                        <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-5">
                          05 &nbsp; Button Count
                        </p>
                        <div className="flex gap-3">
                          {[1, 2, 3].map((n) => (
                            <button
                              key={n}
                              data-cursor
                              onClick={() => setConfig(c => ({ ...c, buttons: n }))}
                              className={`w-12 h-12 border font-cormorant text-xl transition-all duration-300
                                ${config.buttons === n ? 'border-gold text-gold bg-gold/5' : 'border-cream/10 text-cream-muted/50 hover:border-gold/40'}`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── Jacket Details Section (Fields 06–16) ─── */}
            <JacketDetailsSection
              config={config}
              onUpdate={(jacket) => setConfig(c => {
                const updated = { ...c, jacket: { ...c.jacket, ...jacket } };
                return mergeWithDefaults(updated as Partial<SuitConfig>);
              })}
            />

            {/* ─── Trousers Section (Fields 17–21) ─── */}
            <TrousersSection
              config={config}
              onUpdate={(pants) => setConfig(c => {
                const updated = { ...c, pants: { ...c.pants, ...pants } };
                return mergeWithDefaults(updated as Partial<SuitConfig>);
              })}
            />

            {/* ─── Personalisation Section (Fields 22–24) ─── */}
            <PersonalisationSection
              config={config}
              onUpdate={(personalization) => setConfig(c => {
                const updated = { ...c, personalization: { ...c.personalization, ...personalization } };
                return mergeWithDefaults(updated as Partial<SuitConfig>);
              })}
            />

            {/* Save + Order */}
            <div className="flex flex-col gap-3 pt-6 border-t border-gold/10 mt-4">
              <button
                onClick={() => onCheckout?.(config)}
                data-cursor
                className="w-full py-4 bg-gold font-josefin text-[0.6rem] tracking-[0.3em] uppercase
                  text-obsidian hover:bg-gold-light transition-colors duration-300"
              >
                Proceed to Order
              </button>
              <button
                onClick={saveLook}
                data-cursor
                className="w-full py-4 border border-gold/40 font-josefin text-[0.6rem] tracking-[0.3em] uppercase
                  text-gold hover:border-gold/70 transition-all duration-300"
              >
                <AnimatePresence mode="wait">
                  {saved ? (
                    <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Saved ✓
                    </motion.span>
                  ) : (
                    <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Save Look
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
