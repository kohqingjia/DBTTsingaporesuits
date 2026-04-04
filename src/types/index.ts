/**
 * Centralized type definitions for Picadilly Tailors suit customization system.
 * Exports all interfaces and type unions for suit configuration, AI recommendations, and checkout.
 */

// ========== JACKET DETAILS ==========
export type LapelWidth = 'slim' | 'standard' | 'wide';
export type ButtonConfig = 'single-1' | 'single-2' | 'single-3' | 'double-4' | 'double-6';
export type PocketStyle = 'flap' | 'jetted' | 'patch';
export type VentStyle = 'none' | 'single' | 'double';
export type SleeveButtons = 3 | 4 | 5;
export type ButtonSpacing = 'stacked' | 'spaced';
export type LiningCoverage = 'full' | 'half' | 'quarter';
export type LiningStyle = 'solid' | 'patterned';

export interface JacketDetails {
  lapelWidth: LapelWidth;
  buttonConfig: ButtonConfig;
  pocketStyle: PocketStyle;
  ticketPocket: boolean;
  ventStyle: VentStyle;
  sleeveButtons: SleeveButtons;
  functionalCuff: boolean;
  buttonSpacing: ButtonSpacing;
  liningCoverage: LiningCoverage;
  liningStyle: LiningStyle;
  embroidery: string; // max 30 chars
}

// ========== PANTS DETAILS ==========
export type PantsFit = 'slim' | 'tailored' | 'classic';
export type PantsFront = 'flat' | 'single-pleat' | 'double-pleat';
export type Waistband = 'belt-loops' | 'side-adjusters' | 'suspenders';
export type PantsBreak = 'no-break' | 'slight' | 'full';

export interface PantsDetails {
  fit: PantsFit;
  frontStyle: PantsFront;
  waistband: Waistband;
  cuffs: boolean;
  breakStyle: PantsBreak;
}

// ========== PERSONALISATION ==========
export interface Monogram {
  initials: string; // max 4 chars
  placement: 'cuff' | 'chest-pocket' | 'inner-lining';
}

export interface PersonalizationDetails {
  monogram: Monogram | null;
  contrastButtonholeColor: string | null; // hex color or null
  specialStitching: boolean;
}

// ========== MAIN CONFIG (backward-compatible) ==========
export interface SuitConfig {
  // Original 5 fields
  fabric: string;
  lapel: string;
  fit: string;
  lining: string;
  buttons: number;

  // New nested objects (optional for backward compatibility)
  jacket?: JacketDetails;
  pants?: PantsDetails;
  personalization?: PersonalizationDetails;
}

// ========== AI STYLIST TYPES ==========
export interface OutfitItem {
  description: string;
  colour: string;
  hex: string;
  price: number;
  fabric?: string;
  material?: string;
}

export interface ColorPalette {
  name: string;
  hex: string;
  role: string; // e.g., "primary-suit", "accent-tie"
}

export interface StyleRecommendation {
  recommendation: {
    suit: OutfitItem;
    shirt: OutfitItem;
    tie: OutfitItem;
    shoes: OutfitItem;
  };
  jacket?: JacketDetails;
  pants?: PantsDetails;
  personalization?: PersonalizationDetails;
  palette: ColorPalette[];
  styleExplanation: string;
  matchScore: number; // 0-100
  totalPrice: number;
  stylistNote: string;
}

// ========== CHECKOUT TYPES ==========
export interface Voucher {
  voucherId: string;
  rewardId: string;
  name: string;
  icon: string;
  discountType: 'percent' | 'fixed' | 'service';
  discountValue: number;
  redeemedAt: string;
  used: boolean;
}

export interface DetailsForm {
  fulfilmentMethod: 'delivery' | 'collection';
  address?: string;
  city?: string;
  postalCode?: string;
  collectionDate?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialNotes?: string;
}

export interface PaymentForm {
  method: 'card' | 'paynow' | 'apple-pay' | 'google-pay';
  cardName?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export interface Order {
  id: string;
  config: SuitConfig;
  details: DetailsForm;
  payment: PaymentForm;
  voucherApplied?: Voucher;
  totalPrice: number;
  createdAt: string;
  estimatedCompletion: string;
}
