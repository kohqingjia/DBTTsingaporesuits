'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Preferences', 'Revenue', 'AI Performance', 'Forecasting', 'Segmentation'] as const;
type Tab = (typeof TABS)[number];

// ─── Hardcoded Analytics Data ─────────────────────────────────────────────────

const overviewKPIs = [
  { label: 'Total Reviews',      value: '94',   sub: '+12 this month'    },
  { label: 'Average Rating',     value: '4.7★', sub: 'Out of 5.0'        },
  { label: 'Positive Sentiment', value: '82%',  sub: 'Via NLP analysis'  },
  { label: 'Net Promoter Score', value: '71',   sub: 'Industry avg: 52'  },
];

const ratingDist = [
  { label: '5 Stars', pct: 65 },
  { label: '4 Stars', pct: 20 },
  { label: '3 Stars', pct: 10 },
  { label: '2 Stars', pct: 3  },
  { label: '1 Star',  pct: 2  },
];

const sentimentDist = [
  { label: 'Positive', pct: 82 },
  { label: 'Neutral',  pct: 12 },
  { label: 'Negative', pct: 6  },
];

const monthlyReviews = [
  { month: 'Jan', count: 5  },
  { month: 'Feb', count: 6  },
  { month: 'Mar', count: 7  },
  { month: 'Apr', count: 10 },
  { month: 'May', count: 11 },
  { month: 'Jun', count: 12 },
  { month: 'Jul', count: 8  },
  { month: 'Aug', count: 9  },
  { month: 'Sep', count: 10 },
  { month: 'Oct', count: 7  },
  { month: 'Nov', count: 8  },
  { month: 'Dec', count: 11 },
];

const occasionDemand = [
  { label: 'Wedding',       pct: 38 },
  { label: 'Corporate',     pct: 31 },
  { label: 'Black Tie',     pct: 16 },
  { label: 'Smart Casual',  pct: 10 },
  { label: 'Special Event', pct: 5  },
];

const stylePrefs = [
  { label: 'Classic', pct: 45 },
  { label: 'Modern',  pct: 32 },
  { label: 'Bold',    pct: 23 },
];

const colourPrefs = [
  { label: 'Navy',     hex: '#1B2A4A', pct: 34 },
  { label: 'Charcoal', hex: '#36454F', pct: 28 },
  { label: 'Black',    hex: '#1C1C1C', pct: 18 },
  { label: 'Mid Grey', hex: '#6B7280', pct: 12 },
  { label: 'Tan',      hex: '#C49A6C', pct: 8  },
];

const aspectSentiment = [
  { label: 'Customer Service', score: 94 },
  { label: 'Fit & Tailoring',  score: 92 },
  { label: 'Fabric Quality',   score: 88 },
  { label: 'Turnaround Time',  score: 76 },
  { label: 'Price & Value',    score: 71 },
];

const revenueKPIs = [
  { label: 'YTD Revenue',     value: '$487,200', sub: '2025 to date'        },
  { label: 'Avg Order Value', value: '$1,562',   sub: '+$210 vs prior year' },
  { label: 'Total Orders',    value: '312',      sub: 'Bespoke commissions' },
  { label: 'Repeat Rate',     value: '64%',      sub: 'Returning clients'   },
];

const monthlyRevenue = [
  { month: 'Jan', value: 28400 },
  { month: 'Feb', value: 31200 },
  { month: 'Mar', value: 35600 },
  { month: 'Apr', value: 42100 },
  { month: 'May', value: 48900 },
  { month: 'Jun', value: 52300 },
  { month: 'Jul', value: 38700 },
  { month: 'Aug', value: 41200 },
  { month: 'Sep', value: 44800 },
  { month: 'Oct', value: 39600 },
  { month: 'Nov', value: 46200 },
  { month: 'Dec', value: 61800 },
];

const serviceBreakdown = [
  { label: 'Wedding Suit',   pct: 38, revenue: '$185,100' },
  { label: 'Business Suit',  pct: 31, revenue: '$151,000' },
  { label: 'Formal Evening', pct: 16, revenue: '$77,950'  },
  { label: 'Casual Blazer',  pct: 10, revenue: '$48,720'  },
  { label: 'Alterations',    pct: 5,  revenue: '$24,360'  },
];

const aiKPIs = [
  { label: 'Recommendation Acceptance', value: '73%', sub: 'Users who acted on AI suggestion'   },
  { label: 'Avg Match Score',           value: '87%', sub: 'GPT-assessed outfit confidence'     },
  { label: 'Colour Analysis Accuracy',  value: '89%', sub: 'Vision API vs tailor verification'  },
  { label: 'Budget Optimiser Usage',    value: '64%', sub: 'Sessions using the budget tool'     },
];

const aiByOccasion = [
  { label: 'Wedding',       acceptance: 91, match: 92 },
  { label: 'Black Tie',     acceptance: 88, match: 89 },
  { label: 'Corporate',     acceptance: 79, match: 85 },
  { label: 'Smart Casual',  acceptance: 61, match: 78 },
  { label: 'Special Event', acceptance: 55, match: 74 },
];

const quarterlyData = [
  { period: 'Q1 2025', value: 95200,  projected: false, growth: ''    },
  { period: 'Q2 2025', value: 143300, projected: false, growth: ''    },
  { period: 'Q3 2025', value: 124700, projected: false, growth: ''    },
  { period: 'Q4 2025', value: 124000, projected: false, growth: ''    },
  { period: 'Q1 2026', value: 106600, projected: true,  growth: '+12%'},
  { period: 'Q2 2026', value: 160500, projected: true,  growth: '+12%'},
];

const peakPeriods = [
  { period: 'April – June',   driver: 'Wedding Season',    lift: '+34%', positive: true  },
  { period: 'Nov – December', driver: 'Festive & Year-End', lift: '+28%', positive: true  },
  { period: 'January',        driver: 'CNY Gifting',       lift: '+14%', positive: true  },
  { period: 'July – August',  driver: 'Summer Lull',       lift: '−18%', positive: false },
];

const segments = [
  { label: 'Luxury',    range: '> $3,000',       pct: 9,  avgSpend: '$4,800', retention: 91, nps: 84 },
  { label: 'Premium',   range: '$1,500 – $3,000', pct: 28, avgSpend: '$2,100', retention: 78, nps: 74 },
  { label: 'Mid-Range', range: '$500 – $1,500',   pct: 45, avgSpend: '$920',   retention: 61, nps: 62 },
  { label: 'Budget',    range: '< $500',           pct: 18, avgSpend: '$340',   retention: 39, nps: 41 },
];

const prescriptive = [
  {
    priority: 'High',
    area: 'Delivery Time Optimisation',
    insight: 'Wedding suit reviews score 18% lower on turnaround time than all other service types.',
    action: 'Add a 2-week buffer to wedding timelines and introduce milestone SMS updates at each stage.',
    impact: '+11% projected sentiment improvement',
  },
  {
    priority: 'High',
    area: 'Loyalty Programme',
    insight: 'Returning clients show 12% higher average sentiment and spend 2.3× more per order.',
    action: 'Launch a tiered loyalty scheme with priority booking access and exclusive fabric preview events.',
    impact: '+18% projected retention uplift',
  },
  {
    priority: 'Medium',
    area: 'Fabric Quality Marketing',
    insight: 'Fabric quality is the #1 keyword driver of 5-star reviews, cited in 78% of top-rated feedback.',
    action: 'Feature Italian mill provenance and fabric specs prominently in AI stylist output and atelier materials.',
    impact: '+9% projected upsell conversion',
  },
  {
    priority: 'Medium',
    area: 'Budget Segment Conversion',
    insight: 'Budget segment has 39% retention — lowest across all tiers — primarily a perceived value gap.',
    action: 'Introduce a clearly positioned "Essentials" line with transparent entry-level bespoke pricing.',
    impact: '+22% projected segment upgrade rate',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHead({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="w-6 h-px bg-gold/40 shrink-0" />
      <p className="font-josefin text-[0.7rem] tracking-[0.25em] uppercase text-gold/60">{title}</p>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-gold/10 bg-obsidian-50/80 backdrop-blur-sm p-6">
      <p className="font-josefin text-[0.7rem] tracking-[0.2em] uppercase text-gold/50 mb-3">{label}</p>
      <p className="font-cormorant text-4xl font-light text-cream mb-2">{value}</p>
      <p className="font-dm text-sm text-cream-muted/40">{sub}</p>
    </div>
  );
}

function Bar({ pct, delay = 0, dim = false }: { pct: number; delay?: number; dim?: boolean }) {
  return (
    <div className="flex-1 h-[2px] bg-smoke overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        className={`h-full ${dim ? 'bg-gold/45' : 'bg-gold'}`}
      />
    </div>
  );
}

function HBarRow({
  label, pct, delay = 0, dim = false, extra,
}: {
  label: string; pct: number; delay?: number; dim?: boolean; extra?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-dm text-sm text-cream-muted/50 w-36 shrink-0 text-right leading-tight">{label}</span>
      <Bar pct={pct} delay={delay} dim={dim} />
      <span className="font-josefin text-xs tracking-[0.05em] text-gold/70 w-10 text-right">{pct}%</span>
      {extra && <span className="font-dm text-sm text-cream-muted/40 w-20">{extra}</span>}
    </div>
  );
}

function VBarChart({ data, valueFormat }: {
  data: { month: string; value: number }[];
  valueFormat: (v: number) => string;
}) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5" style={{ height: '10rem' }}>
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="font-josefin text-xs text-gold/50 leading-none">{valueFormat(d.value)}</span>
            <div className="w-full flex items-end" style={{ height: '7rem' }}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.8, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="w-full bg-gold/30 hover:bg-gold/55 transition-colors border-t border-gold/50"
              />
            </div>
            <span className="font-josefin text-xs text-cream-muted/30">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function OverviewTab() {
  const maxCount = Math.max(...monthlyReviews.map(d => d.count));
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewKPIs.map(k => <StatCard key={k.label} {...k} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="border border-gold/10 bg-obsidian-50/80 p-8">
          <SectionHead title="Rating Distribution" />
          <div className="space-y-4">
            {ratingDist.map((r, i) => <HBarRow key={r.label} label={r.label} pct={r.pct} delay={i * 0.08} />)}
          </div>
        </div>

        <div className="border border-gold/10 bg-obsidian-50/80 p-8">
          <SectionHead title="Sentiment Classification" />
          <div className="space-y-4">
            {sentimentDist.map((s, i) => <HBarRow key={s.label} label={s.label} pct={s.pct} delay={i * 0.1} />)}
          </div>
          <div className="mt-8 border border-gold/10 bg-obsidian p-4">
            <p className="font-josefin text-[0.65rem] tracking-[0.2em] uppercase text-gold/40 mb-1.5">Model</p>
            <p className="font-dm text-[0.65rem] text-cream-muted/50">
              distilbert-base-uncased-finetuned-sst-2-english · Hugging Face Transformers
            </p>
          </div>
        </div>
      </div>

      <div className="border border-gold/10 bg-obsidian-50/80 p-8">
        <SectionHead title="Monthly Review Volume — 2025" />
        <div className="flex items-end gap-1.5" style={{ height: '8rem' }}>
          {monthlyReviews.map((m, i) => {
            const heightPct = (m.count / maxCount) * 100;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end" style={{ height: '5.5rem' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full bg-gold/30 hover:bg-gold/55 transition-colors border-t border-gold/50"
                  />
                </div>
                <span className="font-josefin text-xs text-cream-muted/30">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PreferencesTab() {
  return (
    <div className="space-y-10">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="border border-gold/10 bg-obsidian-50/80 p-8">
          <SectionHead title="Occasion Demand" />
          <div className="space-y-4">
            {occasionDemand.map((o, i) => <HBarRow key={o.label} label={o.label} pct={o.pct} delay={i * 0.08} />)}
          </div>
        </div>

        <div className="border border-gold/10 bg-obsidian-50/80 p-8">
          <SectionHead title="Style Preferences" />
          <div className="space-y-4">
            {stylePrefs.map((s, i) => <HBarRow key={s.label} label={s.label} pct={s.pct} delay={i * 0.1} />)}
          </div>
        </div>
      </div>

      <div className="border border-gold/10 bg-obsidian-50/80 p-8">
        <SectionHead title="Colour Preferences" />
        <div className="space-y-4">
          {colourPrefs.map((c, i) => (
            <div key={c.label} className="flex items-center gap-4">
              <div
                className="w-3.5 h-3.5 shrink-0 border border-white/10"
                style={{ backgroundColor: c.hex }}
              />
              <span className="font-dm text-sm text-cream-muted/50 w-24 shrink-0">{c.label}</span>
              <Bar pct={c.pct} delay={i * 0.08} />
              <span className="font-josefin text-xs text-gold/70 w-10 text-right">{c.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gold/10 bg-obsidian-50/80 p-8">
        <SectionHead title="Aspect-Based Sentiment Score" />
        <div className="space-y-4">
          {aspectSentiment.map((a, i) => (
            <HBarRow
              key={a.label}
              label={a.label}
              pct={a.score}
              delay={i * 0.08}
              dim={a.score < 80}
            />
          ))}
        </div>
        <p className="font-dm text-sm text-cream-muted/35 mt-6">
          Computed via keyword-matching against five business dimensions, then scored with the sentiment pipeline.
        </p>
      </div>
    </div>
  );
}

function RevenueTab() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueKPIs.map(k => <StatCard key={k.label} {...k} />)}
      </div>

      <div className="border border-gold/10 bg-obsidian-50/80 p-8">
        <SectionHead title="Monthly Revenue — 2025 (SGD)" />
        <VBarChart
          data={monthlyRevenue}
          valueFormat={v => `$${(v / 1000).toFixed(0)}k`}
        />
      </div>

      <div className="border border-gold/10 bg-obsidian-50/80 p-8">
        <SectionHead title="Revenue by Service Type" />
        <div className="space-y-5">
          {serviceBreakdown.map((s, i) => (
            <HBarRow
              key={s.label}
              label={s.label}
              pct={s.pct}
              delay={i * 0.08}
              extra={s.revenue}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AIPerformanceTab() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {aiKPIs.map(k => <StatCard key={k.label} {...k} />)}
      </div>

      <div className="border border-gold/10 bg-obsidian-50/80 p-8">
        <SectionHead title="Recommendation Performance by Occasion" />
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <p className="font-josefin text-[0.68rem] tracking-[0.2em] uppercase text-gold/40 mb-5">
              Acceptance Rate
            </p>
            <div className="space-y-4">
              {aiByOccasion.map((a, i) => (
                <HBarRow key={a.label} label={a.label} pct={a.acceptance} delay={i * 0.08} />
              ))}
            </div>
          </div>
          <div>
            <p className="font-josefin text-[0.68rem] tracking-[0.2em] uppercase text-gold/40 mb-5">
              Avg Match Score
            </p>
            <div className="space-y-4">
              {aiByOccasion.map((a, i) => (
                <div key={a.label} className="flex items-center gap-4">
                  <Bar pct={a.match} delay={i * 0.08} dim />
                  <span className="font-josefin text-xs text-gold/70 w-10 text-right">{a.match}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { label: 'Top Recommended Style',   value: 'Classic Navy',    sub: 'Most accepted across all occasions'   },
          { label: 'Top Recommended Colour',  value: 'Navy',            sub: '34% of all AI outfit suggestions'     },
          { label: 'Budget Optimiser Savings', value: 'Avg $312',       sub: 'Saved per session vs initial request' },
        ].map(c => <StatCard key={c.label} {...c} />)}
      </div>
    </div>
  );
}

function ForecastingTab() {
  const maxQ = Math.max(...quarterlyData.map(q => q.value));
  return (
    <div className="space-y-10">
      <div className="border border-gold/10 bg-obsidian-50/80 p-8">
        <SectionHead title="Quarterly Revenue — Actual vs Projected (SGD)" />
        <div className="flex items-end gap-4" style={{ height: '13rem' }}>
          {quarterlyData.map((q, i) => {
            const heightPct = (q.value / maxQ) * 100;
            return (
              <div key={q.period} className="flex-1 flex flex-col items-center gap-2">
                <span className={`font-josefin text-xs tracking-[0.1em] leading-none ${q.projected ? 'text-gold/70' : 'text-gold/50'}`}>
                  {q.projected ? q.growth : `$${(q.value / 1000).toFixed(0)}k`}
                </span>
                <div className="w-full flex items-end" style={{ height: '9rem' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.9, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={`w-full border-t transition-colors ${
                      q.projected
                        ? 'bg-gold/12 border-gold/40'
                        : 'bg-gold/35 border-gold/60'
                    }`}
                    style={q.projected ? { backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(197,162,48,0.08) 4px, rgba(197,162,48,0.08) 8px)' } : {}}
                  />
                </div>
                <span className="font-josefin text-xs text-cream-muted/40 text-center">{q.period}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-8 mt-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-[2px] bg-gold/50" />
            <span className="font-josefin text-xs tracking-[0.15em] uppercase text-cream-muted/40">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-[2px] border-t border-dashed border-gold/40" />
            <span className="font-josefin text-xs tracking-[0.15em] uppercase text-cream-muted/40">Projected (Linear Regression)</span>
          </div>
        </div>
      </div>

      <div className="border border-gold/10 bg-obsidian-50/80 p-8">
        <SectionHead title="Seasonal Demand Patterns" />
        <div className="grid grid-cols-2 gap-4">
          {peakPeriods.map(p => (
            <div
              key={p.period}
              className={`border p-5 ${p.positive ? 'border-gold/20 bg-gold/5' : 'border-smoke'}`}
            >
              <p className="font-josefin text-[0.68rem] tracking-[0.2em] uppercase text-gold/50 mb-2">{p.period}</p>
              <p className="font-cormorant text-xl text-cream mb-2">{p.driver}</p>
              <p className={`font-josefin text-sm font-light ${p.positive ? 'text-gold' : 'text-red-400/70'}`}>
                {p.lift} vs monthly average
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {[
          { label: 'Q1 2026 Projection',     value: '$106.6k', sub: '+12% vs Q1 2025' },
          { label: 'Q2 2026 Projection',     value: '$160.5k', sub: '+12% vs Q2 2025 — Peak season' },
          { label: 'FY 2026 Forecast',       value: '$546k',   sub: '+12% YoY growth rate' },
        ].map(c => <StatCard key={c.label} {...c} />)}
      </div>
    </div>
  );
}

function SegmentationTab() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.map(s => (
          <div key={s.label} className="border border-gold/10 bg-obsidian-50/80 p-6">
            <p className="font-josefin text-[0.68rem] tracking-[0.2em] uppercase text-gold/55 mb-1">{s.label}</p>
            <p className="font-dm text-[0.58rem] text-cream-muted/40 mb-4">{s.range}</p>
            <p className="font-cormorant text-4xl font-light text-cream mb-1">{s.pct}%</p>
            <p className="font-dm text-sm text-cream-muted/35">of client base</p>
            <div className="mt-4 pt-4 border-t border-gold/10 space-y-2">
              {[
                { k: 'Avg Spend',   v: s.avgSpend         },
                { k: 'Retention',   v: `${s.retention}%`  },
                { k: 'NPS',         v: `${s.nps}`         },
              ].map(row => (
                <div key={row.k} className="flex justify-between items-center">
                  <span className="font-josefin text-xs tracking-[0.15em] uppercase text-cream-muted/35">{row.k}</span>
                  <span className="font-josefin text-xs text-gold/60">{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border border-gold/10 bg-obsidian-50/80 p-8">
        <SectionHead title="Segment Distribution & Retention" />
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <p className="font-josefin text-[0.68rem] tracking-[0.2em] uppercase text-gold/40 mb-5">Share of Client Base</p>
            <div className="space-y-4">
              {segments.map((s, i) => <HBarRow key={s.label} label={s.label} pct={s.pct} delay={i * 0.1} />)}
            </div>
          </div>
          <div>
            <p className="font-josefin text-[0.68rem] tracking-[0.2em] uppercase text-gold/40 mb-5">Retention Rate</p>
            <div className="space-y-4">
              {segments.map((s, i) => (
                <div key={s.label} className="flex items-center gap-4">
                  <Bar pct={s.retention} delay={i * 0.1} dim={s.retention < 60} />
                  <span className="font-josefin text-xs text-gold/70 w-10 text-right">{s.retention}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <SectionHead title="Prescriptive Recommendations" />
        <div className="grid lg:grid-cols-2 gap-4">
          {prescriptive.map(r => (
            <div key={r.area} className="border border-gold/10 bg-obsidian-50/80 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <p className="font-josefin text-[0.7rem] tracking-[0.2em] uppercase text-gold/60">{r.area}</p>
                <span className={`shrink-0 font-josefin text-xs tracking-[0.15em] uppercase px-2.5 py-1 border
                  ${r.priority === 'High'
                    ? 'border-gold/40 text-gold bg-gold/5'
                    : 'border-smoke text-cream-muted/40'
                  }`}>
                  {r.priority}
                </span>
              </div>
              <p className="font-dm text-sm text-cream-muted/55 italic mb-3 border-l-2 border-gold/30 pl-4 leading-relaxed">
                {r.insight}
              </p>
              <p className="font-dm text-sm text-cream-muted/55 mb-4 leading-relaxed">{r.action}</p>
              <div className="flex items-center gap-3">
                <span className="w-4 h-px bg-gold/40" />
                <span className="font-josefin text-xs tracking-[0.15em] uppercase text-gold/55">{r.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function SentimentAnalytics() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (d: number) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.8, delay: d, ease: [0.16, 1, 0.3, 1] as number[] },
    }),
  };

  return (
    <section ref={ref} id="analytics" className="bg-obsidian py-28 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-8">

        {/* ── Header ── */}
        <div className="grid lg:grid-cols-2 gap-16 mb-16 items-end">
          <div>
            <motion.p
              custom={0.1} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
              className="section-label mb-5"
            >
              Analytics Intelligence
            </motion.p>
            <motion.h2
              custom={0.2} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
              className="font-cormorant text-5xl md:text-6xl font-light text-cream leading-tight"
            >
              Insights from Our <em className="italic text-gold">Clientele</em>
            </motion.h2>
          </div>
          <motion.p
            custom={0.35} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="font-dm text-base text-cream-muted/55 leading-relaxed"
          >
            A data-driven analytics system providing actionable insights to optimise customer experience,
            operations, and business performance — powered by Hugging Face NLP and scikit-learn predictive models.
          </motion.p>
        </div>

        {/* ── Tab navigation ── */}
        <motion.div
          custom={0.4} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="flex flex-wrap gap-0 mb-12 border-b border-gold/10"
        >
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-josefin text-[0.72rem] tracking-[0.2em] uppercase px-5 py-3.5 border-b-2 transition-all duration-300
                ${activeTab === tab
                  ? 'border-gold text-gold'
                  : 'border-transparent text-cream-muted/35 hover:text-cream-muted/65 hover:border-gold/25'
                }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'Overview'       && <OverviewTab />}
            {activeTab === 'Preferences'    && <PreferencesTab />}
            {activeTab === 'Revenue'        && <RevenueTab />}
            {activeTab === 'AI Performance' && <AIPerformanceTab />}
            {activeTab === 'Forecasting'    && <ForecastingTab />}
            {activeTab === 'Segmentation'   && <SegmentationTab />}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
