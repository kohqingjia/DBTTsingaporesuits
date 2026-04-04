/**
 * Centralized option arrays and metadata for all suit customization fields.
 * Each option includes id, name, description, and optional surcharge.
 */

// ========== ESSENTIALS (Original 5 fields) ==========

export const FABRIC_OPTIONS = [
  {
    id: 'ivory-linen',
    name: 'Ivory Linen',
    description: 'Lightweight, breathable summer weave',
    basePrice: 1600,
  },
  {
    id: 'charcoal-wool',
    name: 'Charcoal Wool',
    description: 'Classic neutral, versatile all-season',
    basePrice: 1800,
  },
  {
    id: 'slate-flannel',
    name: 'Slate Flannel',
    description: 'Soft, textured winter comfort',
    basePrice: 1900,
  },
  {
    id: 'burgundy-wool',
    name: 'Burgundy Wool',
    description: 'Rich warm tone, statement versatility',
    basePrice: 2000,
  },
  {
    id: 'navy-herringbone',
    name: 'Navy Herringbone',
    description: 'Timeless pattern, elegant formality',
    basePrice: 2200,
  },
  {
    id: 'midnight-velvet',
    name: 'Midnight Velvet',
    description: 'Luxe evening texture, exclusive finish',
    basePrice: 2800,
  },
];

export const LAPEL_OPTIONS = [
  {
    id: 'peak',
    name: 'Peak Lapel',
    description: 'Formal, pointed; sharp structured look',
    surcharge: 0,
  },
  {
    id: 'notch',
    name: 'Notch Lapel',
    description: 'Modern classic; balanced proportions',
    surcharge: 0,
  },
  {
    id: 'shawl',
    name: 'Shawl Lapel',
    description: 'Sophisticated evening; curved silhouette',
    surcharge: 200,
  },
];

export const FIT_OPTIONS = [
  {
    id: 'slim',
    name: 'Slim Fit',
    description: 'Contemporary; narrow through chest',
    surcharge: 0,
  },
  {
    id: 'tailored',
    name: 'Tailored Fit',
    description: 'Classic bespoke; balanced proportions',
    surcharge: 150,
  },
  {
    id: 'relaxed',
    name: 'Relaxed Fit',
    description: 'Comfort-first; generous ease',
    surcharge: 0,
  },
];

export const LINING_OPTIONS = [
  {
    id: 'black',
    name: 'Black',
    hex: '#0A0A0A',
    description: 'Timeless, formal',
    surcharge: 0,
  },
  {
    id: 'gold',
    name: 'Gold',
    hex: '#C5A230',
    description: 'Warm, luxe accent',
    surcharge: 0,
  },
  {
    id: 'navy',
    name: 'Navy',
    hex: '#0F3B66',
    description: 'Sophisticated, versatile',
    surcharge: 0,
  },
  {
    id: 'red',
    name: 'Red',
    hex: '#C41E3A',
    description: 'Bold, daring statement',
    surcharge: 0,
  },
  {
    id: 'ivory',
    name: 'Ivory',
    hex: '#F5EFE0',
    description: 'Soft, classic elegance',
    surcharge: 0,
  },
  {
    id: 'teal',
    name: 'Teal',
    hex: '#0D7377',
    description: 'Modern, cool tone',
    surcharge: 0,
  },
];

export const BUTTON_COUNT_OPTIONS = [
  { value: 1, label: '1 Button' },
  { value: 2, label: '2 Buttons' },
  { value: 3, label: '3 Buttons' },
];

// ========== JACKET DETAILS ==========

export const JACKET_LAPEL_WIDTH_OPTIONS = [
  {
    id: 'slim',
    name: 'Slim',
    description: '2.5–3"',
  },
  {
    id: 'standard',
    name: 'Standard',
    description: '3–3.5"',
  },
  {
    id: 'wide',
    name: 'Wide',
    description: '3.5–4"',
  },
];

export const JACKET_BUTTON_CONFIG_OPTIONS = [
  {
    id: 'single-1',
    name: 'Single Button',
    description: '1 button (shawl lapel)',
    surcharge: 0,
  },
  {
    id: 'single-2',
    name: 'Single Breasted',
    description: '2 buttons (classic)',
    surcharge: 0,
  },
  {
    id: 'single-3',
    name: 'Single Breasted',
    description: '3 buttons (modern)',
    surcharge: 0,
  },
  {
    id: 'double-4',
    name: 'Double Breasted',
    description: '4 buttons (formal)',
    surcharge: 200,
  },
  {
    id: 'double-6',
    name: 'Double Breasted',
    description: '6 buttons (statement)',
    surcharge: 250,
  },
];

export const JACKET_POCKET_STYLE_OPTIONS = [
  {
    id: 'flap',
    name: 'Flap Pocket',
    description: 'Classic with cover flap',
  },
  {
    id: 'jetted',
    name: 'Jetted Pocket',
    description: 'Minimalist clean lines',
  },
  {
    id: 'patch',
    name: 'Patch Pocket',
    description: 'Textured, casual-formal',
  },
];

export const JACKET_VENT_STYLE_OPTIONS = [
  {
    id: 'none',
    name: 'No Vents',
    description: 'Structured, formal',
  },
  {
    id: 'single',
    name: 'Single Vent',
    description: 'Classic motion, subtle',
  },
  {
    id: 'double',
    name: 'Double Vents',
    description: 'Ease of movement, British tradition',
  },
];

export const JACKET_SLEEVE_BUTTONS_OPTIONS = [
  { value: 3, label: '3 Buttons' },
  { value: 4, label: '4 Buttons' },
  { value: 5, label: '5 Buttons' },
];

export const JACKET_BUTTON_SPACING_OPTIONS = [
  {
    id: 'stacked',
    name: 'Stacked',
    description: 'Buttons close together',
  },
  {
    id: 'spaced',
    name: 'Spaced',
    description: 'Buttons distribution (standard)',
  },
];

export const JACKET_LINING_COVERAGE_OPTIONS = [
  {
    id: 'full',
    name: 'Full Lining',
    description: 'Complete interior coverage',
  },
  {
    id: 'half',
    name: 'Half Lining',
    description: 'Upper half lined, sleeve lined',
  },
  {
    id: 'quarter',
    name: 'Quarter Lining',
    description: 'Shoulder/chest area only',
  },
];

export const JACKET_LINING_STYLE_OPTIONS = [
  {
    id: 'solid',
    name: 'Solid Lining',
    description: 'Clean, classic',
    surcharge: 0,
  },
  {
    id: 'patterned',
    name: 'Patterned Lining',
    description: 'Silk print, personality',
    surcharge: 80,
  },
];

// ========== PANTS DETAILS ==========

export const PANTS_FIT_OPTIONS = [
  {
    id: 'slim',
    name: 'Slim Fit',
    description: 'Tapered, contemporary',
  },
  {
    id: 'tailored',
    name: 'Tailored Fit',
    description: 'Classic, balanced',
  },
  {
    id: 'classic',
    name: 'Classic Fit',
    description: 'Generous, comfort',
  },
];

export const PANTS_FRONT_STYLE_OPTIONS = [
  {
    id: 'flat',
    name: 'Flat Front',
    description: 'Modern, clean lines',
  },
  {
    id: 'single-pleat',
    name: 'Single Pleat',
    description: 'Classic, subtle relaxation',
  },
  {
    id: 'double-pleat',
    name: 'Double Pleat',
    description: 'Formal, generous comfort',
  },
];

export const PANTS_WAISTBAND_OPTIONS = [
  {
    id: 'belt-loops',
    name: 'Belt Loops',
    description: 'Standard, traditional',
    surcharge: 0,
  },
  {
    id: 'side-adjusters',
    name: 'Side Adjusters',
    description: 'Button tabs for fit',
    surcharge: 50,
  },
  {
    id: 'suspenders',
    name: 'Suspenders',
    description: 'Buttons for braces',
    surcharge: 40,
  },
];

export const PANTS_BREAK_OPTIONS = [
  {
    id: 'no-break',
    name: 'No Break',
    description: 'Hem hits shoe without touching',
  },
  {
    id: 'slight',
    name: 'Slight Break',
    description: 'Mini crease at shoe (versatile)',
  },
  {
    id: 'full',
    name: 'Full Break',
    description: 'Visible crease at shoe (formal)',
  },
];

// ========== PERSONALISATION ==========

export const MONOGRAM_PLACEMENT_OPTIONS = [
  {
    id: 'cuff',
    name: 'Sleeve Cuff',
    description: 'Visible when rolled',
  },
  {
    id: 'chest-pocket',
    name: 'Chest Pocket',
    description: 'Subtle on jacket pocket',
  },
  {
    id: 'inner-lining',
    name: 'Inner Lining',
    description: 'Secret detail, personal touch',
  },
];

export const CONTRAST_BUTTONHOLE_PALETTE = [
  { id: 'gold', name: 'Gold', hex: '#C5A230' },
  { id: 'navy', name: 'Navy', hex: '#0F3B66' },
  { id: 'red', name: 'Red', hex: '#C41E3A' },
  { id: 'cream', name: 'Cream', hex: '#F5EFE0' },
  { id: 'teal', name: 'Teal', hex: '#0D7377' },
];

// ========== HELPER FUNCTIONS ==========

/**
 * Get human-readable label for an option ID
 */
export function getOptionLabel(category: string, id: string): string {
  const categories: Record<string, any[]> = {
    fabric: FABRIC_OPTIONS,
    lapel: LAPEL_OPTIONS,
    fit: FIT_OPTIONS,
    lining: LINING_OPTIONS,
    buttonCount: BUTTON_COUNT_OPTIONS,
    jacketLapelWidth: JACKET_LAPEL_WIDTH_OPTIONS,
    jacketButtonConfig: JACKET_BUTTON_CONFIG_OPTIONS,
    jacketPocketStyle: JACKET_POCKET_STYLE_OPTIONS,
    jacketVentStyle: JACKET_VENT_STYLE_OPTIONS,
    jacketSleeveButtons: JACKET_SLEEVE_BUTTONS_OPTIONS,
    jacketButtonSpacing: JACKET_BUTTON_SPACING_OPTIONS,
    jacketLiningCoverage: JACKET_LINING_COVERAGE_OPTIONS,
    jacketLiningStyle: JACKET_LINING_STYLE_OPTIONS,
    pantsFit: PANTS_FIT_OPTIONS,
    pantsFrontStyle: PANTS_FRONT_STYLE_OPTIONS,
    pantsWaistband: PANTS_WAISTBAND_OPTIONS,
    pantsBreak: PANTS_BREAK_OPTIONS,
    monogramPlacement: MONOGRAM_PLACEMENT_OPTIONS,
    contrastButtonhole: CONTRAST_BUTTONHOLE_PALETTE,
  };

  const options = categories[category];
  if (!options) return id;

  const option = options.find((opt) => opt.id === id || opt.value === id);
  return option?.name || id;
}

/**
 * Get surcharge amount for a specific option
 */
export function getSurcharge(category: string, id: string): number {
  const categories: Record<string, any[]> = {
    lapel: LAPEL_OPTIONS,
    fit: FIT_OPTIONS,
    jacketButtonConfig: JACKET_BUTTON_CONFIG_OPTIONS,
    jacketLiningStyle: JACKET_LINING_STYLE_OPTIONS,
    pantsWaistband: PANTS_WAISTBAND_OPTIONS,
  };

  const options = categories[category];
  if (!options) return 0;

  const option = options.find((opt) => opt.id === id);
  return option?.surcharge || 0;
}
