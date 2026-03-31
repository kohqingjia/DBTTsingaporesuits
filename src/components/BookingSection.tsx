'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const SERVICES = [
  { id: 'new-suit',    label: 'New Bespoke Suit',         desc: 'Full consultation for a new commission' },
  { id: 'fitting',     label: 'Fitting Appointment',       desc: 'First or subsequent fitting session'    },
  { id: 'alteration',  label: 'Alteration & Tailoring',    desc: 'Adjustments to an existing garment'     },
  { id: 'fabric',      label: 'Fabric Selection',          desc: 'Browse our cloth library with a tailor' },
  { id: 'enquiry',     label: 'General Enquiry',           desc: 'Any question about our services'        },
];

// Mon–Sat 11:00–20:00, Sun 12:00–18:00 — slots every hour on the half-hour
function generateSlots(dateStr: string): string[] {
  if (!dateStr) return [];
  const day = new Date(dateStr).getDay(); // 0 = Sun
  const [startH, endH] = day === 0 ? [12, 18] : [11, 20];
  const slots: string[] = [];
  for (let h = startH; h < endH; h++) {
    const label = `${h % 12 === 0 ? 12 : h % 12}:00 ${h < 12 ? 'AM' : 'PM'}`;
    slots.push(label);
    if (h < endH - 1) {
      const half = h + 0.5;
      const halfH = Math.floor(half);
      const halfLabel = `${halfH % 12 === 0 ? 12 : halfH % 12}:30 ${halfH < 12 ? 'AM' : 'PM'}`;
      slots.push(halfLabel);
    }
  }
  return slots;
}

// Minimum bookable date = tomorrow
function minDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

interface BookingForm {
  service: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const EMPTY: BookingForm = {
  service: '', date: '', time: '', name: '', email: '', phone: '', notes: '',
};

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function BookingSection() {
  const [form, setForm] = useState<BookingForm>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [refNumber, setRefNumber] = useState('');

  const set = (k: keyof BookingForm) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const slots = useMemo(() => generateSlots(form.date), [form.date]);

  // Reset time if date changes and current time no longer valid
  const handleDateChange = (v: string) => {
    setForm(prev => ({ ...prev, date: v, time: '' }));
  };

  const valid =
    form.service && form.date && form.time &&
    form.name.trim() && form.email.includes('@') && form.phone.trim();

  function handleSubmit() {
    if (!valid) return;
    const ref = 'PT-' + Date.now().toString(36).toUpperCase().slice(-6);
    setRefNumber(ref);
    setSubmitted(true);
  }

  const selectedService = SERVICES.find(s => s.id === form.service);
  const formattedDate = form.date
    ? new Date(form.date + 'T12:00:00').toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <section id="booking" className="py-28 px-8 border-t border-gold/10 bg-obsidian-50">
      <div className="max-w-screen-xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <p className="section-label mb-3">Atelier Appointments</p>
          <h2 className="font-cormorant text-4xl md:text-5xl font-light text-cream">
            Book a <em>Consultation</em>
          </h2>
          <div className="mt-6 max-w-xl">
            <p className="font-dm text-sm text-cream-muted leading-relaxed">
              Reserve time with our master tailor at Far East Plaza. All consultations are complimentary with no obligation.
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── Confirmation screen ── */}
          {submitted ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="border border-gold/20 bg-obsidian p-12 max-w-2xl"
            >
              {/* Top marker */}
              <div className="flex items-center gap-4 mb-8">
                <span className="w-6 h-6 border border-gold flex items-center justify-center flex-shrink-0"
                      style={{ color: '#C5A230', fontSize: '0.6rem' }}>✓</span>
                <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-gold">
                  Appointment Confirmed
                </p>
              </div>

              <h3 className="font-cormorant text-3xl font-light text-cream mb-8">
                We look forward to seeing you.
              </h3>

              {/* Summary grid */}
              <div className="grid grid-cols-2 gap-px border border-gold/10 bg-smoke mb-8">
                {[
                  { label: 'Reference',   value: refNumber },
                  { label: 'Service',     value: selectedService?.label ?? '' },
                  { label: 'Date',        value: formattedDate },
                  { label: 'Time',        value: form.time },
                  { label: 'Name',        value: form.name },
                  { label: 'Contact',     value: form.email },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-obsidian-50 px-5 py-4">
                    <p className="font-josefin text-[0.48rem] tracking-[0.2em] uppercase text-cream-muted/40 mb-1">{label}</p>
                    <p className="font-dm text-sm text-cream">{value}</p>
                  </div>
                ))}
              </div>

              <p className="font-dm text-xs text-cream-muted/50 leading-relaxed mb-8">
                A confirmation has been sent to <span className="text-cream-muted">{form.email}</span>. Our team will reach out within 24 hours to confirm the appointment. Far East Plaza, 14 Scotts Road #02-85, Singapore 228213.
              </p>

              <button
                onClick={() => { setForm(EMPTY); setSubmitted(false); }}
                className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase px-7 py-3.5 border border-gold/40 text-gold hover:border-gold/70 transition-all duration-300"
              >
                Book Another Appointment
              </button>
            </motion.div>

          ) : (

            /* ── Booking form ── */
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid lg:grid-cols-[1fr_380px] gap-0 border border-gold/10"
            >

              {/* Left — form */}
              <div className="border-r border-gold/10 p-10 flex flex-col gap-10">

                {/* 01 Service */}
                <div>
                  <p className="font-josefin text-[0.58rem] tracking-[0.3em] uppercase text-cream-muted/50 mb-5">
                    01 &nbsp; Select Service
                  </p>
                  <div className="flex flex-col gap-2">
                    {SERVICES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => set('service')(s.id)}
                        className={`flex items-center justify-between px-5 py-4 border text-left transition-all duration-200
                          ${form.service === s.id
                            ? 'border-gold/60 bg-gold/5'
                            : 'border-smoke hover:border-gold/30'}`}
                      >
                        <div>
                          <p className={`font-josefin text-[0.58rem] tracking-[0.2em] uppercase transition-colors duration-200
                            ${form.service === s.id ? 'text-gold' : 'text-cream-muted'}`}>
                            {s.label}
                          </p>
                          <p className="font-dm text-[0.68rem] text-cream-muted/40 mt-0.5">{s.desc}</p>
                        </div>
                        <span className={`w-3 h-3 border flex-shrink-0 flex items-center justify-center transition-all duration-200
                          ${form.service === s.id ? 'border-gold bg-gold' : 'border-cream-muted/20'}`}>
                          {form.service === s.id && <span className="w-1.5 h-1.5 bg-obsidian block" />}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 02 Date & Time */}
                <div>
                  <p className="font-josefin text-[0.58rem] tracking-[0.3em] uppercase text-cream-muted/50 mb-5">
                    02 &nbsp; Date & Time
                  </p>
                  <div className="flex flex-col gap-4">
                    {/* Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-josefin text-[0.55rem] tracking-[0.2em] uppercase text-cream-muted">
                        Preferred Date <span className="text-gold">*</span>
                      </label>
                      <input
                        type="date"
                        min={minDate()}
                        value={form.date}
                        onChange={e => handleDateChange(e.target.value)}
                        className="bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none
                          focus:border-gold/50 transition-colors duration-200 [color-scheme:dark]"
                      />
                    </div>

                    {/* Time slots */}
                    {form.date && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        <label className="font-josefin text-[0.55rem] tracking-[0.2em] uppercase text-cream-muted block mb-3">
                          Available Times <span className="text-gold">*</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {slots.map(slot => (
                            <button
                              key={slot}
                              onClick={() => set('time')(slot)}
                              className={`py-2.5 font-josefin text-[0.52rem] tracking-[0.1em] uppercase border transition-all duration-200
                                ${form.time === slot
                                  ? 'border-gold bg-gold/10 text-gold'
                                  : 'border-smoke text-cream-muted/50 hover:border-gold/30 hover:text-cream-muted'}`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                        <p className="font-dm text-[0.65rem] text-cream-muted/30 mt-3">
                          {new Date(form.date + 'T12:00:00').getDay() === 0
                            ? 'Sunday hours: 12:00 PM – 6:00 PM'
                            : 'Monday – Saturday: 11:00 AM – 8:00 PM'}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* 03 Contact Details */}
                <div>
                  <p className="font-josefin text-[0.58rem] tracking-[0.3em] uppercase text-cream-muted/50 mb-5">
                    03 &nbsp; Your Details
                  </p>
                  <div className="flex flex-col gap-4">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-josefin text-[0.55rem] tracking-[0.2em] uppercase text-cream-muted">
                        Full Name <span className="text-gold">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="James Whitmore"
                        value={form.name}
                        onChange={e => set('name')(e.target.value)}
                        className="bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none
                          placeholder:text-cream-muted/25 focus:border-gold/50 transition-colors duration-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-josefin text-[0.55rem] tracking-[0.2em] uppercase text-cream-muted">
                          Email <span className="text-gold">*</span>
                        </label>
                        <input
                          type="email"
                          placeholder="james@email.com"
                          value={form.email}
                          onChange={e => set('email')(e.target.value)}
                          className="bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none
                            placeholder:text-cream-muted/25 focus:border-gold/50 transition-colors duration-200"
                        />
                      </div>
                      {/* Phone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-josefin text-[0.55rem] tracking-[0.2em] uppercase text-cream-muted">
                          Phone <span className="text-gold">*</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="+65 9000 0000"
                          value={form.phone}
                          onChange={e => set('phone')(e.target.value)}
                          className="bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none
                            placeholder:text-cream-muted/25 focus:border-gold/50 transition-colors duration-200"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-josefin text-[0.55rem] tracking-[0.2em] uppercase text-cream-muted">
                        Additional Notes <span className="text-cream-muted/30">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Any specific requirements, occasions, or questions…"
                        value={form.notes}
                        onChange={e => set('notes')(e.target.value)}
                        className="bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-3 outline-none resize-none
                          placeholder:text-cream-muted/25 focus:border-gold/50 transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-2 border-t border-gold/10">
                  <button
                    onClick={handleSubmit}
                    disabled={!valid}
                    className="w-full py-4 bg-gold font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-obsidian hover:bg-gold-light transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Confirm Appointment
                  </button>
                  <p className="font-dm text-[0.68rem] text-cream-muted/35 mt-3 text-center">
                    All consultations are complimentary. Our team will confirm via email within 24 hours.
                  </p>
                </div>
              </div>

              {/* Right — summary + info */}
              <div className="p-10 flex flex-col gap-8">

                {/* Booking summary */}
                <div>
                  <p className="font-josefin text-[0.58rem] tracking-[0.3em] uppercase text-gold mb-5">
                    Appointment Summary
                  </p>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: 'Service',  value: selectedService?.label ?? '—' },
                      { label: 'Date',     value: formattedDate || '—' },
                      { label: 'Time',     value: form.time || '—' },
                      { label: 'Name',     value: form.name || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-0.5 border-b border-gold/8 pb-4">
                        <p className="font-josefin text-[0.48rem] tracking-[0.2em] uppercase text-cream-muted/35">{label}</p>
                        <p className="font-dm text-sm text-cream/70">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

                {/* Location */}
                <div className="flex flex-col gap-3">
                  <p className="font-josefin text-[0.55rem] tracking-[0.25em] uppercase text-cream-muted/40">Location</p>
                  <p className="font-cormorant text-lg text-cream">Far East Plaza</p>
                  <p className="font-dm text-xs text-cream-muted/50 leading-relaxed">
                    14 Scotts Road, #02-85<br />Singapore 228213
                  </p>
                  <div className="w-6 h-px bg-gold/30" />
                  <p className="font-josefin text-[0.5rem] tracking-[0.2em] uppercase text-cream-muted/30 mt-1">Hours</p>
                  <p className="font-dm text-xs text-cream-muted/50">Mon – Sat: 11:00 AM – 8:00 PM</p>
                  <p className="font-dm text-xs text-cream-muted/50">Sunday: 12:00 PM – 6:00 PM</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

                {/* Prefer WhatsApp */}
                <div>
                  <p className="font-josefin text-[0.55rem] tracking-[0.25em] uppercase text-cream-muted/40 mb-3">Prefer to Message?</p>
                  <a
                    href="https://api.whatsapp.com/send?phone=6591462774"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 font-josefin text-[0.58rem] tracking-[0.2em] uppercase text-gold/60 hover:text-gold transition-colors duration-200"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                    WhatsApp Us
                  </a>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
