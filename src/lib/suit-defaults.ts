/**
 * Default values for all suit configuration sections.
 * Single source of truth for initial/fallback suit specs.
 */

import {
  SuitConfig,
  JacketDetails,
  PantsDetails,
  PersonalizationDetails,
} from '@/types';

// ========== DEFAULTS: JACKET DETAILS ==========

export const DEFAULT_JACKET_DETAILS: JacketDetails = {
  lapelWidth: 'standard',       // Safe for all body types
  buttonConfig: 'single-2',     // Universal standard
  pocketStyle: 'flap',          // All-occasion versatility
  ticketPocket: false,          // Feature opt-in
  ventStyle: 'double',          // British tradition, ease of movement
  sleeveButtons: 4,             // Classic standard
  functionalCuff: false,        // Premium opt-in
  buttonSpacing: 'spaced',      // British tradition
  liningCoverage: 'full',       // Year-round structure
  liningStyle: 'solid',         // Clean classic
  embroidery: '',               // Opt-in
};

// ========== DEFAULTS: PANTS DETAILS ==========

export const DEFAULT_PANTS_DETAILS: PantsDetails = {
  fit: 'tailored',              // Matches jacket default
  frontStyle: 'flat',           // Modern clean
  waistband: 'belt-loops',      // Most common
  cuffs: false,                 // Opt-in
  breakStyle: 'slight',         // Versatile
};

// ========== DEFAULTS: PERSONALISATION ==========

export const DEFAULT_PERSONALIZATION_DETAILS: PersonalizationDetails = {
  monogram: null,               // Opt-in
  contrastButtonholeColor: null,// Opt-in
  specialStitching: false,      // Opt-in
};

// ========== DEFAULTS: FULL CONFIG ==========

export const DEFAULT_SUIT_CONFIG: SuitConfig = {
  // Original 5 fields (conservative, Savile Row sensibility)
  fabric: 'navy-herringbone',
  lapel: 'peak',
  fit: 'tailored',
  lining: 'black',
  buttons: 2,

  // New nested objects
  jacket: DEFAULT_JACKET_DETAILS,
  pants: DEFAULT_PANTS_DETAILS,
  personalization: DEFAULT_PERSONALIZATION_DETAILS,
};

/**
 * Merge a partial config with defaults, ensuring all required fields are present.
 * Handles backward compatibility: if new nested fields missing, populate from defaults.
 */
export function mergeWithDefaults(partial: Partial<SuitConfig>): SuitConfig {
  return {
    fabric: partial.fabric ?? DEFAULT_SUIT_CONFIG.fabric,
    lapel: partial.lapel ?? DEFAULT_SUIT_CONFIG.lapel,
    fit: partial.fit ?? DEFAULT_SUIT_CONFIG.fit,
    lining: partial.lining ?? DEFAULT_SUIT_CONFIG.lining,
    buttons: partial.buttons ?? DEFAULT_SUIT_CONFIG.buttons,

    jacket: {
      ...DEFAULT_JACKET_DETAILS,
      ...(partial.jacket || {}),
    },

    pants: {
      ...DEFAULT_PANTS_DETAILS,
      ...(partial.pants || {}),
    },

    personalization: {
      ...DEFAULT_PERSONALIZATION_DETAILS,
      ...(partial.personalization || {}),
    },
  };
}
