'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
export interface SuitConfig {
  fabric: string;
  lapel: string;
  fit: string;
  lining: string;
  buttons: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SuitConfig;
}

type Step = 'review' | 'details' | 'payment' | 'confirmed';

/* ─────────────────────────────────────────────────────────────
   VOUCHER  (saved by loyalty.html into localStorage)
───────────────────────────────────────────────────────────── */
interface Voucher {
  voucherId:     string;
  rewardId:      string;
  name:          string;
  icon:          string;
  discountType:  'percent' | 'fixed' | 'service';
  discountValue: number;
  redeemedAt:    string;
  used:          boolean;
}

function loadVouchers(): Voucher[] {
  if (typeof window === 'undefined') return [];
  try {
    return (JSON.parse(localStorage.getItem('picadilly-vouchers') || '[]') as Voucher[])
      .filter(v => !v.used);
  } catch { return []; }
}

function markVoucherUsed(voucherId: string) {
  try {
    const all = JSON.parse(localStorage.getItem('picadilly-vouchers') || '[]') as Voucher[];
    const updated = all.map(v => v.voucherId === voucherId ? { ...v, used: true } : v);
    localStorage.setItem('picadilly-vouchers', JSON.stringify(updated));
  } catch { /* ignore */ }
}

/* ─────────────────────────────────────────────────────────────
   STATIC DATA  (mirrors CustomizationStudio)
───────────────────────────────────────────────────────────── */
const FABRIC_INFO: Record<string, { name: string; color: string; texture: string; origin: string; basePrice: number }> = {
  'charcoal-wool':    { name: 'Charcoal Wool',    color: '#3D3D3D', texture: 'Fine Worsted',     origin: 'Loro Piana, Italy', basePrice: 1800 },
  'navy-herringbone': { name: 'Navy Herringbone',  color: '#1B2A4A', texture: 'Herringbone Twill', origin: 'Scabal, Belgium',   basePrice: 2200 },
  'midnight-velvet':  { name: 'Midnight Velvet',   color: '#0D1117', texture: 'Velvet Finish',    origin: 'Dormeuil, France',  basePrice: 2800 },
  'slate-flannel':    { name: 'Slate Flannel',     color: '#5A6472', texture: 'Brushed Flannel',  origin: 'Holland & Sherry',  basePrice: 1900 },
  'ivory-linen':      { name: 'Ivory Linen',       color: '#E8DCC8', texture: 'Summer Linen',     origin: 'Solbiati, Italy',   basePrice: 1600 },
  'burgundy-wool':    { name: 'Burgundy Wool',     color: '#5C1A2A', texture: 'Smooth Worsted',   origin: 'Loro Piana, Italy', basePrice: 2000 },
};

const LAPEL_INFO: Record<string, { name: string; surcharge: number }> = {
  peak:  { name: 'Peak Lapel',   surcharge: 0   },
  notch: { name: 'Notch Lapel',  surcharge: 0   },
  shawl: { name: 'Shawl Collar', surcharge: 200 },
};

const FIT_INFO: Record<string, { name: string; surcharge: number }> = {
  slim:     { name: 'Slim',     surcharge: 0   },
  tailored: { name: 'Tailored', surcharge: 150 },
  relaxed:  { name: 'Relaxed',  surcharge: 0   },
};

const LINING_INFO: Record<string, { name: string; color: string }> = {
  black: { name: 'Obsidian', color: '#0A0A0A' },
  gold:  { name: 'Aurum',    color: '#C5A230' },
  navy:  { name: 'Midnight', color: '#1B2A4A' },
  red:   { name: 'Claret',   color: '#7A1F2E' },
  ivory: { name: 'Ivory',    color: '#F5EFE0' },
  teal:  { name: 'Jade',     color: '#1A4A4A' },
};

/* ─────────────────────────────────────────────────────────────
   HARDCODED BODY SCAN MEASUREMENTS  (from BodyScan3D)
───────────────────────────────────────────────────────────── */
const MEASUREMENTS = [
  { label: 'Chest',          value: '38.5 in' },
  { label: 'Waist',          value: '32.0 in' },
  { label: 'Hips',           value: '39.0 in' },
  { label: 'Shoulder Width', value: '17.5 in' },
  { label: 'Sleeve Length',  value: '25.0 in' },
  { label: 'Jacket Length',  value: '30.5 in' },
  { label: 'Inseam',         value: '31.0 in' },
  { label: 'Neck',           value: '15.5 in' },
  { label: 'Thigh',          value: '22.0 in' },
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function calcPrice(config: SuitConfig, voucher?: Voucher | null): {
  base: number; lapelSurcharge: number; fitSurcharge: number;
  subtotal: number; discount: number; total: number;
} {
  const base           = FABRIC_INFO[config.fabric]?.basePrice ?? 1800;
  const lapelSurcharge = LAPEL_INFO[config.lapel]?.surcharge   ?? 0;
  const fitSurcharge   = FIT_INFO[config.fit]?.surcharge        ?? 0;
  const subtotal       = base + lapelSurcharge + fitSurcharge;

  let discount = 0;
  if (voucher && voucher.discountType === 'percent') {
    discount = Math.round(subtotal * voucher.discountValue / 100);
  } else if (voucher && voucher.discountType === 'fixed') {
    discount = Math.min(voucher.discountValue, subtotal);
  }

  return { base, lapelSurcharge, fitSurcharge, subtotal, discount, total: subtotal - discount };
}

function generateOrderNumber(): string {
  return 'PCT-' + Math.random().toString(36).toUpperCase().slice(2, 8);
}

/* ─────────────────────────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────────────────────────── */
const STEPS: { key: Step; label: string }[] = [
  { key: 'review',    label: 'Review'    },
  { key: 'details',   label: 'Details'   },
  { key: 'payment',   label: 'Payment'   },
  { key: 'confirmed', label: 'Confirmed' },
];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.key === current);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-6 h-6 flex items-center justify-center border transition-all duration-500"
              style={{
                borderColor: i <= idx ? '#C5A230' : 'rgba(197,162,48,0.2)',
                background:  i < idx  ? '#C5A230' : 'transparent',
              }}
            >
              {i < idx ? (
                <span style={{ color: '#0A0A0A', fontSize: '0.55rem' }}>✓</span>
              ) : (
                <span
                  className="font-josefin text-[0.5rem]"
                  style={{ color: i === idx ? '#C5A230' : 'rgba(197,162,48,0.3)' }}
                >
                  {i + 1}
                </span>
              )}
            </div>
            <span
              className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase hidden sm:block"
              style={{ color: i === idx ? '#C5A230' : i < idx ? 'rgba(197,162,48,0.6)' : 'rgba(200,190,168,0.3)' }}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className="w-12 sm:w-20 h-px mx-2 mb-4 transition-all duration-500"
              style={{ background: i < idx ? '#C5A230' : 'rgba(197,162,48,0.15)' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FORM FIELD COMPONENT
───────────────────────────────────────────────────────────── */
function Field({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  maxLength,
  required,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-josefin text-[0.58rem] tracking-[0.25em] uppercase text-cream-muted"
      >
        {label}{required && <span className="text-gold ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none
          placeholder:text-cream-muted/30 focus:border-gold/50 transition-colors duration-200"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 1 — ORDER REVIEW
───────────────────────────────────────────────────────────── */
function StepReview({
  config,
  appliedVoucher,
  onVoucherChange,
  onNext,
}: {
  config: SuitConfig;
  appliedVoucher: Voucher | null;
  onVoucherChange: (v: Voucher | null) => void;
  onNext: () => void;
}) {
  const fabric   = FABRIC_INFO[config.fabric];
  const lapel    = LAPEL_INFO[config.lapel];
  const fit      = FIT_INFO[config.fit];
  const lining   = LINING_INFO[config.lining];
  const pricing  = calcPrice(config, appliedVoucher);
  const vouchers = loadVouchers();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-1">Your Configuration</p>
        <h3 className="font-cormorant text-2xl font-light text-cream">Order Summary</h3>
      </div>

      {/* Suit spec */}
      <div className="border border-gold/10">
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gold/10">
          <div className="w-10 h-10 border border-gold/20 flex-shrink-0" style={{ background: fabric.color }} />
          <div>
            <p className="font-cormorant text-lg text-cream">{fabric.name}</p>
            <p className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-cream-muted">
              {fabric.texture} · {fabric.origin}
            </p>
          </div>
        </div>
        {[
          { label: 'Lapel Style', value: lapel.name },
          { label: 'Fit',         value: fit.name   },
          { label: 'Lining',      value: lining.name },
          { label: 'Buttons',     value: `${config.buttons} Button` },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center px-6 py-3 border-b border-smoke last:border-b-0">
            <span className="font-josefin text-[0.58rem] tracking-[0.2em] uppercase text-cream-muted">{row.label}</span>
            <div className="flex items-center gap-2">
              {row.label === 'Lining' && (
                <span className="w-3 h-3 border border-gold/20" style={{ background: lining.color }} />
              )}
              <span className="font-dm text-sm text-cream">{row.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Measurements */}
      <div>
        <p className="font-josefin text-[0.58rem] tracking-[0.25em] uppercase text-cream-muted mb-3">
          Body Scan Measurements
        </p>
        <div className="grid grid-cols-3 gap-px border border-gold/10 bg-smoke">
          {MEASUREMENTS.map(m => (
            <div key={m.label} className="bg-obsidian-50 px-4 py-3">
              <p className="font-josefin text-[0.48rem] tracking-[0.15em] uppercase text-cream-muted mb-0.5">{m.label}</p>
              <p className="font-cormorant text-base text-gold">{m.value}</p>
            </div>
          ))}
        </div>
        <p className="font-dm text-xs text-cream-muted/50 mt-2">
          Captured via 3D body scan · Confidence 98.4%
        </p>
      </div>

      {/* ── LOYALTY VOUCHERS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-josefin text-[0.58rem] tracking-[0.25em] uppercase text-cream-muted">
            Loyalty Vouchers
          </p>
          {vouchers.length > 0 && (
            <a
              href="/loyalty.html"
              target="_blank"
              rel="noreferrer"
              className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-gold/60 hover:text-gold transition-colors"
            >
              Earn more →
            </a>
          )}
        </div>

        {vouchers.length === 0 ? (
          /* No vouchers state */
          <div className="border border-smoke px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-dm text-sm text-cream-muted">No vouchers available</p>
              <p className="font-dm text-xs text-cream-muted/40 mt-0.5">
                Redeem points in your{' '}
                <a href="/loyalty.html" target="_blank" rel="noreferrer"
                   className="text-gold/60 hover:text-gold underline underline-offset-2 transition-colors">
                  Loyalty Dashboard
                </a>{' '}
                to earn vouchers.
              </p>
            </div>
            <span className="font-josefin text-[0.55rem] tracking-[0.15em] uppercase text-cream-muted/30 flex-shrink-0">
              0 available
            </span>
          </div>
        ) : (
          /* Voucher list */
          <div className="flex flex-col gap-2">
            {/* "No voucher" option */}
            <button
              onClick={() => onVoucherChange(null)}
              className="flex items-center gap-3 px-4 py-3 border text-left transition-all duration-200"
              style={{
                borderColor: appliedVoucher === null ? 'rgba(197,162,48,0.6)' : 'rgba(37,37,37,1)',
                background:  appliedVoucher === null ? 'rgba(197,162,48,0.04)' : 'transparent',
              }}
            >
              <span
                className="w-4 h-4 border flex-shrink-0 flex items-center justify-center"
                style={{ borderColor: appliedVoucher === null ? '#C5A230' : 'rgba(197,162,48,0.25)' }}
              >
                {appliedVoucher === null && (
                  <span className="w-2 h-2 bg-gold block" />
                )}
              </span>
              <span className="font-dm text-sm text-cream-muted">No voucher</span>
            </button>

            {vouchers.map(v => {
              const isSelected = appliedVoucher?.voucherId === v.voucherId;
              const discountLabel = v.discountType === 'percent'
                ? `${v.discountValue}% off`
                : v.discountType === 'fixed'
                ? `SGD ${v.discountValue} off`
                : 'Service perk';

              return (
                <motion.button
                  key={v.voucherId}
                  onClick={() => onVoucherChange(isSelected ? null : v)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-4 py-3 border text-left transition-all duration-200 w-full"
                  style={{
                    borderColor: isSelected ? '#C5A230' : 'rgba(37,37,37,1)',
                    background:  isSelected ? 'rgba(197,162,48,0.06)' : 'transparent',
                  }}
                >
                  {/* Radio indicator */}
                  <span
                    className="w-4 h-4 border flex-shrink-0 flex items-center justify-center"
                    style={{ borderColor: isSelected ? '#C5A230' : 'rgba(197,162,48,0.25)' }}
                  >
                    {isSelected && <span className="w-2 h-2 bg-gold block" />}
                  </span>

                  {/* Icon */}
                  <span className="text-gold text-sm flex-shrink-0">{v.icon}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-dm text-sm text-cream truncate">{v.name}</p>
                    <p className="font-josefin text-[0.5rem] tracking-[0.15em] uppercase text-cream-muted/50 mt-0.5">
                      {new Date(v.redeemedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Discount badge */}
                  <span
                    className="font-josefin text-[0.52rem] tracking-[0.15em] uppercase px-2 py-1 flex-shrink-0"
                    style={{
                      color:       isSelected ? '#0A0A0A' : '#C5A230',
                      background:  isSelected ? '#C5A230' : 'rgba(197,162,48,0.1)',
                      border:      `1px solid ${isSelected ? '#C5A230' : 'rgba(197,162,48,0.25)'}`,
                    }}
                  >
                    {discountLabel}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pricing */}
      <div className="border border-gold/10 px-6 py-5 flex flex-col gap-2">
        <div className="flex justify-between font-dm text-sm text-cream-muted">
          <span>Base fabric</span>
          <span>SGD {pricing.base.toLocaleString()}</span>
        </div>
        {pricing.lapelSurcharge > 0 && (
          <div className="flex justify-between font-dm text-sm text-cream-muted">
            <span>Shawl collar</span>
            <span>SGD {pricing.lapelSurcharge}</span>
          </div>
        )}
        {pricing.fitSurcharge > 0 && (
          <div className="flex justify-between font-dm text-sm text-cream-muted">
            <span>Tailored fit</span>
            <span>SGD {pricing.fitSurcharge}</span>
          </div>
        )}

        {/* Subtotal (only shown when discount applied) */}
        {pricing.discount > 0 && (
          <>
            <div className="flex justify-between font-dm text-sm text-cream-muted pt-2 border-t border-smoke">
              <span>Subtotal</span>
              <span>SGD {pricing.subtotal.toLocaleString()}</span>
            </div>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex justify-between font-dm text-sm"
              style={{ color: '#6DB87A' }}
            >
              <span className="flex items-center gap-1.5">
                <span style={{ fontSize: '0.7rem' }}>✦</span>
                {appliedVoucher?.name}
              </span>
              <span>− SGD {pricing.discount.toLocaleString()}</span>
            </motion.div>
          </>
        )}

        {/* Service perk notice */}
        {appliedVoucher && appliedVoucher.discountType === 'service' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-2 pt-2 border-t border-smoke"
          >
            <span className="text-gold text-xs mt-0.5">✦</span>
            <p className="font-dm text-xs text-cream-muted/70">
              <span className="text-gold">{appliedVoucher.name}</span> will be included with your order at no extra charge.
            </p>
          </motion.div>
        )}

        <div className="flex justify-between pt-3 border-t border-gold/10">
          <span className="font-josefin text-[0.6rem] tracking-[0.25em] uppercase text-cream">Total</span>
          <div className="text-right">
            {pricing.discount > 0 && (
              <p className="font-dm text-xs text-cream-muted/50 line-through mb-0.5">
                SGD {pricing.subtotal.toLocaleString()}
              </p>
            )}
            <span className="font-cormorant text-2xl text-gold">SGD {pricing.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-gold font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-obsidian hover:bg-gold-light transition-colors duration-300"
      >
        Continue to Details
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 2 — PERSONAL DETAILS
───────────────────────────────────────────────────────────── */
type FulfilmentMode = 'delivery' | 'collection';

interface DetailsForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fulfilment: FulfilmentMode;
  address: string;
  city: string;
  postal: string;
  preferredDate: string;
  notes: string;
}

const COLLECTION_ADDRESS = 'Far East Plaza, #04-13, 14 Scotts Road, Singapore 228213';
const COLLECTION_HOURS   = 'Mon – Sat  10:00 – 19:00   ·   Sun  12:00 – 17:00';

function StepDetails({
  form,
  onChange,
  onNext,
  onBack,
}: {
  form: DetailsForm;
  onChange: (f: DetailsForm) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const set = (k: keyof DetailsForm) => (v: string) => onChange({ ...form, [k]: v });

  const needsAddress = form.fulfilment === 'delivery';
  const valid = form.firstName && form.lastName && form.email && form.phone &&
    (!needsAddress || (form.address && form.city && form.postal));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-1">Contact & Fulfilment</p>
        <h3 className="font-cormorant text-2xl font-light text-cream">Your Details</h3>
      </div>

      {/* ── Fulfilment toggle ── */}
      <div>
        <p className="font-josefin text-[0.58rem] tracking-[0.25em] uppercase text-cream-muted mb-3">
          Fulfilment Method
        </p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'delivery',   icon: '⬡', title: 'White-Glove Delivery', sub: 'Delivered to your door' },
            { key: 'collection', icon: '◈', title: 'In-Store Collection',  sub: 'Collect at Far East Plaza' },
          ] as { key: FulfilmentMode; icon: string; title: string; sub: string }[]).map(opt => {
            const active = form.fulfilment === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => onChange({ ...form, fulfilment: opt.key })}
                className="flex flex-col gap-2 px-4 py-4 border text-left transition-all duration-200"
                style={{
                  borderColor: active ? '#C5A230' : 'rgba(37,37,37,1)',
                  background:  active ? 'rgba(197,162,48,0.05)' : 'transparent',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gold text-base">{opt.icon}</span>
                  {active && (
                    <span className="w-3 h-3 border border-gold flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-gold block" />
                    </span>
                  )}
                </div>
                <p className="font-josefin text-[0.58rem] tracking-[0.18em] uppercase"
                   style={{ color: active ? '#F5EFE0' : '#C8BEA8' }}>
                  {opt.title}
                </p>
                <p className="font-dm text-xs text-cream-muted/50">{opt.sub}</p>
              </button>
            );
          })}
        </div>

        {/* Collection info panel */}
        <AnimatePresence>
          {form.fulfilment === 'collection' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 border border-gold/15 bg-obsidian-50 px-5 py-4 flex flex-col gap-2">
                <p className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-gold mb-1">Store Address</p>
                <p className="font-dm text-sm text-cream">{COLLECTION_ADDRESS}</p>
                <p className="font-dm text-xs text-cream-muted/60 mt-1">{COLLECTION_HOURS}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name" id="firstName" value={form.firstName} onChange={set('firstName')} required />
        <Field label="Last Name"  id="lastName"  value={form.lastName}  onChange={set('lastName')}  required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email" id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
        <Field label="Phone" id="phone" type="tel"   value={form.phone} onChange={set('phone')} placeholder="+65 9123 4567"   required />
      </div>

      {/* Delivery address (conditional) */}
      <AnimatePresence>
        {form.fulfilment === 'delivery' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden flex flex-col gap-4"
          >
            <Field label="Delivery Address" id="address" value={form.address} onChange={set('address')} placeholder="Block / Street" required />
            <div className="grid grid-cols-2 gap-4">
              <Field label="City"        id="city"   value={form.city}   onChange={set('city')}   placeholder="Singapore" required />
              <Field label="Postal Code" id="postal" value={form.postal} onChange={set('postal')} placeholder="123456" maxLength={6} required />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection date preference */}
      {form.fulfilment === 'collection' && (
        <Field
          label="Preferred Collection Date"
          id="preferredDate"
          type="date"
          value={form.preferredDate}
          onChange={set('preferredDate')}
        />
      )}

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="font-josefin text-[0.58rem] tracking-[0.25em] uppercase text-cream-muted">
          Special Instructions{' '}
          <span className="text-cream-muted/40 normal-case tracking-normal font-dm text-xs">(optional)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={e => set('notes')(e.target.value)}
          rows={3}
          placeholder="Any special requests for your tailor…"
          className="bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none
            placeholder:text-cream-muted/30 focus:border-gold/50 transition-colors duration-200 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-4 border border-gold/30 font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted hover:border-gold/60 hover:text-cream transition-all duration-300"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!valid}
          className="flex-[2] py-4 bg-gold font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-obsidian hover:bg-gold-light transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 3 — PAYMENT
───────────────────────────────────────────────────────────── */
type PaymentMethod = 'card' | 'paynow' | 'applepay' | 'googlepay';

interface PaymentForm {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

function formatCard(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + ' / ' + digits.slice(2);
  return digits;
}

const PAYMENT_METHODS: { key: PaymentMethod; label: string; sublabel: string }[] = [
  { key: 'card',      label: 'Credit / Debit Card', sublabel: 'Visa, Mastercard, Amex' },
  { key: 'paynow',    label: 'PayNow',               sublabel: 'Scan QR with your banking app' },
  { key: 'applepay',  label: 'Apple Pay',             sublabel: 'Pay with Face ID or Touch ID' },
  { key: 'googlepay', label: 'Google Pay',            sublabel: 'Pay with your Google account' },
];

function StepPayment({
  config,
  appliedVoucher,
  form,
  onChange,
  onPlace,
  onBack,
  placing,
}: {
  config: SuitConfig;
  appliedVoucher: Voucher | null;
  form: PaymentForm;
  onChange: (f: PaymentForm) => void;
  onPlace: () => void;
  onBack: () => void;
  placing: boolean;
}) {
  const [method, setMethod] = useState<PaymentMethod>('card');
  const set = (k: keyof PaymentForm) => (v: string) => onChange({ ...form, [k]: v });
  const pricing = calcPrice(config, appliedVoucher);
  const cardValid = form.cardName && form.cardNumber.replace(/\s/g, '').length === 16 && form.expiry.length >= 7 && form.cvv.length >= 3;
  const valid = method === 'card' ? !!cardValid : true;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-1">Secure Checkout</p>
        <h3 className="font-cormorant text-2xl font-light text-cream">Payment</h3>
      </div>

      {/* Amount reminder */}
      <div className="border border-gold/20 bg-obsidian-50 px-6 py-4 flex flex-col gap-2">
        {appliedVoucher && pricing.discount > 0 && (
          <div className="flex justify-between font-dm text-xs pb-2 border-b border-smoke"
               style={{ color: '#6DB87A' }}>
            <span className="flex items-center gap-1.5">
              <span>✦</span> {appliedVoucher.name}
            </span>
            <span>− SGD {pricing.discount.toLocaleString()}</span>
          </div>
        )}
        {appliedVoucher && appliedVoucher.discountType === 'service' && (
          <div className="flex items-center gap-1.5 font-dm text-xs pb-2 border-b border-smoke text-gold/70">
            <span>✦</span>
            <span>{appliedVoucher.name} included</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="font-josefin text-[0.58rem] tracking-[0.2em] uppercase text-cream-muted">Amount Due</span>
          <span className="font-cormorant text-2xl text-gold">SGD {pricing.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment method selector */}
      <div>
        <p className="font-josefin text-[0.58rem] tracking-[0.25em] uppercase text-cream-muted mb-3">
          Payment Method
        </p>
        <div className="flex flex-col gap-2">
          {PAYMENT_METHODS.map(({ key, label, sublabel }) => (
            <button
              key={key}
              onClick={() => setMethod(key)}
              className={`w-full flex items-center justify-between px-5 py-4 border transition-all duration-200
                ${method === key
                  ? 'border-gold/60 bg-gold/5'
                  : 'border-smoke hover:border-gold/30 bg-transparent'}`}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className={`font-josefin text-[0.6rem] tracking-[0.2em] uppercase transition-colors duration-200
                  ${method === key ? 'text-gold' : 'text-cream-muted'}`}>
                  {label}
                </span>
                <span className="font-dm text-[0.68rem] text-cream-muted/50">{sublabel}</span>
              </div>
              {/* Selection indicator */}
              <span className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center transition-all duration-200
                ${method === key ? 'border-gold bg-gold' : 'border-cream-muted/30'}`}>
                {method === key && (
                  <span className="w-1.5 h-1.5 bg-obsidian block" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Card form */}
      {method === 'card' && (
        <div className="flex flex-col gap-6">
          <Field
            label="Name on Card" id="cardName"
            value={form.cardName} onChange={set('cardName')} required
            placeholder="James Whitmore"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cardNumber" className="font-josefin text-[0.58rem] tracking-[0.25em] uppercase text-cream-muted">
              Card Number <span className="text-gold">*</span>
            </label>
            <div className="relative">
              <input
                id="cardNumber"
                type="text"
                inputMode="numeric"
                value={form.cardNumber}
                onChange={e => set('cardNumber')(formatCard(e.target.value))}
                placeholder="0000 0000 0000 0000"
                className="w-full bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none
                  placeholder:text-cream-muted/30 focus:border-gold/50 transition-colors duration-200 tracking-widest"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-josefin text-[0.5rem] tracking-widest uppercase text-cream-muted/40">
                {form.cardNumber.startsWith('4') ? 'VISA' : form.cardNumber.startsWith('5') ? 'MC' : form.cardNumber.startsWith('3') ? 'AMEX' : 'CARD'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="expiry" className="font-josefin text-[0.58rem] tracking-[0.25em] uppercase text-cream-muted">
                Expiry <span className="text-gold">*</span>
              </label>
              <input
                id="expiry"
                type="text"
                inputMode="numeric"
                value={form.expiry}
                onChange={e => set('expiry')(formatExpiry(e.target.value))}
                placeholder="MM / YY"
                className="bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none
                  placeholder:text-cream-muted/30 focus:border-gold/50 transition-colors duration-200"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cvv" className="font-josefin text-[0.58rem] tracking-[0.25em] uppercase text-cream-muted">
                CVV <span className="text-gold">*</span>
              </label>
              <input
                id="cvv"
                type="password"
                inputMode="numeric"
                value={form.cvv}
                onChange={e => set('cvv')(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="•••"
                className="bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none
                  placeholder:text-cream-muted/30 focus:border-gold/50 transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* PayNow QR */}
      {method === 'paynow' && (
        <div className="flex flex-col items-center gap-5 border border-gold/10 bg-obsidian-50 py-8 px-6">
          <p className="font-josefin text-[0.58rem] tracking-[0.25em] uppercase text-cream-muted">Scan to Pay</p>
          {/* QR placeholder */}
          <div className="w-36 h-36 bg-cream flex items-center justify-center">
            <svg viewBox="0 0 80 80" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
              {/* QR corners */}
              <rect x="4" y="4" width="28" height="28" fill="none" stroke="#0A0A0A" strokeWidth="4"/>
              <rect x="10" y="10" width="16" height="16" fill="#0A0A0A"/>
              <rect x="48" y="4" width="28" height="28" fill="none" stroke="#0A0A0A" strokeWidth="4"/>
              <rect x="54" y="10" width="16" height="16" fill="#0A0A0A"/>
              <rect x="4" y="48" width="28" height="28" fill="none" stroke="#0A0A0A" strokeWidth="4"/>
              <rect x="10" y="54" width="16" height="16" fill="#0A0A0A"/>
              {/* QR body dots */}
              <rect x="40" y="40" width="6" height="6" fill="#0A0A0A"/>
              <rect x="50" y="40" width="6" height="6" fill="#0A0A0A"/>
              <rect x="60" y="40" width="14" height="6" fill="#0A0A0A"/>
              <rect x="40" y="50" width="14" height="6" fill="#0A0A0A"/>
              <rect x="60" y="50" width="6" height="6" fill="#0A0A0A"/>
              <rect x="40" y="60" width="6" height="14" fill="#0A0A0A"/>
              <rect x="50" y="62" width="6" height="6" fill="#0A0A0A"/>
              <rect x="60" y="58" width="14" height="6" fill="#0A0A0A"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="font-cormorant text-lg font-light text-cream">Picadilly Tailors Pte Ltd</p>
            <p className="font-dm text-xs text-cream-muted/60 mt-1">UEN: 197300123K</p>
          </div>
          <p className="font-dm text-xs text-cream-muted/50 text-center leading-relaxed max-w-xs">
            Open your banking app, select PayNow, and scan the QR code above. The payment reference will be sent to your email upon confirmation.
          </p>
        </div>
      )}

      {/* Apple Pay */}
      {method === 'applepay' && (
        <div className="flex flex-col items-center gap-5 border border-gold/10 bg-obsidian-50 py-8 px-6">
          <svg viewBox="0 0 64 24" width="80" height="30" xmlns="http://www.w3.org/2000/svg" aria-label="Apple Pay">
            <text x="0" y="20" fontFamily="sans-serif" fontSize="20" fontWeight="600" fill="#F5EFE0"></text>
            <path d="M11.5 3.5c1-.1 2 .4 2.7 1.1-.7.8-1.8 1.4-2.8 1.3C10.4 6 9.4 5.4 8.8 4.7c.7-.8 1.7-1.2 2.7-1.2zm3.6 2.9c1.5.9 2.5 2.5 2.5 4.2 0 .5-.1 1-.2 1.4-.4 1.4-1.3 2.6-2.4 3.5-.7.5-1.4.8-2.1.8-.8 0-1.3-.3-2-.3s-1.3.3-2 .3c-.7 0-1.4-.3-2.1-.8-1-.8-1.9-2-2.3-3.4C4.3 11.4 4 10.5 4 9.5c0-1.6.6-3 1.6-4 .9-.9 2.1-1.4 3.3-1.4.8 0 1.6.3 2.3.3.6 0 1.4-.3 2.2-.3.5 0 1 .1 1.7.3z" fill="#F5EFE0"/>
            <text x="22" y="18" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="500" fill="#F5EFE0">Pay</text>
          </svg>
          <p className="font-dm text-sm text-cream-muted/70 text-center leading-relaxed max-w-xs">
            You will be prompted to confirm payment with Face ID or Touch ID on your Apple device.
          </p>
          <p className="font-dm text-xs text-cream-muted/40 text-center">
            Apple Pay is available on Safari on iOS and macOS.
          </p>
        </div>
      )}

      {/* Google Pay */}
      {method === 'googlepay' && (
        <div className="flex flex-col items-center gap-5 border border-gold/10 bg-obsidian-50 py-8 px-6">
          <div className="flex items-center gap-1">
            <span style={{ fontFamily: 'sans-serif', fontSize: 22, fontWeight: 400, color: '#4285F4' }}>G</span>
            <span style={{ fontFamily: 'sans-serif', fontSize: 22, fontWeight: 400, color: '#F5EFE0' }}>oogle</span>
            <span style={{ fontFamily: 'sans-serif', fontSize: 22, fontWeight: 400, color: '#F5EFE0', marginLeft: 6 }}>Pay</span>
          </div>
          <p className="font-dm text-sm text-cream-muted/70 text-center leading-relaxed max-w-xs">
            You will be redirected to Google Pay to complete your payment securely using your saved Google account.
          </p>
          <p className="font-dm text-xs text-cream-muted/40 text-center">
            Ensure you are signed in to your Google account on this device.
          </p>
        </div>
      )}

      {/* Security note */}
      <p className="font-dm text-xs text-cream-muted/50 leading-relaxed">
        Your payment details are encrypted and processed securely. Picadilly Tailors does not store card information.
        A 50% deposit is charged today; the balance is due on collection.
      </p>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex-1 py-4 border border-gold/30 font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted hover:border-gold/60 hover:text-cream transition-all duration-300"
        >
          Back
        </button>
        <button
          onClick={onPlace}
          disabled={!valid || placing}
          className="flex-[2] py-4 bg-gold font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-obsidian hover:bg-gold-light transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {placing ? 'Processing…' : `Place Order · SGD ${pricing.total.toLocaleString()}${pricing.discount > 0 ? ` (saved SGD ${pricing.discount.toLocaleString()})` : ''}`}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 4 — CONFIRMATION
───────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────
   ORDER STATUS TRACKER
───────────────────────────────────────────────────────────── */
interface OrderStage {
  key: string;
  label: string;
  sublabel: string;
  eta: string;
}

function buildStages(fulfilment: FulfilmentMode): OrderStage[] {
  return [
    { key: 'confirmed',   label: 'Order Confirmed',      sublabel: 'Payment received, order logged',      eta: 'Today'       },
    { key: 'cutting',     label: 'Fabric Cutting',        sublabel: 'Your cloth is being cut & prepped',   eta: 'Days 1 – 3'  },
    { key: 'tailoring',   label: 'Master Tailoring',      sublabel: 'Hand-basting & construction',         eta: 'Days 4 – 14' },
    { key: 'fitting',     label: 'First Fitting',         sublabel: 'Adjustment session with your tailor', eta: 'Days 15 – 18'},
    { key: 'finishing',   label: 'Final Finishing',       sublabel: 'Pressing, buttons & lining',          eta: 'Days 19 – 22'},
    {
      key: fulfilment === 'delivery' ? 'delivery' : 'collection',
      label: fulfilment === 'delivery' ? 'Out for Delivery' : 'Ready for Collection',
      sublabel: fulfilment === 'delivery'
        ? 'White-glove courier en route to your address'
        : 'Your suit is waiting at Far East Plaza',
      eta: 'Days 23 – 28',
    },
  ];
}

function OrderTracker({ fulfilment, activeStageIdx }: { fulfilment: FulfilmentMode; activeStageIdx: number }) {
  const stages = buildStages(fulfilment);

  return (
    <div className="w-full">
      <p className="font-josefin text-[0.55rem] tracking-[0.25em] uppercase text-cream-muted mb-5">Order Progress</p>
      <div className="flex flex-col gap-0">
        {stages.map((stage, i) => {
          const done    = i < activeStageIdx;
          const active  = i === activeStageIdx;
          const pending = i > activeStageIdx;

          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 + 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-4 items-stretch"
            >
              {/* Timeline column */}
              <div className="flex flex-col items-center w-6 flex-shrink-0">
                {/* Node */}
                <div
                  className="w-5 h-5 border flex items-center justify-center flex-shrink-0 relative z-10"
                  style={{
                    borderColor: done ? '#C5A230' : active ? '#C5A230' : 'rgba(197,162,48,0.2)',
                    background:  done ? '#C5A230' : active ? 'rgba(197,162,48,0.08)' : 'transparent',
                  }}
                >
                  {done ? (
                    <span style={{ color: '#0A0A0A', fontSize: '0.5rem', fontWeight: 700 }}>✓</span>
                  ) : active ? (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1.4 }}
                      className="w-1.5 h-1.5 bg-gold block"
                    />
                  ) : (
                    <span className="w-1 h-1 block" style={{ background: 'rgba(197,162,48,0.2)' }} />
                  )}
                </div>
                {/* Connector line */}
                {i < stages.length - 1 && (
                  <div
                    className="w-px flex-1 my-0.5"
                    style={{
                      background: done
                        ? '#C5A230'
                        : 'rgba(197,162,48,0.12)',
                      minHeight: 28,
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-5 flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className="font-josefin text-[0.6rem] tracking-[0.18em] uppercase leading-tight"
                      style={{
                        color: done ? 'rgba(197,162,48,0.7)' : active ? '#F5EFE0' : 'rgba(200,190,168,0.3)',
                      }}
                    >
                      {stage.label}
                    </p>
                    <p
                      className="font-dm text-xs mt-0.5"
                      style={{ color: pending ? 'rgba(200,190,168,0.2)' : '#C8BEA8' }}
                    >
                      {active ? (
                        <span style={{ color: '#C5A230' }}>In progress — {stage.sublabel}</span>
                      ) : (
                        stage.sublabel
                      )}
                    </p>
                  </div>
                  <span
                    className="font-josefin text-[0.48rem] tracking-[0.15em] uppercase flex-shrink-0 mt-0.5"
                    style={{ color: done ? 'rgba(197,162,48,0.5)' : active ? 'rgba(197,162,48,0.8)' : 'rgba(200,190,168,0.2)' }}
                  >
                    {stage.eta}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 4 — CONFIRMATION
───────────────────────────────────────────────────────────── */
function StepConfirmed({
  orderNumber,
  email,
  appliedVoucher,
  fulfilment,
  onClose,
}: {
  orderNumber: string;
  email: string;
  appliedVoucher: Voucher | null;
  fulfilment: FulfilmentMode;
  onClose: () => void;
}) {
  // Simulate "confirmed" as stage 0 (first stage already complete)
  const [activeStage, setActiveStage] = useState(0);

  // Auto-advance once just for demo feel
  useEffect(() => {
    const t = setTimeout(() => setActiveStage(1), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-8 py-6"
    >
      {/* Gold checkmark */}
      <div className="w-14 h-14 border border-gold flex items-center justify-center">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 220 }}
          className="font-cormorant text-3xl text-gold"
        >
          ✓
        </motion.span>
      </div>

      <div className="text-center">
        <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-2">Order Confirmed</p>
        <h3 className="font-cormorant text-3xl font-light text-cream">Thank You</h3>
      </div>

      {/* Order summary card */}
      <div className="border border-gold/15 w-full px-6 py-5 flex flex-col gap-3">
        <div className="flex justify-between items-center pb-3 border-b border-smoke">
          <span className="font-josefin text-[0.52rem] tracking-[0.2em] uppercase text-cream-muted">Order Reference</span>
          <span className="font-cormorant text-lg text-gold">{orderNumber}</span>
        </div>

        {/* Fulfilment badge */}
        <div className="flex justify-between items-center">
          <span className="font-josefin text-[0.52rem] tracking-[0.18em] uppercase text-cream-muted">Fulfilment</span>
          <span
            className="font-josefin text-[0.52rem] tracking-[0.15em] uppercase px-2.5 py-1 border"
            style={{ borderColor: 'rgba(197,162,48,0.35)', color: '#C5A230', background: 'rgba(197,162,48,0.05)' }}
          >
            {fulfilment === 'delivery' ? '⬡ White-Glove Delivery' : '◈ In-Store Collection'}
          </span>
        </div>

        {fulfilment === 'collection' && (
          <div className="flex flex-col gap-0.5 pt-1 border-t border-smoke">
            <span className="font-josefin text-[0.5rem] tracking-[0.18em] uppercase text-cream-muted">Collection Address</span>
            <span className="font-dm text-xs text-cream mt-1">{COLLECTION_ADDRESS}</span>
            <span className="font-dm text-xs text-cream-muted/50 mt-0.5">{COLLECTION_HOURS}</span>
          </div>
        )}

        {[
          { label: 'Confirmation sent to', value: email },
          ...(appliedVoucher ? [{ label: 'Loyalty reward', value: appliedVoucher.name }] : []),
          { label: 'Estimated completion', value: '3 – 4 weeks' },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-start gap-4 pt-1 border-t border-smoke first:border-0 first:pt-0">
            <span className="font-josefin text-[0.5rem] tracking-[0.16em] uppercase text-cream-muted flex-shrink-0">{row.label}</span>
            <span className="font-dm text-xs text-cream text-right">{row.value}</span>
          </div>
        ))}
      </div>

      {/* ── Order tracker ── */}
      <div className="w-full border border-gold/10 px-6 py-5">
        <OrderTracker fulfilment={fulfilment} activeStageIdx={activeStage} />
      </div>

      <div className="flex flex-col gap-3 w-full">
        <a
          href={`/track-order.html?ref=${orderNumber}`}
          className="w-full py-4 bg-gold font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-obsidian hover:bg-gold-light transition-colors duration-300 text-center block"
        >
          Track Your Order
        </a>
        <button
          onClick={onClose}
          className="w-full py-4 border border-gold/30 font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted hover:border-gold/60 hover:text-cream transition-all duration-300"
        >
          Back to Site
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN MODAL
───────────────────────────────────────────────────────────── */
export default function CheckoutModal({ isOpen, onClose, config }: CheckoutModalProps) {
  const [step, setStep]               = useState<Step>('review');
  const [placing, setPlacing]         = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  const [details, setDetails] = useState<DetailsForm>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postal: '', notes: '',
  });

  const [payment, setPayment] = useState<PaymentForm>({
    cardName: '', cardNumber: '', expiry: '', cvv: '',
  });

  /* Reset to first step whenever modal opens */
  useEffect(() => {
    if (isOpen) {
      setStep('review');
      setPlacing(false);
      setOrderNumber('');
      setAppliedVoucher(null);
    }
  }, [isOpen]);

  /* Lock body scroll while open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function placeOrder() {
    setPlacing(true);
    setTimeout(() => {
      if (appliedVoucher) markVoucherUsed(appliedVoucher.voucherId);
      const ref = generateOrderNumber();
      setOrderNumber(ref);

      /* Save to localStorage so track-order.html can look it up immediately */
      try {
        const fabric = FABRIC_INFO[config.fabric];
        const existing = JSON.parse(localStorage.getItem('picadilly-orders') || '{}');
        existing[ref] = {
          ref,
          stage:        'confirmed',
          fulfilment:   details.fulfilment,
          customer:     `${details.firstName} ${details.lastName}`,
          email:        details.email,
          placed:       new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          fabric:       fabric?.name ?? config.fabric,
          fit:          FIT_INFO[config.fit]?.name ?? config.fit,
          total:        `SGD ${calcPrice(config, appliedVoucher).total.toLocaleString()}`,
          address:      details.fulfilment === 'delivery'
                          ? `${details.address}, ${details.city} ${details.postal}`
                          : undefined,
          preferredDate: details.fulfilment === 'collection' ? details.preferredDate : undefined,
        };
        localStorage.setItem('picadilly-orders', JSON.stringify(existing));
      } catch { /* ignore storage errors */ }

      setStep('confirmed');
      setPlacing(false);
    }, 2000);
  }

  const stepContent: Record<Step, React.ReactNode> = {
    review: (
      <StepReview
        config={config}
        appliedVoucher={appliedVoucher}
        onVoucherChange={setAppliedVoucher}
        onNext={() => setStep('details')}
      />
    ),
    details: (
      <StepDetails
        form={details}
        onChange={setDetails}
        onNext={() => setStep('payment')}
        onBack={() => setStep('review')}
      />
    ),
    payment: (
      <StepPayment
        config={config}
        appliedVoucher={appliedVoucher}
        form={payment}
        onChange={setPayment}
        onPlace={placeOrder}
        onBack={() => setStep('details')}
        placing={placing}
      />
    ),
    confirmed: (
      <StepConfirmed orderNumber={orderNumber} email={details.email} appliedVoucher={appliedVoucher} onClose={onClose} />
    ),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[9500]"
            style={{ background: 'rgba(10,10,10,0.88)', backdropFilter: 'blur(8px)' }}
            onClick={step !== 'confirmed' ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[9600] w-full max-w-lg bg-obsidian border-l border-gold/10 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Checkout"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gold/10 flex-shrink-0">
              <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-gold">Picadilly Tailors</p>
              {step !== 'confirmed' && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center border border-smoke text-cream-muted hover:border-gold/40 hover:text-cream transition-all duration-200 font-josefin text-xs"
                  aria-label="Close checkout"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Step indicator */}
            {step !== 'confirmed' && (
              <div className="px-8 py-5 border-b border-gold/10 flex-shrink-0">
                <StepIndicator current={step} />
              </div>
            )}

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {stepContent[step]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
