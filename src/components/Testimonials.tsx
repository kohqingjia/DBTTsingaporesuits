'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';

const reviews = [
  {
    name: 'Yvan',
    occasion: 'Wedding Suit',
    rating: 5,
    body: 'Suresh accomplished Mission Impossible. Only given a week before my wedding, he expertly made a bespoke 3-piece suit tailored just for me. Best yet, with just 1 fitting, the suit was perfect and made me feel like a million bucks.',
  },
  {
    name: 'Sharad Somani',
    occasion: 'Business Suit',
    rating: 5,
    body: 'I visited Picadilly based on a strong recommendation. Suresh is a master of his craft — honest and efficient. He made the entire process from selecting the cloth to finalising the design very smooth. My suits arrived within a week and they are a perfect fit.',
  },
  {
    name: 'Aifirth Lian',
    occasion: 'Two Bespoke Suits',
    rating: 5,
    body: "Suresh is fantastic. I ordered two suits, and they were ready in record time. He's incredibly knowledgeable about fabrics and styles, directing me to the perfect materials I desired. Extremely honest about the entire process from cost to post-sale.",
  },
  {
    name: 'Wen Chu',
    occasion: 'Tailored Jacket',
    rating: 5,
    body: 'I highly recommend Picadilly Tailors to anyone seeking exceptional tailoring. They are not just creating clothes — they are crafting confidence and elegance. Suresh is such a bundle of joy, always puts a smile on my face.',
  },
  {
    name: 'M Sanjivan',
    occasion: 'Wedding Reception',
    rating: 5,
    body: 'I visited to get a customised suit for a wedding reception and the experience was nothing short of exceptional. Suresh personally guided me through every step, making it enjoyable and stress-free.',
  },
  {
    name: 'Kenji',
    occasion: 'First Bespoke Experience',
    rating: 5,
    body: 'Suresh was very professional. He understood it was my first experience with a tailored suit, offered suggestions, and showed me samples that matched my expectations. Will definitely come back for future purchases.',
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-80px' });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const go = (idx: number) => {
    setDirection(idx > active ? 1 : -1);
    setActive(idx);
  };

  const next = () => { setDirection(1); setActive(a => (a + 1) % reviews.length); };
  const prev = () => { setDirection(-1); setActive(a => (a - 1 + reviews.length) % reviews.length); };

  // Auto-advance
  useEffect(() => {
    intervalRef.current = setInterval(next, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, delay: d, ease: [0.22, 1, 0.36, 1] } }),
  };

  const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: -dir * 60 }),
  };

  const review = reviews[active];

  return (
    <section ref={sectionRef} className="relative bg-obsidian-50 py-28 overflow-hidden">

      {/* Large decorative quote mark */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 font-cormorant text-[20rem] text-gold/5 leading-none pointer-events-none select-none" aria-hidden="true">
        &ldquo;
      </div>

      <div className="max-w-screen-xl mx-auto px-8">

        {/* ── Header ── */}
        <div className="text-center mb-20">
          <motion.p custom={0.1} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="section-label mb-5">
            Client Stories
          </motion.p>
          <motion.h2 custom={0.2} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="font-cormorant text-5xl md:text-6xl font-light text-cream"
          >
            What Our Clients Say
          </motion.h2>
        </div>

        {/* ── Review Carousel ── */}
        <motion.div custom={0.3} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="max-w-3xl mx-auto text-center relative"
        >
          <div className="min-h-[260px] flex items-center justify-center">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={active}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                {/* Stars */}
                <div className="flex justify-center gap-1.5 mb-8">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-gold text-xs">★</span>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="font-cormorant text-2xl md:text-3xl font-light text-cream/90 leading-relaxed mb-10 italic">
                  &ldquo;{review.body}&rdquo;
                </blockquote>

                {/* Attribution */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-px bg-gold" />
                  <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream mt-2">
                    {review.name}
                  </p>
                  <p className="font-dm text-[0.6rem] text-cream-muted/40">{review.occasion}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              data-cursor
              onClick={prev}
              className="w-10 h-10 border border-cream/15 flex items-center justify-center text-cream-muted/50 hover:border-gold/60 hover:text-gold transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  data-cursor
                  onClick={() => go(i)}
                  className={`transition-all duration-300 ${i === active ? 'w-6 h-px bg-gold' : 'w-1.5 h-px bg-cream/20 hover:bg-cream/40'}`}
                />
              ))}
            </div>

            <button
              data-cursor
              onClick={next}
              className="w-10 h-10 border border-cream/15 flex items-center justify-center text-cream-muted/50 hover:border-gold/60 hover:text-gold transition-all duration-300"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* ── Clients Banner ── */}
        <motion.div custom={0.5} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="mt-24 border-t border-gold/10 pt-16"
        >
          <p className="section-label text-center mb-10">Trusted By</p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
            {['MediaCorp', 'OWNDAYS', 'Rimowa', 'Harry Winston', 'Malaysian Embassy'].map((client) => (
              <span key={client} className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/30 hover:text-gold/60 transition-colors duration-300">
                {client}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
