'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

/* ─── Types ──────────────────────────────────────────────── */
interface Occasion {
  id: string;
  name: string;
  tagline: string;
  image: string;
  alt: string;
  imgPos: string;
  imgClass?: string;
}

interface OccasionSelectorProps {
  onSelect?: (occasion: string) => void;
}

/* ─── Data ───────────────────────────────────────────────── */
const occasions: Occasion[] = [
  {
    id: 'wedding',
    name: 'Wedding',
    tagline: 'Timeless elegance for your most important day',
    image: '/images/occasion-wedding.jpg',
    alt: 'Man in bespoke wedding suit',
    imgPos: 'center 0%',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    tagline: 'Command the boardroom with quiet authority',
    image: '/images/occasion-corporate.jpg',
    alt: 'Man in tailored corporate suit',
    imgPos: 'center 0%',
  },
  {
    id: 'black-tie',
    name: 'Black Tie',
    tagline: 'The pinnacle of formal evening dress',
    image: '/images/occasion-black-tie.jpg',
    alt: 'Man in black tie bespoke tuxedo',
    imgPos: 'center 0%',
  },
  {
    id: 'smart-casual',
    name: 'Smart Casual',
    tagline: 'Effortless refinement for everyday occasions',
    image: '/images/occasion-smart-casual.jpg',
    alt: 'Man in smart casual bespoke attire',
    imgPos: 'center 0%',
  },
  {
    id: 'special-event',
    name: 'Special Event',
    tagline: 'Make an impression that lingers long after',
    image: '/images/occasion-special-event.jpg',
    alt: 'Man in distinctive special event suit',
    imgPos: 'center 0%',
  },
];

/* ─── Component ──────────────────────────────────────────── */
export default function OccasionSelector({ onSelect }: OccasionSelectorProps) {
  const handleSelect = (occasionName: string) => {
    onSelect?.(occasionName);
    const stylistSection = document.getElementById('ai-stylist');
    if (stylistSection) {
      stylistSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative bg-obsidian-100 py-28 overflow-hidden">
      {/* Subtle gold gradient top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-screen-xl mx-auto px-8">

        {/* ── Header ── */}
        <div className="mb-16 max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="font-josefin text-xs tracking-[0.3em] uppercase text-gold mb-5"
          >
            Begin Your Journey
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="font-cormorant text-5xl md:text-6xl font-light text-cream leading-tight"
          >
            Select Your <span className="italic text-gold">Occasion</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-dm text-sm text-cream-muted/60 mt-5 leading-relaxed"
          >
            Every occasion demands its own language. Choose yours, and our AI stylist
            will craft a recommendation built around your moment.
          </motion.p>
        </div>

        {/* ── Occasion Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {occasions.map((occasion, i) => (
            <motion.button
              key={occasion.id}
              data-cursor
              onClick={() => handleSelect(occasion.name)}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col text-left overflow-hidden border border-gold/10 hover:border-gold/50 transition-all duration-500 bg-obsidian-50/80 backdrop-blur-sm"
            >
              {/* Image */}
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                <div className="absolute inset-0 bg-obsidian/20 group-hover:bg-obsidian/10 transition-all duration-500 z-10" />

                {/* Placeholder shimmer if no image */}
                <div className="absolute inset-0 bg-gradient-to-b from-obsidian-50/30 to-obsidian/80 z-0" />
                <div className="w-full h-full bg-obsidian-50 flex items-center justify-center">
                  <OccasionImage src={occasion.image} alt={occasion.alt} imgPos={occasion.imgPos} imgClass={occasion.imgClass} />
                </div>

                {/* Gold corner accent on hover */}
                <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-gold/0 group-hover:border-gold/80 transition-all duration-300 z-20" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-gold/0 group-hover:border-gold/80 transition-all duration-300 z-20" />
              </div>

              {/* Text content */}
              <div className="p-5 border-t border-gold/10 group-hover:border-gold/30 transition-colors duration-300 flex-1">
                <p className="font-josefin text-[0.6rem] tracking-[0.25em] uppercase text-gold mb-2">
                  {occasion.name}
                </p>
                <p className="font-dm text-[0.7rem] text-cream-muted/80 group-hover:text-cream-muted transition-colors duration-300 leading-relaxed">
                  {occasion.tagline}
                </p>
              </div>

              {/* CTA reveal */}
              <div className="px-5 pb-4 overflow-hidden">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <span className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-gold">
                    Select
                  </span>
                  <div className="h-px flex-1 bg-gold/40" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="mt-24 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>
    </section>
  );
}

/* ─── OccasionImage — graceful fallback ─────────────────── */
function OccasionImage({ src, alt, imgPos, imgClass }: { src: string; alt: string; imgPos: string; imgClass?: string }) {
  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ${imgClass ?? ''}`}
        style={{ objectPosition: imgPos }}
        sizes="(max-width: 768px) 50vw, 20vw"
        onError={() => {/* silently fail — placeholder already shown */}}
      />
    </div>
  );
}
