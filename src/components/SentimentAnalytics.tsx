'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Preferences', 'Revenue', 'AI Performance', 'Forecasting', 'Segmentation'] as const;
type Tab = (typeof TABS)[number];

// ─── Live data types (from Python-generated JSON) ─────────────────────────────

interface SentimentJSON {
  generated_at: string;
  descriptive: {
    total_reviews: number;
    average_rating: number;
    sentiment_distribution: Record<string, { count: number; pct: number }>;
    rating_distribution: Record<string, number>;
    monthly_review_counts: Record<string, number>;
    top_keywords: Record<string, number>;
  };
  diagnostic: {
    aspect_sentiment_scores: Record<string, number>;
    aspect_reviews: Record<string, {
      text: string; rating: number; sentiment: string;
      service_type: string; return_customer: boolean; date: string;
    }[]>;
    return_vs_new_comparison: {
      return_customers: { count: number; avg_rating: number; avg_sentiment: number };
      new_customers:    { count: number; avg_rating: number; avg_sentiment: number };
    };
    negative_review_drivers: Record<string, number>;
  };
  predictive: {
    classifier: { accuracy: number; confusion_matrix: number[][]; top_features: Record<string, number> };
    trend_projection: { slope: number; projected_next_3_months: number[]; direction: string };
  };
  prescriptive: {
    recommendations: { priority: string; area: string; finding: string; action: string; impact: string }[];
    priority_summary: { high: number; medium: number };
  };
}

// ─── Fallback / static data (used when JSON not yet generated) ────────────────

const FALLBACK_OVERVIEW_KPIS = [
  { label: 'Total Reviews',      value: '94',   sub: '+12 this month'    },
  { label: 'Average Rating',     value: '4.7★', sub: 'Out of 5.0'        },
  { label: 'Positive Sentiment', value: '82%',  sub: 'Via NLP analysis'  },
  { label: 'Net Promoter Score', value: '71',   sub: 'Industry avg: 52'  },
];

const FALLBACK_RATING_DIST = [
  { label: '5 Stars', pct: 65 },
  { label: '4 Stars', pct: 20 },
  { label: '3 Stars', pct: 10 },
  { label: '2 Stars', pct: 3  },
  { label: '1 Star',  pct: 2  },
];

const FALLBACK_SENTIMENT_DIST = [
  { label: 'Positive', pct: 82 },
  { label: 'Neutral',  pct: 12 },
  { label: 'Negative', pct: 6  },
];

const FALLBACK_MONTHLY = [
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

const FALLBACK_ASPECT_SENTIMENT = [
  { label: 'Customer Service', score: 94 },
  { label: 'Fit & Tailoring',  score: 92 },
  { label: 'Fabric Quality',   score: 88 },
  { label: 'Turnaround Time',  score: 76 },
  { label: 'Price & Value',    score: 71 },
];

const FALLBACK_PRESCRIPTIVE = [
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

// ─── Hook: load live analytics JSON ──────────────────────────────────────────

function useLiveAnalytics() {
  const [data, setData] = useState<SentimentJSON | null>(null);

  useEffect(() => {
    fetch('/data/sentiment-analytics.json')
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json) setData(json); })
      .catch(() => { /* file not yet generated — fall back to static data */ });
  }, []);

  // Derived display values (use live data if available, else fallbacks)
  const overviewKPIs = data ? [
    { label: 'Total Reviews',      value: String(data.descriptive.total_reviews), sub: '+12 this month' },
    { label: 'Average Rating',     value: `${data.descriptive.average_rating}★`,  sub: 'Out of 5.0' },
    { label: 'Positive Sentiment', value: `${data.descriptive.sentiment_distribution['Positive']?.pct ?? 0}%`, sub: 'Via NLP analysis' },
    { label: 'Net Promoter Score', value: '71', sub: 'Industry avg: 52' },
  ] : FALLBACK_OVERVIEW_KPIS;

  const ratingDist = data ? [
    { label: '5 Stars', pct: Math.round((data.descriptive.rating_distribution['5'] ?? 0) / data.descriptive.total_reviews * 100) },
    { label: '4 Stars', pct: Math.round((data.descriptive.rating_distribution['4'] ?? 0) / data.descriptive.total_reviews * 100) },
    { label: '3 Stars', pct: Math.round((data.descriptive.rating_distribution['3'] ?? 0) / data.descriptive.total_reviews * 100) },
    { label: '2 Stars', pct: Math.round((data.descriptive.rating_distribution['2'] ?? 0) / data.descriptive.total_reviews * 100) },
    { label: '1 Star',  pct: Math.round((data.descriptive.rating_distribution['1'] ?? 0) / data.descriptive.total_reviews * 100) },
  ] : FALLBACK_RATING_DIST;

  const sentimentDist = data ? (
    ['Positive', 'Neutral', 'Negative'].map(label => ({
      label,
      pct: data.descriptive.sentiment_distribution[label]?.pct ?? 0,
    }))
  ) : FALLBACK_SENTIMENT_DIST;

  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyReviews = data ? MONTH_LABELS.map((month, i) => {
    const key = `2025-${String(i + 1).padStart(2, '0')}`;
    return { month, count: data.descriptive.monthly_review_counts[key] ?? 0 };
  }) : FALLBACK_MONTHLY;

  const aspectSentiment = data ? (
    Object.entries(data.diagnostic.aspect_sentiment_scores).map(([label, score]) => ({
      label,
      score: Math.round(score * 100),
    }))
  ) : FALLBACK_ASPECT_SENTIMENT;

  const prescriptiveRecs = data ? data.prescriptive.recommendations.map(r => ({
    priority: r.priority,
    area:     r.area,
    insight:  r.finding,
    action:   r.action,
    impact:   r.impact,
  })) : FALLBACK_PRESCRIPTIVE;

  const classifierAccuracy = data ? Math.round(data.predictive.classifier.accuracy * 100) : null;
  const trendDirection     = data ? data.predictive.trend_projection.direction : null;
  const generatedAt        = data ? data.generated_at : null;

  const aspectReviews: Record<string, { text: string; rating: number; sentiment: string; service_type: string; return_customer: boolean; date: string }[]> =
    data?.diagnostic.aspect_reviews ?? {};

  const returnVsNew = data?.diagnostic.return_vs_new_comparison ?? null;

  return {
    live: !!data, generatedAt,
    overviewKPIs, ratingDist, sentimentDist, monthlyReviews, aspectSentiment, aspectReviews, prescriptiveRecs,
    classifierAccuracy, trendDirection, returnVsNew,
  };
}

// ─── Static data (not from reviews CSV — kept as-is) ─────────────────────────

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

// ─── Tab prop types ───────────────────────────────────────────────────────────

type KPI       = { label: string; value: string; sub: string };
type BarItem   = { label: string; pct: number };
type MonthItem = { month: string; count: number };
type AspectItem = { label: string; score: number };
type PrescItem = { priority: string; area: string; insight: string; action: string; impact: string };

// ─── Tab Panels ───────────────────────────────────────────────────────────────

function OverviewTab({ overviewKPIs, ratingDist, sentimentDist, monthlyReviews, live }: {
  overviewKPIs: KPI[]; ratingDist: BarItem[]; sentimentDist: BarItem[];
  monthlyReviews: MonthItem[]; live: boolean;
}) {
  const maxCount = Math.max(...monthlyReviews.map(d => d.count), 1);
  return (
    <div className="space-y-10">
      {live && (
        <p className="font-josefin text-[0.6rem] tracking-[0.2em] uppercase text-gold/40">
          Live — computed by Hugging Face NLP pipeline
        </p>
      )}
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
              <div key={m.month} className="relative flex-1 flex flex-col items-center gap-1.5 group">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10">
                  <div className="bg-obsidian border border-gold/30 px-2.5 py-1.5 whitespace-nowrap">
                    <p className="font-josefin text-[0.65rem] tracking-[0.15em] uppercase text-gold">{m.count} review{m.count !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="w-px h-1.5 bg-gold/30 mx-auto" />
                </div>
                <div className="w-full flex items-end" style={{ height: '5.5rem' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full bg-gold/30 group-hover:bg-gold/55 transition-colors border-t border-gold/50"
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

type AspectReview = { text: string; rating: number; sentiment: string; service_type: string; return_customer: boolean; date: string };

const SENTIMENT_FILTERS = ['All', 'Positive', 'Neutral', 'Negative'] as const;
type SentimentFilter = (typeof SENTIMENT_FILTERS)[number];

function AspectReviewDrillDown({ aspect, reviews }: { aspect: string; reviews: AspectReview[] }) {
  const [filter, setFilter] = useState<SentimentFilter>('All');

  const sentimentColour = (s: string) =>
    s === 'Positive' ? 'text-gold/80' : s === 'Negative' ? 'text-red-400/80' : 'text-cream-muted/50';

  const filterBtnClass = (f: SentimentFilter) => {
    const active = filter === f;
    const colour =
      f === 'Positive' ? (active ? 'border-gold/60 text-gold' : 'border-gold/20 text-gold/40 hover:border-gold/40 hover:text-gold/60') :
      f === 'Negative' ? (active ? 'border-red-400/60 text-red-400' : 'border-red-400/20 text-red-400/40 hover:border-red-400/40 hover:text-red-400/60') :
      f === 'Neutral'  ? (active ? 'border-cream-muted/50 text-cream-muted' : 'border-cream-muted/20 text-cream-muted/40 hover:border-cream-muted/40 hover:text-cream-muted/60') :
                         (active ? 'border-gold/40 text-cream' : 'border-gold/10 text-cream-muted/40 hover:border-gold/20 hover:text-cream-muted/60');
    return `font-josefin text-[0.6rem] tracking-[0.15em] uppercase border px-3 py-1.5 transition-colors ${colour}`;
  };

  const counts = {
    Positive: reviews.filter(r => r.sentiment === 'Positive').length,
    Neutral:  reviews.filter(r => r.sentiment === 'Neutral').length,
    Negative: reviews.filter(r => r.sentiment === 'Negative').length,
  };

  const visible = filter === 'All' ? reviews : reviews.filter(r => r.sentiment === filter);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-4 border-t border-gold/10 pt-4 space-y-4">
        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {SENTIMENT_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={filterBtnClass(f)}>
              {f}{f !== 'All' ? ` (${counts[f as keyof typeof counts]})` : ` (${reviews.length})`}
            </button>
          ))}
        </div>

        {/* Review list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {visible.length === 0 ? (
              <p className="font-dm text-sm text-cream-muted/30">No {filter.toLowerCase()} reviews for this aspect.</p>
            ) : (
              visible.map((r, i) => (
                <div key={i} className="border border-gold/8 bg-obsidian p-4 space-y-2">
                  <p className="font-dm text-sm text-cream/80 leading-relaxed">"{r.text}"</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-josefin text-[0.65rem] tracking-[0.15em] uppercase text-gold/50">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                    <span className={`font-josefin text-[0.65rem] tracking-[0.15em] uppercase ${sentimentColour(r.sentiment)}`}>
                      {r.sentiment}
                    </span>
                    <span className="font-dm text-xs text-cream-muted/35">{r.service_type}</span>
                    <span className="font-dm text-xs text-cream-muted/25">{r.date}</span>
                    {r.return_customer && (
                      <span className="font-josefin text-[0.6rem] tracking-[0.15em] uppercase text-gold/30">
                        Returning client
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function PreferencesTab({ aspectSentiment, aspectReviews }: {
  aspectSentiment: AspectItem[];
  aspectReviews: Record<string, AspectReview[]>;
}) {
  const [openAspect, setOpenAspect] = useState<string | null>(null);

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
        <p className="font-dm text-sm text-cream-muted/35 mb-6">
          Click any aspect to view the reviews behind the score.
        </p>
        <div className="space-y-2">
          {aspectSentiment.map((a, i) => {
            const reviews = aspectReviews[a.label] ?? [];
            const isOpen = openAspect === a.label;
            return (
              <div key={a.label} className="border border-gold/8 bg-obsidian">
                <button
                  onClick={() => setOpenAspect(isOpen ? null : a.label)}
                  className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gold/5 transition-colors text-left"
                >
                  <span className="font-dm text-sm text-cream-muted/50 w-36 shrink-0 text-right leading-tight">
                    {a.label}
                  </span>
                  <Bar pct={a.score} delay={i * 0.08} dim={a.score < 80} />
                  <span className="font-josefin text-xs text-gold/70 w-10 text-right">{a.score}%</span>
                  <span className="font-josefin text-[0.6rem] tracking-[0.1em] uppercase text-cream-muted/25 w-16 text-right shrink-0">
                    {reviews.length > 0 ? `${reviews.length} reviews` : '—'}
                  </span>
                  <span className="text-gold/30 text-xs shrink-0">{isOpen ? '▲' : '▼'}</span>
                </button>
                <AnimatePresence>
                  {isOpen && reviews.length > 0 && (
                    <div className="px-4 pb-4">
                      <AspectReviewDrillDown aspect={a.label} reviews={reviews} />
                    </div>
                  )}
                  {isOpen && reviews.length === 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="px-4 pb-4 font-dm text-sm text-cream-muted/30"
                    >
                      No reviews available — run sentiment_analysis.py to generate data.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
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
          { label: 'Top Recommended Style',    value: 'Classic Navy', sub: 'Most accepted across all occasions'   },
          { label: 'Top Recommended Colour',   value: 'Navy',         sub: '34% of all AI outfit suggestions'     },
          { label: 'Budget Optimiser Savings', value: 'Avg $312',     sub: 'Saved per session vs initial request' },
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
          { label: 'Q1 2026 Projection', value: '$106.6k', sub: '+12% vs Q1 2025' },
          { label: 'Q2 2026 Projection', value: '$160.5k', sub: '+12% vs Q2 2025 — Peak season' },
          { label: 'FY 2026 Forecast',   value: '$546k',   sub: '+12% YoY growth rate' },
        ].map(c => <StatCard key={c.label} {...c} />)}
      </div>
    </div>
  );
}

type ReturnVsNew = {
  return_customers: { count: number; avg_rating: number; avg_sentiment: number };
  new_customers:    { count: number; avg_rating: number; avg_sentiment: number };
};

function SegmentationTab({ prescriptiveRecs, returnVsNew }: { prescriptiveRecs: PrescItem[]; returnVsNew: ReturnVsNew | null }) {
  return (
    <div className="space-y-10">

      {/* Return vs New Customer — live data */}
      {returnVsNew && (
        <div className="border border-gold/10 bg-obsidian-50/80 p-8">
          <SectionHead title="Return vs New Customer" />
          <div className="grid lg:grid-cols-2 gap-6">
            {([
              { label: 'Returning Clients', data: returnVsNew.return_customers },
              { label: 'New Clients',       data: returnVsNew.new_customers    },
            ] as const).map(({ label, data }) => (
              <div key={label} className="border border-gold/10 bg-obsidian p-6 space-y-5">
                <p className="font-josefin text-[0.7rem] tracking-[0.2em] uppercase text-gold/60">{label}</p>
                <p className="font-cormorant text-5xl font-light text-cream">{data.count}
                  <span className="font-dm text-sm text-cream-muted/40 ml-2">clients</span>
                </p>
                <div className="space-y-3 pt-2 border-t border-gold/10">
                  {[
                    { k: 'Avg Rating',    v: `${data.avg_rating} ★` },
                    { k: 'Avg Sentiment', v: `${Math.round(data.avg_sentiment * 100)}%` },
                  ].map(row => (
                    <div key={row.k} className="flex justify-between items-center">
                      <span className="font-josefin text-xs tracking-[0.15em] uppercase text-cream-muted/35">{row.k}</span>
                      <span className="font-josefin text-xs text-gold/70">{row.v}</span>
                    </div>
                  ))}
                  {/* Sentiment bar */}
                  <div className="pt-1">
                    <Bar pct={Math.round(data.avg_sentiment * 100)} dim={data.avg_sentiment < 0.8} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="font-dm text-sm text-cream-muted/30 mt-4">
            Computed from {returnVsNew.return_customers.count + returnVsNew.new_customers.count} reviews via Hugging Face sentiment pipeline.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {segments.map(s => (
          <div key={s.label} className="border border-gold/10 bg-obsidian-50/80 p-6">
            <p className="font-josefin text-[0.68rem] tracking-[0.2em] uppercase text-gold/55 mb-1">{s.label}</p>
            <p className="font-dm text-[0.58rem] text-cream-muted/40 mb-4">{s.range}</p>
            <p className="font-cormorant text-4xl font-light text-cream mb-1">{s.pct}%</p>
            <p className="font-dm text-sm text-cream-muted/35">of client base</p>
            <div className="mt-4 pt-4 border-t border-gold/10 space-y-2">
              {[
                { k: 'Avg Spend', v: s.avgSpend        },
                { k: 'Retention', v: `${s.retention}%` },
                { k: 'NPS',       v: `${s.nps}`        },
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
          {prescriptiveRecs.map(r => (
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
  const analytics = useLiveAnalytics();

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
            {activeTab === 'Overview'       && (
              <OverviewTab
                overviewKPIs={analytics.overviewKPIs}
                ratingDist={analytics.ratingDist}
                sentimentDist={analytics.sentimentDist}
                monthlyReviews={analytics.monthlyReviews}
                live={analytics.live}
              />
            )}
            {activeTab === 'Preferences'    && <PreferencesTab aspectSentiment={analytics.aspectSentiment} aspectReviews={analytics.aspectReviews} />}
            {activeTab === 'Revenue'        && <RevenueTab />}
            {activeTab === 'AI Performance' && <AIPerformanceTab />}
            {activeTab === 'Forecasting'    && <ForecastingTab />}
            {activeTab === 'Segmentation'   && <SegmentationTab prescriptiveRecs={analytics.prescriptiveRecs} returnVsNew={analytics.returnVsNew} />}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
}
