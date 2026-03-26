'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const modelY    = useTransform(scrollYProgress, [0, 1], ['0%', '-8%']);
  const textY     = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const opacity   = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale     = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  // Letter-by-letter animation for headline
  const headline1 = 'CRAFTED';
  const headline2 = 'FOR DISTINCTION';

  return (
    <section
      ref={heroRef}
      className="relative h-screen min-h-[700px] overflow-hidden bg-obsidian flex items-center justify-center"
    >
      {/* ── Background dark radial glow ── */}
      <div className="absolute inset-0 bg-radial-gold opacity-40 pointer-events-none" />

      {/* ── Hero Model Image ── */}
      <motion.div
        style={{ y: modelY, scale }}
        className="absolute inset-0 flex items-end justify-center"
      >
        <div className="relative w-full h-full">
          <Image
            src="/images/hero-model.jpg"
            alt="Picadilly Tailors — Bespoke Suit"
            fill
            className="object-cover"
            style={{ objectPosition: 'center -5%' }}
            priority
            quality={95}
          />
          {/* Dark vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/40 via-transparent to-obsidian/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian/60 via-transparent to-obsidian/60" />
        </div>
      </motion.div>


      {/* ── Main Text ── */}
      <motion.div
        style={{ y: textY, opacity }}
        className="absolute inset-x-0 bottom-20 flex flex-col items-center text-center z-20 px-4"
      >
        {/* Brand mark */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          animate={{ opacity: 1, letterSpacing: '0.4em' }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="font-josefin text-[0.6rem] text-gold mb-6 uppercase"
        >
          Picadilly Tailors — Singapore
        </motion.p>

        {/* Main headline */}
        <div className="overflow-hidden mb-1">
          <motion.h1
            className="font-cormorant text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-light tracking-widest text-cream leading-none"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
          >
            {headline1}
          </motion.h1>
        </div>

        {/* Gold separator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-24 h-px bg-gold my-4"
        />

        <div className="overflow-hidden">
          <motion.h2
            className="font-cormorant italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-cream/80 tracking-[0.2em]"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
          >
            for Distinction
          </motion.h2>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.4 }}
          className="flex items-center gap-6 mt-8"
        >
          <a
            href="#customization"
            onClick={(e) => { e.preventDefault(); document.querySelector('#customization')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase px-7 py-3 bg-gold text-obsidian hover:bg-gold-light transition-colors duration-300"
          >
            Build Your Suit
          </a>
        </motion.div>
      </motion.div>

      {/* ── Scroll Indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="absolute bottom-6 right-8 z-20 flex flex-col items-center gap-2"
      >
        <span className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-cream/30 rotate-90 origin-center mb-2">
          Scroll
        </span>
        <div className="w-px h-12 scroll-indicator-line bg-gold/40" />
      </motion.div>

      {/* ── Year badge ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.8 }}
        className="absolute bottom-6 left-8 z-20"
      >
        <p className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-cream/30">
          Est. 1930
        </p>
      </motion.div>
    </section>
  );
}
