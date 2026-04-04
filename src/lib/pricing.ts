/**
 * Pricing calculation with full surcharge breakdown.
 * Handles base fabric price + all optional surcharges from jacket/pants/personalization.
 */

import { SuitConfig } from '@/types';
import { FABRIC_OPTIONS, getSurcharge } from '@/lib/suit-options';

// ========== TYPES ==========

export interface SurchargeLineItem {
  field: string;
  description: string;
  amount: number;
}

export interface PriceBreakdown {
  basePrice: number;
  lapelSurcharge: number;
  fitSurcharge: number;
  jacketSurcharges: SurchargeLineItem[];
  pantsSurcharges: SurchargeLineItem[];
  personalizationSurcharges: SurchargeLineItem[];
  subtotal: number;
  discount?: number;
  total: number;
}

// ========== SURCHARGE RULES ==========

type SurchargeRule = (
  | { field: string; matchValue: any; amount: number; desc: string; matchCondition?: never }
  | { field: string; matchCondition: (val: any) => boolean; amount: number; desc: string; matchValue?: never }
);

/**
 * Master surcharge rules: { field, condition/value, amount }
 * Checked in calcPrice() to build surcharge lineups
 */
const SURCHARGE_RULES: SurchargeRule[] = [
  // Jacket surcharges
  { field: 'jacket.buttonConfig', matchValue: 'double-4', amount: 200, desc: 'Double-breasted (4 buttons)' },
  { field: 'jacket.buttonConfig', matchValue: 'double-6', amount: 250, desc: 'Double-breasted (6 buttons)' },
  { field: 'jacket.ticketPocket', matchValue: true, amount: 30, desc: 'Ticket pocket' },
  { field: 'jacket.functionalCuff', matchValue: true, amount: 180, desc: 'Functional cuff (premium)' },
  { field: 'jacket.liningStyle', matchValue: 'patterned', amount: 80, desc: 'Patterned lining' },
  { field: 'jacket.embroidery', matchCondition: (val: string) => Boolean(val && val.length > 0), amount: 50, desc: 'Embroidery' },

  // Pants surcharges
  { field: 'pants.waistband', matchValue: 'side-adjusters', amount: 50, desc: 'Side adjusters' },
  { field: 'pants.waistband', matchValue: 'suspenders', amount: 40, desc: 'Suspenders' },

  // Personalization surcharges
  { field: 'personalization.monogram', matchCondition: (val: any) => val !== null, amount: 60, desc: 'Monogram' },
  { field: 'personalization.contrastButtonholeColor', matchCondition: (val: string | null) => val !== null, amount: 40, desc: 'Contrast buttonhole' },
  { field: 'personalization.specialStitching', matchValue: true, amount: 100, desc: 'Special stitching' },
];

// ========== PRICING CALCULATION ==========

/**
 * Calculate full price breakdown including all surcharges.
 */
export function calcPrice(
  config: SuitConfig,
  voucherDiscount?: number
): PriceBreakdown {
  // 1. Base fabric price
  const fabricOption = FABRIC_OPTIONS.find((f) => f.id === config.fabric);
  const basePrice = fabricOption?.basePrice || 2000; // fallback to conservative estimate

  // 2. Essential surcharges (lapel, fit)
  const lapelSurcharge = getSurcharge('lapel', config.lapel);
  const fitSurcharge = getSurcharge('fit', config.fit);

  // 3. Jacket surcharges
  const jacketSurcharges: SurchargeLineItem[] = [];
  if (config.jacket) {
    for (const rule of SURCHARGE_RULES.filter((r) => r.field.startsWith('jacket'))) {
      const [, fieldName] = rule.field.split('.');
      const fieldValue = (config.jacket as any)[fieldName];

      let matches = false;
      if ('matchValue' in rule) {
        matches = fieldValue === rule.matchValue;
      } else if ('matchCondition' in rule) {
        matches = rule.matchCondition(fieldValue);
      }

      if (matches) {
        jacketSurcharges.push({
          field: rule.field,
          description: rule.desc,
          amount: rule.amount,
        });
      }
    }
  }

  // 4. Pants surcharges
  const pantsSurcharges: SurchargeLineItem[] = [];
  if (config.pants) {
    for (const rule of SURCHARGE_RULES.filter((r) => r.field.startsWith('pants'))) {
      const [, fieldName] = rule.field.split('.');
      const fieldValue = (config.pants as any)[fieldName];

      let matches = false;
      if ('matchValue' in rule) {
        matches = fieldValue === rule.matchValue;
      } else if ('matchCondition' in rule) {
        matches = rule.matchCondition(fieldValue);
      }

      if (matches) {
        pantsSurcharges.push({
          field: rule.field,
          description: rule.desc,
          amount: rule.amount,
        });
      }
    }
  }

  // 5. Personalization surcharges
  const personalizationSurcharges: SurchargeLineItem[] = [];
  if (config.personalization) {
    for (const rule of SURCHARGE_RULES.filter((r) => r.field.startsWith('personalization'))) {
      const [, fieldName] = rule.field.split('.');
      const fieldValue = (config.personalization as any)[fieldName];

      let matches = false;
      if ('matchValue' in rule) {
        matches = fieldValue === rule.matchValue;
      } else if ('matchCondition' in rule) {
        matches = rule.matchCondition(fieldValue);
      }

      if (matches) {
        personalizationSurcharges.push({
          field: rule.field,
          description: rule.desc,
          amount: rule.amount,
        });
      }
    }
  }

  // 6. Calculate totals
  const allSurcharges = [
    ...jacketSurcharges,
    ...pantsSurcharges,
    ...personalizationSurcharges,
  ];
  const totalSurcharges = allSurcharges.reduce((sum, s) => sum + s.amount, 0);
  const subtotal = basePrice + lapelSurcharge + fitSurcharge + totalSurcharges;

  // 7. Apply discount
  const discount = voucherDiscount || 0;
  const total = Math.max(0, subtotal - discount);

  return {
    basePrice,
    lapelSurcharge,
    fitSurcharge,
    jacketSurcharges,
    pantsSurcharges,
    personalizationSurcharges,
    subtotal,
    discount: discount > 0 ? discount : undefined,
    total,
  };
}

/**
 * Get a human-readable price summary string.
 */
export function formatPriceBreakdown(breakdown: PriceBreakdown): string {
  let lines = [
    `Base Price: SGD ${breakdown.basePrice}`,
  ];

  if (breakdown.lapelSurcharge > 0) {
    lines.push(`Lapel Surcharge: +SGD ${breakdown.lapelSurcharge}`);
  }
  if (breakdown.fitSurcharge > 0) {
    lines.push(`Fit Surcharge: +SGD ${breakdown.fitSurcharge}`);
  }

  if (breakdown.jacketSurcharges.length > 0) {
    lines.push('Jacket Details:');
    breakdown.jacketSurcharges.forEach((s) => {
      lines.push(`  ${s.description}: +SGD ${s.amount}`);
    });
  }

  if (breakdown.pantsSurcharges.length > 0) {
    lines.push('Trousers:');
    breakdown.pantsSurcharges.forEach((s) => {
      lines.push(`  ${s.description}: +SGD ${s.amount}`);
    });
  }

  if (breakdown.personalizationSurcharges.length > 0) {
    lines.push('Personalization:');
    breakdown.personalizationSurcharges.forEach((s) => {
      lines.push(`  ${s.description}: +SGD ${s.amount}`);
    });
  }

  lines.push(`\nSubtotal: SGD ${breakdown.subtotal}`);

  if (breakdown.discount && breakdown.discount > 0) {
    lines.push(`Discount: -SGD ${breakdown.discount}`);
  }

  lines.push(`\nTotal: SGD ${breakdown.total}`);

  return lines.join('\n');
}
