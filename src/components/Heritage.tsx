'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: 90, suffix: '+', label: 'Years of Heritage' },
  { value: 10000, suffix: '+', label: 'Suits Crafted' },
  { value: 50, suffix: '+', label: 'Nations Represented' },
  { value: 1, suffix: '', label: 'Master Craftsman' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {value >= 1000 ? (count >= 1000 ? '10,000' : count.toLocaleString()) : count}
      {suffix}
    </span>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function Heritage() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section
      id="heritage"
      ref={sectionRef}
      className="relative bg-obsidian overflow-hidden"
    >
      {/* ── Marquee Banner ── */}
      <div className="border-y border-gold/15 py-3 overflow-hidden">
        <div className="marquee-track">
          {Array(8).fill(null).map((_, i) => (
            <span key={i} className="font-josefin text-[0.55rem] tracking-[0.4em] uppercase text-gold/40 px-8">
              Bespoke Tailoring &nbsp;&bull;&nbsp; Singapore &nbsp;&bull;&nbsp; Est. 1930 &nbsp;&bull;&nbsp; Far East Plaza &nbsp;&bull;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── Main Heritage Content ── */}
      <div className="max-w-screen-xl mx-auto px-8 py-28">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Left: Text */}
          <div>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="section-label mb-8"
            >
              Our Heritage
            </motion.p>

            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-cormorant text-5xl md:text-6xl font-light text-cream leading-tight mb-8"
            >
              Nearly a Century of{' '}
              <span className="italic text-gold">Tailoring</span> Heritage
            </motion.h2>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="w-12 h-px bg-gold mb-8"
            />

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-dm text-cream-muted/70 text-base leading-relaxed mb-6"
            >
              Picadilly Tailors is a dedicated team of fashion consultants who are experts in
              recommending the perfect suit for every occasion. Founded with a singular devotion
              to craftsmanship, we have been dressing Singapore's most discerning gentlemen for
              generations.
            </motion.p>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="font-dm text-cream-muted/70 text-base leading-relaxed mb-12"
            >
              Whether it's a business suit, a wedding suit, or a black-tie tuxedo — every garment
              is cut, canvassed, and constructed by hand. No shortcuts. No compromises.
              Only the art of bespoke.
            </motion.p>

            <motion.a
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.7, delay: 0.6 }}
              href="#contact"
              className="inline-flex items-center gap-4 font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-gold hover:text-cream-muted transition-colors duration-300"
            >
              <span>Our Story</span>
              <span className="block w-12 h-px bg-current" />
            </motion.a>
          </div>

          {/* Right: Image placeholder (16:9) */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="placeholder-16-9 w-full">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-px bg-gold/40" />
                <p className="font-josefin text-[0.55rem] tracking-[0.3em] uppercase text-gold/40">
                  Heritage Image
                </p>
                <p className="font-dm text-xs text-cream-muted/30">
                  16:9 — Please provide your image
                </p>
                <div className="w-12 h-px bg-gold/40" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Stats Row ── */}
        <div className="mt-28 grid grid-cols-2 md:grid-cols-4 gap-px bg-gold/10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.1 }}
              className="bg-obsidian px-8 py-12 text-center"
            >
              <p className="font-cormorant text-5xl md:text-6xl font-light text-gold mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="font-josefin text-[0.55rem] tracking-[0.25em] uppercase text-cream-muted/50">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Awards Row ── */}
      <div className="border-t border-gold/10 bg-obsidian-50 px-8 py-16">
        <div className="max-w-screen-xl mx-auto">
          <p className="section-label text-center mb-10">Recognised Excellence</p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-50">
            {[
              'Best in Singapore',
              'SmartSingapore',
              'MediaOne Top Tailor',
              "Singapore's Finest",
              'Rating.sg',
            ].map((award) => (
              <span key={award} className="font-josefin text-[0.6rem] tracking-[0.25em] uppercase text-cream-muted">
                {award}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
