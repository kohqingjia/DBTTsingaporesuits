'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuitConfig } from '@/types';
import { PantsDetails } from '@/types';
import {
  PANTS_FIT_OPTIONS,
  PANTS_FRONT_STYLE_OPTIONS,
  PANTS_WAISTBAND_OPTIONS,
  PANTS_BREAK_OPTIONS,
  getSurcharge,
} from '@/lib/suit-options';
import {
  DEFAULT_PANTS_DETAILS,
  mergeWithDefaults,
} from '@/lib/suit-defaults';

interface TrousersSectionProps {
  config: SuitConfig;
  onUpdate: (pantsDetails: Partial<PantsDetails>) => void;
}

export default function TrousersSection({
  config,
  onUpdate,
}: TrousersSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const pants = mergeWithDefaults({ pants: config.pants }).pants!;

  // Count non-default customizations
  const countCustomized = () => {
    let count = 0;
    if (pants.fit !== DEFAULT_PANTS_DETAILS.fit) count++;
    if (pants.frontStyle !== DEFAULT_PANTS_DETAILS.frontStyle) count++;
    if (pants.waistband !== DEFAULT_PANTS_DETAILS.waistband) count++;
    if (pants.cuffs !== DEFAULT_PANTS_DETAILS.cuffs) count++;
    if (pants.breakStyle !== DEFAULT_PANTS_DETAILS.breakStyle) count++;
    return count;
  };

  const customizedCount = countCustomized();

  return (
    <div className="border border-gold/10">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-obsidian-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <motion.span
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gold text-lg"
          >
            ▸
          </motion.span>
          <div className="text-left">
            <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream">
              Trousers
            </p>
            {customizedCount > 0 && (
              <p className="font-dm text-[0.45rem] text-cream-muted/60 mt-1">
                {customizedCount} customised
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {customizedCount > 0 && (
            <div className="px-2 py-1 bg-gold/10 border border-gold/20">
              <span className="font-josefin text-[0.5rem] tracking-[0.15em] uppercase text-gold">
                {customizedCount}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-gold/10"
          >
            <div className="px-6 py-5 space-y-8">
              {/* 17 — Fit */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  17 &nbsp; Fit
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {PANTS_FIT_OPTIONS.map((opt) => {
                    const surcharge = getSurcharge('pantsFit', opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onUpdate({ fit: opt.id as any })}
                        className={`p-4 border transition-all duration-300 text-left
                          ${pants.fit === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                      >
                        <p
                          className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                          ${pants.fit === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
                        >
                          {opt.name}
                        </p>
                        <p className="font-dm text-[0.45rem] text-cream-muted/30 mb-2">{opt.description}</p>
                        {surcharge > 0 && (
                          <p className="font-josefin text-[0.45rem] tracking-[0.1em] uppercase text-gold">
                            +SGD {surcharge}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* 18 — Front Style */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  18 &nbsp; Front Style
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {PANTS_FRONT_STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onUpdate({ frontStyle: opt.id as any })}
                      className={`p-4 border transition-all duration-300 text-center
                        ${pants.frontStyle === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                    >
                      <p
                        className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                        ${pants.frontStyle === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
                      >
                        {opt.name}
                      </p>
                      <p className="font-dm text-[0.45rem] text-cream-muted/30">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* 19 — Waistband */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  19 &nbsp; Waistband
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {PANTS_WAISTBAND_OPTIONS.map((opt) => {
                    const surcharge = getSurcharge('pantsWaistband', opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onUpdate({ waistband: opt.id as any })}
                        className={`p-4 border transition-all duration-300 text-left
                          ${pants.waistband === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                      >
                        <p
                          className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                          ${pants.waistband === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
                        >
                          {opt.name}
                        </p>
                        <p className="font-dm text-[0.45rem] text-cream-muted/30 mb-2">{opt.description}</p>
                        {surcharge > 0 && (
                          <p className="font-josefin text-[0.45rem] tracking-[0.1em] uppercase text-gold">
                            +SGD {surcharge}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* 20 — Turn-Ups (Cuffs) */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  20 &nbsp; Turn-Ups
                </legend>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onUpdate({ cuffs: !pants.cuffs })}
                    className={`relative w-12 h-7 border transition-all duration-300
                      ${pants.cuffs ? 'border-gold bg-gold/10' : 'border-cream/10 bg-obsidian'}`}
                  >
                    <motion.div
                      animate={{ x: pants.cuffs ? 24 : 2 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1 w-5 h-5 border border-gold"
                    />
                  </button>
                  <span className="font-dm text-sm text-cream-muted">
                    {pants.cuffs ? 'Included' : 'None'}
                  </span>
                </div>
              </fieldset>

              {/* 21 — Break */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  21 &nbsp; Break
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {PANTS_BREAK_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onUpdate({ breakStyle: opt.id as any })}
                      className={`p-4 border transition-all duration-300 text-center
                        ${pants.breakStyle === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                    >
                      <p
                        className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                        ${pants.breakStyle === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
                      >
                        {opt.name}
                      </p>
                      <p className="font-dm text-[0.45rem] text-cream-muted/30">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
