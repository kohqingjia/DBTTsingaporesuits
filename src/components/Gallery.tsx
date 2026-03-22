'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

/* ─── Gallery items — replace src with real images ── */
const galleryItems = [
  { id: 1, ratio: '3/4',  label: 'Navy Double-Breasted',  tag: 'Wedding' },
  { id: 2, ratio: '1/1',  label: 'Charcoal Business Suit', tag: 'Corporate' },
  { id: 3, ratio: '16/9', label: 'White Tie Evening',       tag: 'Black Tie', wide: true },
  { id: 4, ratio: '3/4',  label: 'Slim Tan Suit',           tag: 'Summer'    },
  { id: 5, ratio: '1/1',  label: 'Tuxedo Lapel Close-Up',  tag: 'Detail'    },
  { id: 6, ratio: '3/4',  label: 'Grey Herringbone',        tag: 'Business'  },
  { id: 7, ratio: '16/9', label: 'Atelier Process',          tag: 'Behind the Seams', wide: true },
];

function GalleryItem({ item, index, inView }: { item: typeof galleryItems[0]; index: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden group cursor-none ${item.wide ? 'col-span-2' : ''}`}
      style={{ aspectRatio: item.ratio }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-cursor
    >
      {/* Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-obsidian-50 to-obsidian border border-gold/10 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-px bg-gold/25" />
        <p className="font-josefin text-[0.5rem] tracking-[0.25em] uppercase text-gold/30">
          {item.label}
        </p>
        <p className="font-dm text-[0.45rem] text-cream-muted/20">
          {item.ratio === '16/9' ? '16:9' : item.ratio === '3/4' ? '3:4 Portrait' : '1:1'} — Please provide image
        </p>
        <div className="w-8 h-px bg-gold/25" />
      </div>

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 bg-obsidian/70 flex flex-col items-center justify-center"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-gold mb-2">
          {item.tag}
        </span>
        <span className="font-cormorant text-xl text-cream">{item.label}</span>
      </motion.div>
    </motion.div>
  );
}

export default function Gallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] } }),
  };

  return (
    <section id="gallery" ref={sectionRef} className="relative bg-obsidian py-28 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-8">

        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-14">
          <div>
            <motion.p custom={0.1} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="section-label mb-4">
              The Collection
            </motion.p>
            <motion.h2 custom={0.2} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
              className="font-cormorant text-5xl md:text-6xl font-light text-cream"
            >
              Gallery
            </motion.h2>
          </div>
          <motion.div custom={0.3} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="hidden md:flex items-center gap-3"
          >
            <span className="font-josefin text-[0.55rem] tracking-[0.25em] uppercase text-cream-muted/40">
              Every suit, a portrait
            </span>
            <div className="w-16 h-px bg-gold/30" />
          </motion.div>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {galleryItems.map((item, i) => (
            <GalleryItem key={item.id} item={item} index={i} inView={inView} />
          ))}
        </div>

        {/* ── CTA ── */}
        <motion.div custom={0.6} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="text-center mt-14"
        >
          <a
            href="#contact"
            data-cursor
            className="inline-flex items-center gap-4 font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 hover:text-gold transition-colors duration-300"
          >
            <span>Commission Your Look</span>
            <span className="block w-16 h-px bg-current transition-colors duration-300" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
