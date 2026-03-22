'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const details = [
  {
    id: 'canvas',
    number: '01',
    title: 'Full Floating Canvas',
    short: 'The invisible architecture',
    body: `Unlike fused suits that glue a stiff interlining to the fabric, our garments are built on a full floating canvas — a layer of horsehair and linen that moves independently. Over years of wear, this canvas molds to your chest, creating a drape that is uniquely yours. It cannot be replicated by machine.`,
    stat: '3 layers of hand-stitched interlining',
  },
  {
    id: 'basting',
    number: '02',
    title: 'Hand Basting',
    short: 'The art of the fitting',
    body: `Before a single permanent stitch is made, your suit is assembled with long, temporary basting threads. This allows us to adjust every seam, every dart, and every curve with surgical precision during your fitting — ensuring that when the final garment is sewn, it is already perfect.`,
    stat: 'Minimum 2 fittings per garment',
  },
  {
    id: 'buttonholes',
    number: '03',
    title: "Surgeon's Buttonholes",
    short: 'The mark of bespoke',
    body: `The functional buttons on the sleeve cuff — known as surgeon's cuffs — are the ultimate hallmark of a bespoke suit. Each buttonhole is cut by hand and finished with silk thread, individually. They actually unbutton. A small detail that speaks volumes to those who know.`,
    stat: '4 working buttons per cuff',
  },
  {
    id: 'shoulders',
    number: '04',
    title: 'Roped Shoulders',
    short: 'Sculptural precision',
    body: `Our signature shoulder construction features a rolled, roped head — slightly raised at the sleeve head — which creates a clean, authoritative silhouette. Achieved entirely by hand, it requires a craftsman's touch to execute without puckering or distortion.`,
    stat: 'Each shoulder takes 4+ hours to set',
  },
  {
    id: 'lining',
    number: '05',
    title: 'Bespoke Lining',
    short: 'The private statement',
    body: `The lining is your interior conversation. Chosen from Italian silks and pure acetates, it is hand-inserted with a slip-stitch hem that allows the garment to breathe and move. We can add your initials, a significant date, or a personal motif — hidden from the world, known only to you.`,
    stat: 'Hand-stitched silk or Italian acetate',
  },
];

export default function CraftsmanshipSection() {
  const [open, setOpen] = useState<string | null>('canvas');
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] } }),
  };

  return (
    <section
      id="craftsmanship"
      ref={sectionRef}
      className="relative bg-obsidian-50 py-28 overflow-hidden"
    >
      {/* Vertical gold line accent */}
      <div className="absolute left-1/2 top-0 w-px h-24 bg-gradient-to-b from-transparent to-gold/30 pointer-events-none" />

      <div className="max-w-screen-xl mx-auto px-8">

        {/* ── Header ── */}
        <div className="grid lg:grid-cols-2 gap-20 mb-20 items-end">
          <div>
            <motion.p custom={0.1} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="section-label mb-5">
              The Atelier
            </motion.p>
            <motion.h2 custom={0.2} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
              className="font-cormorant text-5xl md:text-6xl font-light text-cream leading-tight"
            >
              The Art <span className="italic text-gold">Within</span>
            </motion.h2>
          </div>
          <motion.p custom={0.35} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="font-dm text-cream-muted/60 text-sm leading-relaxed"
          >
            A bespoke suit is not merely tailored — it is built. Every element, from the
            horsehair canvas to the last silk stitch, reflects a tradition of precision
            that cannot be compressed, automated, or shortcut.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-16 items-start">

          {/* ── Accordion ── */}
          <motion.div custom={0.3} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="divide-y divide-gold/10"
          >
            {details.map((d, i) => (
              <div key={d.id}>
                <button
                  data-cursor
                  className="w-full py-7 flex items-start gap-6 text-left group"
                  onClick={() => setOpen(open === d.id ? null : d.id)}
                >
                  <span className="font-josefin text-[0.55rem] tracking-[0.2em] text-gold/40 mt-1 shrink-0 w-6">
                    {d.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className={`font-cormorant text-2xl transition-colors duration-300
                        ${open === d.id ? 'text-gold' : 'text-cream group-hover:text-cream/80'}`}>
                        {d.title}
                      </p>
                      <motion.span
                        animate={{ rotate: open === d.id ? 45 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-gold/60 shrink-0 font-light text-xl leading-none"
                      >
                        +
                      </motion.span>
                    </div>
                    <p className="font-dm text-[0.65rem] text-cream-muted/40 mt-1">{d.short}</p>
                  </div>
                </button>

                <AnimatePresence>
                  {open === d.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pl-12">
                        <p className="font-dm text-sm text-cream-muted/60 leading-relaxed mb-5">
                          {d.body}
                        </p>
                        <div className="inline-flex items-center gap-3">
                          <span className="w-8 h-px bg-gold/60" />
                          <span className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-gold/70">
                            {d.stat}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>

          {/* ── Right: Image placeholder 16:9 → portrait ── */}
          <motion.div custom={0.4} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="lg:sticky lg:top-28 space-y-4"
          >
            {/* Portrait placeholder (3:4 ratio) */}
            <div
              className="w-full overflow-hidden border border-gold/15 relative"
              style={{ aspectRatio: '3/4' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-obsidian-50 to-obsidian flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-px bg-gold/30" />
                <p className="font-josefin text-[0.5rem] tracking-[0.25em] uppercase text-gold/30">
                  Craft Detail
                </p>
                <p className="font-dm text-[0.5rem] text-cream-muted/20">Close-up photography</p>
                <div className="w-10 h-px bg-gold/30" />
              </div>
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gold/3 to-transparent animate-pulse-slow" />
            </div>

            {/* Small detail: currently active */}
            <AnimatePresence mode="wait">
              {open && (
                <motion.div
                  key={open}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border border-gold/20 px-5 py-4"
                >
                  <p className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-gold/60 mb-1">
                    Currently viewing
                  </p>
                  <p className="font-cormorant text-lg text-cream">
                    {details.find(d => d.id === open)?.title}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ── Full-width 16:9 image placeholder ── */}
        <motion.div custom={0.5} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="mt-20"
        >
          <div className="placeholder-16-9 w-full">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-px bg-gold/40" />
              <p className="font-josefin text-[0.55rem] tracking-[0.3em] uppercase text-gold/40">
                Atelier Photograph
              </p>
              <p className="font-dm text-xs text-cream-muted/30">
                16:9 — Workshop / Craft Photography
              </p>
              <div className="w-12 h-px bg-gold/40" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
