'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';

const quickLinks = [
  { label: 'Heritage', href: '#heritage' },
  { label: 'Bespoke Studio', href: '#customization' },
  { label: 'The Atelier', href: '#craftsmanship' },
  { label: 'Gallery', href: '#gallery' },
];

const legal = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms & Conditions', href: '#' },
];

export default function Footer() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-60px' });

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer ref={sectionRef} id="contact" className="bg-obsidian border-t border-gold/10">

      {/* ── Contact CTA Band ── */}
      <div className="border-b border-gold/10 py-24 px-8">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="section-label mb-5"
              >
                Visit the Atelier
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="font-cormorant text-5xl md:text-6xl font-light text-cream mb-6 leading-tight"
              >
                Begin Your <span className="italic text-gold">Bespoke</span> Journey
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="font-dm text-cream-muted/60 text-sm leading-relaxed max-w-lg mb-8"
              >
                Every suit begins with a conversation. Visit us at Far East Plaza and let
                Suresh guide you through the bespoke process — from selecting your cloth
                to your first fitting.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <a
                  href="tel:+6591462774"
                  data-cursor
                  className="inline-flex items-center gap-4 font-josefin text-[0.6rem] tracking-[0.3em] uppercase px-7 py-4 bg-gold text-obsidian hover:bg-gold-light transition-colors duration-300"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.68 9.81a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +65 9146 2774
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=6591462774"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor
                  className="inline-flex items-center gap-4 font-josefin text-[0.6rem] tracking-[0.3em] uppercase px-7 py-4 border border-gold/60 text-gold hover:bg-gold/10 transition-colors duration-300"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </motion.div>
            </div>

            {/* Address card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.35 }}
              className="border border-gold/15 p-8 space-y-6"
            >
              <p className="font-josefin text-[0.55rem] tracking-[0.3em] uppercase text-gold/70 mb-6">
                The Atelier
              </p>
              <div className="space-y-1">
                <p className="font-cormorant text-xl text-cream">Far East Plaza</p>
                <p className="font-dm text-sm text-cream-muted/60">14 Scotts Road, #02-85</p>
                <p className="font-dm text-sm text-cream-muted/60">Singapore 228213</p>
              </div>
              <div className="w-8 h-px bg-gold/40" />
              <div className="space-y-1">
                <p className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-cream-muted/40 mb-2">
                  Opening Hours
                </p>
                <p className="font-dm text-sm text-cream-muted/60">Monday – Saturday: 11am – 8pm</p>
                <p className="font-dm text-sm text-cream-muted/60">Sunday: 12pm – 6pm</p>
              </div>
              <div className="w-8 h-px bg-gold/40" />

              {/* Map */}
              <div className="relative w-full mt-4 overflow-hidden border border-gold/15" style={{ aspectRatio: '16/7' }}>
                <Image
                  src="/images/map-far-east-plaza.jpg"
                  alt="Far East Plaza location map"
                  fill
                  className="object-cover"
                  sizes="600px"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Footer Bottom ── */}
      <div className="px-8 py-12">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">

            {/* Logo */}
            <div>
              <Image
                src="/images/logo.png"
                alt="Picadilly Tailors"
                width={100}
                height={48}
                className="object-contain mb-4"
                style={{ mixBlendMode: 'screen', filter: 'brightness(0.95) contrast(1.1)' }}
              />
              <p className="font-dm text-[0.6rem] text-cream-muted/30 max-w-[200px] leading-relaxed">
                Bespoke tailoring for Singapore's most discerning gentlemen.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-4">
              <div>
                <p className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-gold/40 mb-4">Navigate</p>
                {quickLinks.map((l) => (
                  <button
                    key={l.label}
                    onClick={() => scrollTo(l.href)}
                    data-cursor
                    className="block font-dm text-xs text-cream-muted/40 hover:text-gold/80 transition-colors duration-300 mb-2"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
              <div>
                <p className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-gold/40 mb-4">Legal</p>
                {legal.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    data-cursor
                    className="block font-dm text-xs text-cream-muted/40 hover:text-gold/80 transition-colors duration-300 mb-2"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <p className="font-josefin text-[0.5rem] tracking-[0.3em] uppercase text-gold/40 mb-4">Follow</p>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/picadillytailors/"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor
                  className="w-9 h-9 border border-cream/10 flex items-center justify-center text-cream-muted/40 hover:border-gold/50 hover:text-gold transition-all duration-300"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/picadillytailors"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor
                  className="w-9 h-9 border border-cream/10 flex items-center justify-center text-cream-muted/40 hover:border-gold/50 hover:text-gold transition-all duration-300"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright line */}
          <div className="mt-12 pt-6 border-t border-gold/8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-dm text-[0.5rem] text-cream-muted/20 tracking-widest">
              © {new Date().getFullYear()} Picadilly Tailors. All rights reserved.
            </p>
            <p className="font-josefin text-[0.45rem] tracking-[0.25em] uppercase text-cream-muted/15">
              14 Scotts Road · Far East Plaza #02-85 · Singapore
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
