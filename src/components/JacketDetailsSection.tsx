'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuitConfig } from '@/types';
import { JacketDetails } from '@/types';
import {
  JACKET_LAPEL_WIDTH_OPTIONS,
  JACKET_BUTTON_CONFIG_OPTIONS,
  JACKET_POCKET_STYLE_OPTIONS,
  JACKET_VENT_STYLE_OPTIONS,
  JACKET_SLEEVE_BUTTONS_OPTIONS,
  JACKET_BUTTON_SPACING_OPTIONS,
  JACKET_LINING_COVERAGE_OPTIONS,
  JACKET_LINING_STYLE_OPTIONS,
  getSurcharge,
} from '@/lib/suit-options';
import {
  DEFAULT_JACKET_DETAILS,
  mergeWithDefaults,
} from '@/lib/suit-defaults';
import { isFieldDisabled, getFieldViolations } from '@/lib/suit-constraints';

interface JacketDetailsSectionProps {
  config: SuitConfig;
  onUpdate: (jacketDetails: Partial<JacketDetails>) => void;
  disabled?: (fieldPath: string) => boolean;
}

export default function JacketDetailsSection({
  config,
  onUpdate,
  disabled,
}: JacketDetailsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const jacket = mergeWithDefaults({ jacket: config.jacket }).jacket!;

  // Count non-default customizations
  const countCustomized = () => {
    let count = 0;
    if (jacket.lapelWidth !== DEFAULT_JACKET_DETAILS.lapelWidth) count++;
    if (jacket.buttonConfig !== DEFAULT_JACKET_DETAILS.buttonConfig) count++;
    if (jacket.pocketStyle !== DEFAULT_JACKET_DETAILS.pocketStyle) count++;
    if (jacket.ticketPocket !== DEFAULT_JACKET_DETAILS.ticketPocket) count++;
    if (jacket.ventStyle !== DEFAULT_JACKET_DETAILS.ventStyle) count++;
    if (jacket.sleeveButtons !== DEFAULT_JACKET_DETAILS.sleeveButtons) count++;
    if (jacket.functionalCuff !== DEFAULT_JACKET_DETAILS.functionalCuff) count++;
    if (jacket.buttonSpacing !== DEFAULT_JACKET_DETAILS.buttonSpacing) count++;
    if (jacket.liningCoverage !== DEFAULT_JACKET_DETAILS.liningCoverage) count++;
    if (jacket.liningStyle !== DEFAULT_JACKET_DETAILS.liningStyle) count++;
    if (jacket.embroidery !== DEFAULT_JACKET_DETAILS.embroidery) count++;
    return count;
  };

  const customizedCount = countCustomized();
  const isDisabled = disabled ? (path: string) => disabled(path) : (path: string) => false;

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
              Jacket Details
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
              {/* 06 — Lapel Width */}
              <fieldset className={isDisabled('jacket.lapelWidth') ? 'opacity-30 pointer-events-none' : ''}>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  06 &nbsp; Lapel Width
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {JACKET_LAPEL_WIDTH_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onUpdate({ lapelWidth: opt.id as any })}
                      className={`p-4 border transition-all duration-300 text-center
                        ${jacket.lapelWidth === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                    >
                      <p
                        className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                        ${jacket.lapelWidth === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
                      >
                        {opt.name}
                      </p>
                      <p className="font-dm text-[0.45rem] text-cream-muted/30">{opt.description}</p>
                    </button>
                  ))}
                </div>
                {isDisabled('jacket.lapelWidth') && (
                  <p className="font-dm text-[0.5rem] text-gold/70 mt-2 flex items-center gap-1.5">
                    <span>🔒</span> Locked: Shawl lapel selected
                  </p>
                )}
              </fieldset>

              {/* 07 — Button Configuration */}
              <fieldset className={isDisabled('jacket.buttonConfig') ? 'opacity-30 pointer-events-none' : ''}>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  07 &nbsp; Button Configuration
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {JACKET_BUTTON_CONFIG_OPTIONS.map((opt) => {
                    const surcharge = getSurcharge('jacketButtonConfig', opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onUpdate({ buttonConfig: opt.id as any })}
                        className={`p-4 border transition-all duration-300 text-left
                          ${jacket.buttonConfig === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                      >
                        <p
                          className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                          ${jacket.buttonConfig === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
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

              {/* 08 — Pocket Style */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  08 &nbsp; Pocket Style
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {JACKET_POCKET_STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onUpdate({ pocketStyle: opt.id as any })}
                      className={`p-4 border transition-all duration-300 text-center
                        ${jacket.pocketStyle === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                    >
                      <p
                        className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                        ${jacket.pocketStyle === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
                      >
                        {opt.name}
                      </p>
                      <p className="font-dm text-[0.45rem] text-cream-muted/30">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* 09 — Ticket Pocket */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  09 &nbsp; Ticket Pocket
                </legend>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onUpdate({ ticketPocket: !jacket.ticketPocket })}
                    className={`relative w-12 h-7 border transition-all duration-300
                      ${jacket.ticketPocket ? 'border-gold bg-gold/10' : 'border-cream/10 bg-obsidian'}`}
                  >
                    <motion.div
                      animate={{ x: jacket.ticketPocket ? 24 : 2 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1 w-5 h-5 border border-gold"
                    />
                  </button>
                  <span className="font-dm text-sm text-cream-muted">
                    {jacket.ticketPocket ? 'Included' : 'None'}
                  </span>
                  <span className="font-josefin text-[0.47rem] tracking-[0.1em] uppercase text-gold/60">
                    +SGD 30
                  </span>
                </div>
              </fieldset>

              {/* 10 — Vent Style */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  10 &nbsp; Vent Style
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {JACKET_VENT_STYLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onUpdate({ ventStyle: opt.id as any })}
                      className={`p-4 border transition-all duration-300 text-center
                        ${jacket.ventStyle === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                    >
                      <p
                        className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                        ${jacket.ventStyle === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
                      >
                        {opt.name}
                      </p>
                      <p className="font-dm text-[0.45rem] text-cream-muted/30">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* 11 — Sleeve Buttons */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  11 &nbsp; Sleeve Buttons
                </legend>
                <div className="flex gap-3">
                  {JACKET_SLEEVE_BUTTONS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onUpdate({ sleeveButtons: opt.value as any })}
                      className={`w-12 h-12 border font-cormorant text-lg transition-all duration-300
                        ${jacket.sleeveButtons === opt.value ? 'border-gold text-gold bg-gold/5' : 'border-cream/10 text-cream-muted/50 hover:border-gold/40'}`}
                    >
                      {opt.value}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* 12 — Functional Cuff */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4 flex items-center gap-2">
                  12 &nbsp; Functional Cuff
                  <span className="px-1.5 py-0.5 bg-gold/10 border border-gold/30">
                    <span className="font-josefin text-[0.4rem] tracking-[0.1em] uppercase text-gold">Premium</span>
                  </span>
                </legend>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onUpdate({ functionalCuff: !jacket.functionalCuff })}
                    className={`relative w-12 h-7 border transition-all duration-300
                      ${jacket.functionalCuff ? 'border-gold bg-gold/10' : 'border-cream/10 bg-obsidian'}`}
                  >
                    <motion.div
                      animate={{ x: jacket.functionalCuff ? 24 : 2 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1 w-5 h-5 border border-gold"
                    />
                  </button>
                  <span className="font-dm text-sm text-cream-muted">
                    {jacket.functionalCuff ? 'Enabled' : 'None'}
                  </span>
                  <span className="font-josefin text-[0.47rem] tracking-[0.1em] uppercase text-gold/60">
                    +SGD 180
                  </span>
                </div>
              </fieldset>

              {/* 13 — Button Spacing */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  13 &nbsp; Button Spacing
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {JACKET_BUTTON_SPACING_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onUpdate({ buttonSpacing: opt.id as any })}
                      className={`p-4 border transition-all duration-300 text-center
                        ${jacket.buttonSpacing === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                    >
                      <p
                        className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                        ${jacket.buttonSpacing === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
                      >
                        {opt.name}
                      </p>
                      <p className="font-dm text-[0.45rem] text-cream-muted/30">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* 14 — Lining Coverage */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  14 &nbsp; Lining Coverage
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {JACKET_LINING_COVERAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => onUpdate({ liningCoverage: opt.id as any })}
                      className={`p-4 border transition-all duration-300 text-center
                        ${jacket.liningCoverage === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                    >
                      <p
                        className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                        ${jacket.liningCoverage === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
                      >
                        {opt.name}
                      </p>
                      <p className="font-dm text-[0.45rem] text-cream-muted/30">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* 15 — Lining Style */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  15 &nbsp; Lining Style
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {JACKET_LINING_STYLE_OPTIONS.map((opt) => {
                    const surcharge = getSurcharge('jacketLiningStyle', opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => onUpdate({ liningStyle: opt.id as any })}
                        className={`p-4 border transition-all duration-300 text-left
                          ${jacket.liningStyle === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                      >
                        <p
                          className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase leading-none mb-1
                          ${jacket.liningStyle === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
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

              {/* 16 — Embroidery */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  16 &nbsp; Embroidery
                </legend>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    maxLength={30}
                    value={jacket.embroidery}
                    onChange={(e) => onUpdate({ embroidery: e.target.value })}
                    placeholder="Enter custom text (optional)"
                    className="bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none
                      placeholder:text-cream-muted/30 focus:border-gold/50 transition-colors duration-200"
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-dm text-[0.5rem] text-cream-muted/50">
                      {jacket.embroidery.length}/30 characters
                    </span>
                    {jacket.embroidery && (
                      <span className="font-josefin text-[0.47rem] tracking-[0.1em] uppercase text-gold">
                        +SGD 50
                      </span>
                    )}
                  </div>
                </div>
              </fieldset>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
