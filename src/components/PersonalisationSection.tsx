'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuitConfig } from '@/types';
import { PersonalizationDetails, Monogram } from '@/types';
import {
  MONOGRAM_PLACEMENT_OPTIONS,
  CONTRAST_BUTTONHOLE_PALETTE,
} from '@/lib/suit-options';
import {
  DEFAULT_PERSONALIZATION_DETAILS,
  mergeWithDefaults,
} from '@/lib/suit-defaults';

interface PersonalisationSectionProps {
  config: SuitConfig;
  onUpdate: (personalizationDetails: Partial<PersonalizationDetails>) => void;
}

export default function PersonalisationSection({
  config,
  onUpdate,
}: PersonalisationSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const personalization = mergeWithDefaults({ personalization: config.personalization }).personalization!;

  // Count non-default customizations
  const countCustomized = () => {
    let count = 0;
    if (personalization.monogram !== DEFAULT_PERSONALIZATION_DETAILS.monogram) count++;
    if (personalization.contrastButtonholeColor !== DEFAULT_PERSONALIZATION_DETAILS.contrastButtonholeColor)
      count++;
    if (personalization.specialStitching !== DEFAULT_PERSONALIZATION_DETAILS.specialStitching) count++;
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
              Personalisation
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
              {/* 22 — Monogram */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  22 &nbsp; Monogram
                </legend>

                {/* Input */}
                <div className="mb-6">
                  <input
                    type="text"
                    maxLength={4}
                    value={personalization.monogram?.initials || ''}
                    onChange={(e) => {
                      const text = e.target.value.toUpperCase();
                      onUpdate({
                        monogram: text ? { initials: text, placement: personalization.monogram?.placement || 'chest-pocket' } : null,
                      });
                    }}
                    placeholder="E.g. JPD"
                    className="bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none
                      placeholder:text-cream-muted/30 focus:border-gold/50 transition-colors duration-200 w-full"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-dm text-[0.5rem] text-cream-muted/50">
                      {personalization.monogram?.initials.length || 0}/4 characters
                    </span>
                    {personalization.monogram && (
                      <span className="font-josefin text-[0.47rem] tracking-[0.1em] uppercase text-gold">
                        +SGD 60
                      </span>
                    )}
                  </div>
                </div>

                {/* Placement */}
                {personalization.monogram && (
                  <div>
                    <p className="font-josefin text-[0.5rem] tracking-[0.15em] uppercase text-cream-muted/60 mb-3">
                      Placement
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {MONOGRAM_PLACEMENT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() =>
                            onUpdate({
                              monogram: {
                                ...personalization.monogram!,
                                placement: opt.id as any,
                              },
                            })
                          }
                          className={`p-4 border transition-all duration-300 text-center
                            ${personalization.monogram?.placement === opt.id ? 'border-gold bg-gold/5' : 'border-cream/10 hover:border-gold/40'}`}
                        >
                          <p
                            className={`font-josefin text-[0.5rem] tracking-[0.15em] uppercase mb-1
                            ${personalization.monogram?.placement === opt.id ? 'text-gold' : 'text-cream-muted/60'}`}
                          >
                            {opt.name}
                          </p>
                          <p className="font-dm text-[0.45rem] text-cream-muted/30">{opt.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </fieldset>

              {/* 23 — Contrast Buttonhole */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  23 &nbsp; Contrast Buttonhole
                </legend>
                <div className="grid grid-cols-6 gap-3">
                  {CONTRAST_BUTTONHOLE_PALETTE.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => onUpdate({ contrastButtonholeColor: color.id })}
                      className={`relative aspect-square border transition-all duration-200
                        ${personalization.contrastButtonholeColor === color.id ? 'border-gold border-2 scale-110' : 'border-cream/10 hover:border-gold/40'}`}
                      title={color.name}
                    >
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: color.hex }}
                      />
                      {personalization.contrastButtonholeColor === color.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3 h-3 border-2 border-gold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {personalization.contrastButtonholeColor && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="font-dm text-[0.5rem] text-cream-muted/50">
                      {CONTRAST_BUTTONHOLE_PALETTE.find((c) => c.id === personalization.contrastButtonholeColor)
                        ?.name || 'Selected'}
                    </span>
                    <span className="font-josefin text-[0.47rem] tracking-[0.1em] uppercase text-gold">
                      +SGD 40
                    </span>
                  </div>
                )}
              </fieldset>

              {/* 24 — Special Stitching */}
              <fieldset>
                <legend className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted/60 mb-4">
                  24 &nbsp; Special Stitching
                </legend>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onUpdate({ specialStitching: !personalization.specialStitching })}
                    className={`relative w-12 h-7 border transition-all duration-300
                      ${personalization.specialStitching ? 'border-gold bg-gold/10' : 'border-cream/10 bg-obsidian'}`}
                  >
                    <motion.div
                      animate={{ x: personalization.specialStitching ? 24 : 2 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-1 w-5 h-5 border border-gold"
                    />
                  </button>
                  <span className="font-dm text-sm text-cream-muted">
                    {personalization.specialStitching ? 'Enabled' : 'None'}
                  </span>
                  {personalization.specialStitching && (
                    <span className="font-josefin text-[0.47rem] tracking-[0.1em] uppercase text-gold ml-auto">
                      +SGD 100
                    </span>
                  )}
                </div>
                <p className="font-dm text-[0.5rem] text-cream-muted/50 mt-2">
                  Hand-finished contrast stitching on seams and buttonholes (premium detailing)
                </p>
              </fieldset>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
