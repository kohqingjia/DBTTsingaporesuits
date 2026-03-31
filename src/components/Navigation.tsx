'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'Heritage', href: '#heritage' },
  { label: 'Gallery',  href: '#gallery' },
  { label: 'Atelier',  href: '#craftsmanship' },
  { label: 'Bespoke',  href: '#customization' },
  { label: 'Body Scan',href: '#body-scan' },
  { label: 'Book',     href: '#booking' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-[9000] px-8 py-5 transition-all duration-700
          ${scrolled ? 'nav-blur bg-obsidian/80 border-b border-gold/10' : 'bg-transparent'}`}
      >
        <div className="max-w-screen-xl mx-auto flex items-center">
          {/* Left nav links */}
          <div className="hidden md:flex items-center gap-10 flex-1">
            {navLinks.slice(0, 2).map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className="hover-underline font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted hover:text-cream transition-colors duration-300"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center shrink-0">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Image
                src="/images/logo.png"
                alt="Picadilly Tailors"
                width={120}
                height={56}
                className="object-contain"
                style={{ mixBlendMode: 'screen', filter: 'brightness(1.1) contrast(1.1)' }}
                priority
              />
            </button>
          </div>

          {/* Right nav links + CTA */}
          <div className="hidden md:flex items-center gap-10 flex-1 justify-end">
            {navLinks.slice(2).map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className="hover-underline font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted hover:text-cream transition-colors duration-300"
              >
                {link.label}
              </button>
            ))}
            <a
              href="/loyalty.html"
              className="hover-underline font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted hover:text-cream transition-colors duration-300"
            >
              Loyalty
            </a>
            <a
              href="/track-order.html"
              className="hover-underline font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted hover:text-cream transition-colors duration-300"
            >
              Track Order
            </a>
            <a
              href="#contact"
              className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase px-5 py-2.5 border border-gold/60 text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
            >
              Consult
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`block w-6 h-px bg-gold transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-4 h-px bg-gold transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-gold transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[8999] bg-obsidian/98 nav-blur flex flex-col items-center justify-center gap-10"
          >
            {[...navLinks, { label: 'Contact', href: '#contact' }].map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                onClick={() => handleNav(link.href)}
                className="font-cormorant text-4xl font-light text-cream hover:text-gold transition-colors duration-300"
              >
                {link.label}
              </motion.button>
            ))}
            <motion.a
              href="/loyalty.html"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (navLinks.length + 1) * 0.08, duration: 0.5 }}
              className="font-cormorant text-4xl font-light text-gold hover:text-gold-light transition-colors duration-300"
            >
              Loyalty
            </motion.a>
            <motion.a
              href="/track-order.html"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (navLinks.length + 2) * 0.08, duration: 0.5 }}
              className="font-cormorant text-4xl font-light text-cream hover:text-gold transition-colors duration-300"
            >
              Track Order
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
