'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
interface Measurements {
  chest: number; waist: number; hips: number; shoulder: number;
  sleeveLength: number; jacketLength: number; inseam: number; neck: number; thigh: number;
}

type Phase = 'idle' | 'rotating' | 'sweeping' | 'processing' | 'complete';

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const MOCK_MEASUREMENTS: Measurements = {
  chest: 38.5, waist: 32.0, hips: 39.0, shoulder: 17.5,
  sleeveLength: 25.0, jacketLength: 30.5, inseam: 31.0, neck: 15.5, thigh: 22.0,
};

const MEASUREMENT_LABELS: { key: keyof Measurements; label: string; unit: string }[] = [
  { key: 'chest',        label: 'Chest',          unit: 'in' },
  { key: 'waist',        label: 'Waist',          unit: 'in' },
  { key: 'hips',         label: 'Hips',           unit: 'in' },
  { key: 'shoulder',     label: 'Shoulder Width', unit: 'in' },
  { key: 'sleeveLength', label: 'Sleeve Length',  unit: 'in' },
  { key: 'jacketLength', label: 'Jacket Length',  unit: 'in' },
  { key: 'inseam',       label: 'Inseam',         unit: 'in' },
  { key: 'neck',         label: 'Neck',           unit: 'in' },
  { key: 'thigh',        label: 'Thigh',          unit: 'in' },
];

// Dot positions on front-view figure (% of container)
const DOT_POSITIONS: Record<keyof Measurements, { x: number; y: number }> = {
  neck:         { x: 50, y: 11 },
  shoulder:     { x: 50, y: 20 },
  chest:        { x: 50, y: 29 },
  waist:        { x: 50, y: 43 },
  hips:         { x: 50, y: 54 },
  sleeveLength: { x: 22, y: 44 },
  jacketLength: { x: 75, y: 41 },
  inseam:       { x: 44, y: 74 },
  thigh:        { x: 40, y: 62 },
};

// Capture stops: angle in degrees + label
const CAPTURE_STOPS = [
  { angle: 0,   label: 'Front profile',       angleName: '0°'   },
  { angle: 90,  label: 'Right side profile',  angleName: '90°'  },
  { angle: 180, label: 'Rear profile',        angleName: '180°' },
  { angle: 270, label: 'Left side profile',   angleName: '270°' },
];

const ROTATION_DURATION = 900;  // ms to rotate between stops
const SWEEP_DURATION    = 2400; // ms for one laser sweep

/* ─────────────────────────────────────────────────────────────
   SVG BODY — FRONT VIEW
───────────────────────────────────────────────────────────── */
function FrontBody() {
  return (
    <>
      {/* head */}
      <ellipse cx="100" cy="28" rx="18" ry="22" fill="none" stroke="rgba(197,162,48,0.5)" strokeWidth="1.2" />
      {/* neck */}
      <path d="M92,49 L92,58 L108,58 L108,49" fill="none" stroke="rgba(197,162,48,0.4)" strokeWidth="1" />
      {/* torso */}
      <path
        d="M72,58 C60,62 52,70 50,82 C48,95 52,108 55,118 C58,128 60,132 60,140
           L62,210 C62,214 64,216 68,216 L80,216 C84,216 86,213 86,210
           L84,165 C86,163 90,162 94,162
           L94,290 C94,295 96,297 100,297
           L100,297 C104,297 106,295 106,290
           L106,162 C110,162 114,163 116,165
           L114,210 C114,213 116,216 120,216 L132,216 C136,216 138,214 138,210
           L140,140 C140,132 142,128 145,118 C148,108 152,95 150,82
           C148,70 140,62 128,58 Z"
        fill="none" stroke="rgba(197,162,48,0.45)" strokeWidth="1.2"
      />
      {/* left arm */}
      <path
        d="M72,58 C62,65 50,78 44,96 C40,108 40,118 42,128
           C44,136 48,142 50,148 L56,170 C56,173 58,174 60,172
           L64,148 C66,142 66,132 66,122 C66,110 68,98 72,90 L76,76"
        fill="none" stroke="rgba(197,162,48,0.4)" strokeWidth="1"
      />
      {/* right arm */}
      <path
        d="M128,58 C138,65 150,78 156,96 C160,108 160,118 158,128
           C156,136 152,142 150,148 L144,170 C144,173 142,174 140,172
           L136,148 C134,142 134,132 134,122 C134,110 132,98 128,90 L124,76"
        fill="none" stroke="rgba(197,162,48,0.4)" strokeWidth="1"
      />
      {/* left leg lower */}
      <path d="M94,290 C90,298 88,310 88,322 L90,360 C90,363 93,365 96,363 L100,355"
        fill="none" stroke="rgba(197,162,48,0.35)" strokeWidth="1" />
      {/* right leg lower */}
      <path d="M106,290 C110,298 112,310 112,322 L110,360 C110,363 107,365 104,363 L100,355"
        fill="none" stroke="rgba(197,162,48,0.35)" strokeWidth="1" />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SVG BODY — SIDE VIEW (right-facing profile)
───────────────────────────────────────────────────────────── */
function SideBody() {
  return (
    <>
      {/* head - profile */}
      <path
        d="M108,10 C120,10 130,18 132,28 C134,38 130,46 124,50
           C118,54 112,54 108,52 L104,50 C98,52 96,58 96,62
           L96,68 L112,68"
        fill="none" stroke="rgba(197,162,48,0.5)" strokeWidth="1.2"
      />
      {/* nose */}
      <path d="M132,28 L140,32 L134,36" fill="none" stroke="rgba(197,162,48,0.3)" strokeWidth="0.8" />
      {/* torso side - shows chest/back contour */}
      <path
        d="M96,68 C88,70 82,76 80,86 C78,98 80,112 82,122 C84,132 86,140 86,148
           L88,210 L96,210 L96,162 L100,162 L100,295 L108,295 L108,162
           L104,162 L104,210 L112,210 L110,148 C110,140 112,132 116,118
           C120,104 120,88 116,76 C112,68 104,66 96,68"
        fill="none" stroke="rgba(197,162,48,0.45)" strokeWidth="1.2"
      />
      {/* arm (side view — single arm visible) */}
      <path
        d="M80,86 C72,96 66,110 64,124 C62,136 64,148 68,158
           L72,174 C73,177 76,177 77,174 L80,158 C82,148 82,136 82,124"
        fill="none" stroke="rgba(197,162,48,0.35)" strokeWidth="1"
      />
      {/* foot */}
      <path d="M100,295 C100,308 98,322 96,336 L94,360 C94,364 98,365 102,363
               L116,363 C118,362 118,360 116,359 L102,358"
        fill="none" stroke="rgba(197,162,48,0.35)" strokeWidth="1" />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SVG BODY — BACK VIEW
───────────────────────────────────────────────────────────── */
function BackBody() {
  return (
    <>
      {/* head back */}
      <ellipse cx="100" cy="28" rx="18" ry="22" fill="none" stroke="rgba(197,162,48,0.45)" strokeWidth="1.2" />
      {/* hairline detail */}
      <path d="M82,22 C86,14 94,10 100,10 C106,10 114,14 118,22"
        fill="none" stroke="rgba(197,162,48,0.25)" strokeWidth="0.8" />
      {/* back torso — slightly different shoulder line */}
      <path
        d="M70,58 C58,64 50,72 48,86 C46,100 50,114 54,124 C58,134 60,140 60,148
           L62,210 C62,214 65,216 68,216 L80,216 C84,216 86,213 86,210
           L84,165 C87,163 91,162 94,162
           L94,290 C94,295 97,297 100,297
           L100,297 C103,297 106,295 106,290
           L106,162 C109,162 113,163 116,165
           L114,210 C114,213 116,216 120,216 L132,216 C135,216 138,214 138,210
           L140,148 C140,140 142,134 146,124 C150,114 154,100 152,86
           C150,72 142,64 130,58 Z"
        fill="none" stroke="rgba(197,162,48,0.45)" strokeWidth="1.2"
      />
      {/* spine detail */}
      <path d="M100,60 L100,155" stroke="rgba(197,162,48,0.15)" strokeWidth="0.8" strokeDasharray="3,4" />
      {/* left arm (mirrored) */}
      <path
        d="M70,58 C60,66 48,80 42,98 C38,110 40,122 44,132 C46,140 50,146 52,152
           L56,172 C57,175 60,175 61,172 L64,152 C66,144 66,132 66,120 C66,108 68,96 72,88"
        fill="none" stroke="rgba(197,162,48,0.35)" strokeWidth="1"
      />
      {/* right arm (mirrored) */}
      <path
        d="M130,58 C140,66 152,80 158,98 C162,110 160,122 156,132 C154,140 150,146 148,152
           L144,172 C143,175 140,175 139,172 L136,152 C134,144 134,132 134,120 C134,108 132,96 128,88"
        fill="none" stroke="rgba(197,162,48,0.35)" strokeWidth="1"
      />
      {/* legs */}
      <path d="M94,290 C90,300 88,314 88,326 L90,360 C90,363 93,365 96,363 L100,357"
        fill="none" stroke="rgba(197,162,48,0.35)" strokeWidth="1" />
      <path d="M106,290 C110,300 112,314 112,326 L110,360 C110,363 107,365 104,363 L100,357"
        fill="none" stroke="rgba(197,162,48,0.35)" strokeWidth="1" />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   FIGURE VIEWER — contains the rotating body + laser + cloud
───────────────────────────────────────────────────────────── */
function FigureViewer({
  displayAngle,
  phase,
  sweepProgress,
  pointCloud,
  activeDot,
  revealedDots,
  onDotClick,
}: {
  displayAngle: number;
  phase: Phase;
  sweepProgress: number;
  pointCloud: { x: number; y: number; opacity: number }[];
  activeDot: keyof Measurements | null;
  revealedDots: Set<keyof Measurements>;
  onDotClick: (k: keyof Measurements) => void;
}) {
  // Which SVG body to show based on angle
  const normAngle = ((displayAngle % 360) + 360) % 360;
  let BodySVG: React.FC;
  if (normAngle > 45 && normAngle <= 135) BodySVG = SideBody;
  else if (normAngle > 135 && normAngle <= 225) BodySVG = BackBody;
  else if (normAngle > 225 && normAngle <= 315) BodySVG = SideBody;
  else BodySVG = FrontBody;

  const showDots = phase === 'complete' && normAngle <= 45;

  // CSS 3D rotation — perspective gives depth
  const perspectiveScale = Math.abs(Math.cos((normAngle * Math.PI) / 180));
  // scaleX compresses figure as it rotates, giving 3D parallax feel
  const figureStyle: React.CSSProperties = {
    transform: `perspective(700px) rotateY(${displayAngle}deg)`,
    transformStyle: 'preserve-3d',
    transition: phase === 'rotating' ? `transform ${ROTATION_DURATION}ms cubic-bezier(0.4,0,0.2,1)` : 'none',
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center" style={{ minHeight: 440 }}>

      {/* ── Orbit ring ── */}
      <OrbitalRing displayAngle={normAngle} phase={phase} />

      {/* ── 3D Figure wrapper ── */}
      <div style={{ ...figureStyle, width: 160, height: 390, position: 'relative', flexShrink: 0 }}>
        <svg viewBox="0 0 200 380" width="160" height="390" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            {/* Grid fill for scanned region */}
            <pattern id="scanGrid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 12 0 L 0 0 0 12" fill="none" stroke="rgba(197,162,48,0.12)" strokeWidth="0.5" />
            </pattern>

            {/* Scan reveal gradient — fills from top as sweepProgress increases */}
            <linearGradient id="revealGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset={`${Math.max(0, sweepProgress - 3)}%`} stopColor="rgba(197,162,48,0.18)" stopOpacity="1" />
              <stop offset={`${sweepProgress}%`}                  stopColor="rgba(197,162,48,0.18)" stopOpacity="1" />
              <stop offset={`${sweepProgress}%`}                  stopColor="rgba(197,162,48,0)"    stopOpacity="0" />
              <stop offset="100%"                                  stopColor="rgba(197,162,48,0)"    stopOpacity="0" />
            </linearGradient>

            <clipPath id="bodyClipFull">
              <rect x="0" y="0" width="200" height="380" />
            </clipPath>
          </defs>

          {/* Body silhouette */}
          <BodySVG />

          {/* Scan fill overlay — appears when sweeping */}
          {(phase === 'sweeping' || phase === 'complete') && (
            <rect x="0" y="0" width="200" height="380" fill="url(#revealGrad)" />
          )}

          {/* Grid overlay (full body scanned region) */}
          {phase === 'complete' && (
            <rect x="0" y="0" width="200" height="380" fill="url(#scanGrid)" opacity="0.6" />
          )}

          {/* Laser sweep line */}
          {phase === 'sweeping' && sweepProgress > 0 && sweepProgress < 100 && (
            <>
              {/* main beam */}
              <rect
                x="0"
                y={sweepProgress * 3.78}
                width="200"
                height="2"
                fill="rgba(212,184,74,0.9)"
                style={{ filter: 'blur(0.5px)' }}
              />
              {/* glow halo */}
              <rect
                x="0"
                y={sweepProgress * 3.78 - 4}
                width="200"
                height="10"
                fill="rgba(197,162,48,0.15)"
              />
            </>
          )}
        </svg>

        {/* Point cloud (random dots scattered over figure during scan) */}
        {pointCloud.map((pt, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: pt.x,
              top: pt.y,
              width: 2,
              height: 2,
              background: `rgba(212,184,74,${pt.opacity})`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Measurement dots (complete phase, front view only) */}
        {showDots && MEASUREMENT_LABELS.map(({ key, label, unit }) => {
          const pos = DOT_POSITIONS[key];
          const isActive = activeDot === key;
          return (
            <AnimatePresence key={key}>
              {revealedDots.has(key) && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                  onClick={() => onDotClick(key)}
                  aria-label={`${label}: ${MOCK_MEASUREMENTS[key]} ${unit}`}
                  className="absolute"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)', zIndex: 10 }}
                >
                  <span className="absolute inset-0 rounded-full" style={{
                    border: '1px solid rgba(197,162,48,0.7)',
                    animation: 'dotPulse 2s ease-out infinite',
                    borderRadius: '50%',
                  }} />
                  <span className="block w-2.5 h-2.5 rounded-full" style={{
                    background: isActive ? '#C5A230' : 'rgba(197,162,48,0.4)',
                    border: '1px solid rgba(197,162,48,0.8)',
                  }} />
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap z-20 pointer-events-none"
                      style={{
                        background: 'rgba(10,10,10,0.95)',
                        border: '1px solid rgba(197,162,48,0.4)',
                        padding: '3px 8px',
                        fontSize: '0.55rem',
                        letterSpacing: '0.15em',
                        color: '#C5A230',
                        textTransform: 'uppercase',
                        fontFamily: 'sans-serif',
                      }}
                    >
                      {MOCK_MEASUREMENTS[key]} {unit}
                    </motion.span>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          );
        })}
      </div>

      {/* Angle readout */}
      {phase !== 'idle' && phase !== 'complete' && (
        <div
          className="absolute bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-2"
          style={{ pointerEvents: 'none' }}
        >
          <span style={{
            fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.1em',
            color: 'rgba(197,162,48,0.7)',
          }}>
            {Math.round(((normAngle % 360) + 360) % 360)}°
          </span>
        </div>
      )}

      {/* Floor reflection line */}
      <div className="absolute bottom-10 left-8 right-8 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(197,162,48,0.2), transparent)',
      }} />
      <div className="absolute bottom-8 left-12 right-12 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(197,162,48,0.08), transparent)',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ORBITAL RING — SVG arc showing scan progress around figure
───────────────────────────────────────────────────────────── */
function OrbitalRing({ displayAngle, phase }: { displayAngle: number; phase: Phase }) {
  const cx = 0, cy = 0, r = 110;
  const circumference = 2 * Math.PI * r;
  const pct = phase === 'complete' ? 1 : displayAngle / 360;
  const dash = circumference * pct;

  return (
    <svg
      viewBox="-130 -200 260 430"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: phase === 'idle' ? 0.3 : 0.7 }}
      aria-hidden="true"
    >
      {/* Base ring */}
      <ellipse cx={cx} cy={cy} rx={r} ry={32}
        fill="none" stroke="rgba(197,162,48,0.1)" strokeWidth="1" />

      {/* Progress arc */}
      <ellipse cx={cx} cy={cy} rx={r} ry={32}
        fill="none"
        stroke="rgba(197,162,48,0.5)"
        strokeWidth="1.5"
        strokeDasharray={`${dash} ${circumference}`}
        strokeDashoffset={circumference * 0.25}
        style={{ transition: `stroke-dasharray ${phase === 'rotating' ? ROTATION_DURATION : 200}ms ease` }}
      />

      {/* Rotating camera dot */}
      {phase !== 'idle' && phase !== 'complete' && (() => {
        const a = (displayAngle - 90) * (Math.PI / 180);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * 32;
        return (
          <>
            <circle cx={x} cy={y} r={4} fill="#C5A230" opacity="0.9" />
            <circle cx={x} cy={y} r={8} fill="none" stroke="rgba(197,162,48,0.4)" strokeWidth="1" />
          </>
        );
      })()}

      {/* Capture stop markers */}
      {CAPTURE_STOPS.map(stop => {
        const a = (stop.angle - 90) * (Math.PI / 180);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * 32;
        const done = phase === 'complete' || displayAngle >= stop.angle;
        return (
          <g key={stop.angle}>
            <circle cx={x} cy={y} r={3}
              fill={done ? 'rgba(197,162,48,0.8)' : 'rgba(197,162,48,0.2)'}
              stroke={done ? '#C5A230' : 'rgba(197,162,48,0.3)'}
              strokeWidth="0.8"
            />
            <text x={x + (x > 0 ? 8 : -8)} y={y + 4}
              fill="rgba(197,162,48,0.5)"
              fontSize="7"
              textAnchor={x > 0 ? 'start' : 'end'}
              fontFamily="monospace"
            >
              {stop.angleName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const EMPTY_MANUAL: Measurements = {
  chest: 0, waist: 0, hips: 0, shoulder: 0,
  sleeveLength: 0, jacketLength: 0, inseam: 0, neck: 0, thigh: 0,
};

export default function BodyScan3D() {
  const sectionRef = useRef<HTMLElement>(null);

  // Mode toggle
  const [mode, setMode] = useState<'scan' | 'manual'>('scan');
  const [manualMeasurements, setManualMeasurements] = useState<Measurements>(EMPTY_MANUAL);
  const [manualSaved, setManualSaved] = useState(false);

  const [phase, setPhase]               = useState<Phase>('idle');
  const [displayAngle, setDisplayAngle] = useState(0);
  const [captureIdx, setCaptureIdx]     = useState(0);   // which stop we're on
  const [sweepProgress, setSweepProgress] = useState(0); // 0–100
  const [stepLabel, setStepLabel]       = useState('');
  const [dataPoints, setDataPoints]     = useState(0);   // fake point counter
  const [pointCloud, setPointCloud]     = useState<{ x: number; y: number; opacity: number }[]>([]);
  const [activeDot, setActiveDot]       = useState<keyof Measurements | null>(null);
  const [revealedDots, setRevealedDots] = useState<Set<keyof Measurements>>(new Set());
  const [measurements, setMeasurements] = useState<Measurements | null>(null);
  const [toast, setToast]               = useState<string | null>(null);
  const toastTimer                      = useRef<ReturnType<typeof setTimeout> | null>(null);

  const manualValid = MEASUREMENT_LABELS.every(({ key }) => (manualMeasurements[key] ?? 0) > 0);

  function setManualField(key: keyof Measurements, raw: string) {
    const val = parseFloat(raw);
    setManualMeasurements(prev => ({ ...prev, [key]: isNaN(val) ? 0 : val }));
  }

  function saveManual() {
    setManualSaved(true);
    showToast('Measurements saved to your profile.');
    setTimeout(() => setManualSaved(false), 2500);
  }

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  const phaseRef      = useRef(phase);
  const captureRef    = useRef(captureIdx);
  phaseRef.current    = phase;
  captureRef.current  = captureIdx;

  /* ── Rotate to next stop ─────────────────────────────────── */
  const rotateToStop = useCallback((stopIdx: number) => {
    if (stopIdx >= CAPTURE_STOPS.length) {
      setPhase('processing');
      return;
    }
    setPhase('rotating');
    setStepLabel(`Rotating to ${CAPTURE_STOPS[stopIdx].angleName}…`);
    setDisplayAngle(CAPTURE_STOPS[stopIdx].angle);
    setCaptureIdx(stopIdx);

    setTimeout(() => {
      if (phaseRef.current === 'rotating') sweepAtStop(stopIdx);
    }, ROTATION_DURATION + 100);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Sweep laser at current stop ────────────────────────── */
  const sweepAtStop = useCallback((stopIdx: number) => {
    setPhase('sweeping');
    setStepLabel(CAPTURE_STOPS[stopIdx].label);
    setSweepProgress(0);

    let progress = 0;
    const tickMs = SWEEP_DURATION / 100;

    const interval = setInterval(() => {
      progress += 1;
      setSweepProgress(progress);

      // Add random point cloud dots during sweep
      if (progress % 5 === 0) {
        setPointCloud(prev => [
          ...prev,
          ...Array.from({ length: 8 }, () => ({
            x: Math.random() * 130 + 10,
            y: (progress / 100) * 370 + (Math.random() - 0.5) * 30,
            opacity: Math.random() * 0.6 + 0.2,
          })),
        ]);
      }

      // Fake data points counter
      setDataPoints(d => d + Math.floor(Math.random() * 40 + 20));

      if (progress >= 100) {
        clearInterval(interval);
        setSweepProgress(100);
        setTimeout(() => {
          rotateToStop(stopIdx + 1);
        }, 300);
      }
    }, tickMs);
  }, [rotateToStop]);

  /* ── Start scan ─────────────────────────────────────────── */
  function startScan() {
    setDisplayAngle(0);
    setCaptureIdx(0);
    setSweepProgress(0);
    setDataPoints(0);
    setPointCloud([]);
    setRevealedDots(new Set());
    setActiveDot(null);
    setMeasurements(null);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Brief pause then begin
    setPhase('rotating');
    setStepLabel('Initialising depth sensors…');
    setTimeout(() => sweepAtStop(0), 800);
  }

  /* ── Processing → complete ───────────────────────────────── */
  useEffect(() => {
    if (phase !== 'processing') return;
    setStepLabel('Computing body mesh…');
    setDisplayAngle(0); // return to front
    const t = setTimeout(() => {
      setMeasurements(MOCK_MEASUREMENTS);
      setPhase('complete');
    }, 1800);
    return () => clearTimeout(t);
  }, [phase]);

  /* ── Reveal dots after complete ─────────────────────────── */
  useEffect(() => {
    if (phase !== 'complete') return;
    const keys = Object.keys(MOCK_MEASUREMENTS) as (keyof Measurements)[];
    keys.forEach((key, i) => {
      setTimeout(() => setRevealedDots(prev => new Set([...prev, key])), i * 100 + 400);
    });
  }, [phase]);

  const overallProgress = phase === 'complete' ? 100
    : phase === 'processing' ? 95
    : Math.round((captureIdx / CAPTURE_STOPS.length) * 100 + (sweepProgress / CAPTURE_STOPS.length));

  return (
    <section ref={sectionRef} id="body-scan" className="py-28 px-8 border-t border-gold/10 overflow-hidden">
      <style>{`
        @keyframes dotPulse { 0% { transform: scale(1); opacity:0.8; } 100% { transform: scale(2.6); opacity:0; } }
        @keyframes scanFlicker { 0%,100%{opacity:1;} 50%{opacity:0.55;} }
        @keyframes counterUp { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="max-w-screen-xl mx-auto">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <p className="section-label mb-3">Precision Fitting Technology</p>
          <h2 className="font-cormorant text-4xl md:text-5xl font-light text-cream">
            3D Body <em>Measurement Scan</em>
          </h2>
          <div className="mt-6 max-w-xl">
            <p className="font-dm text-sm text-cream-muted leading-relaxed">
              Our depth-sensing array captures a full 360° contour scan — front, side, and rear —
              extracting nine bespoke measurements with sub-millimetre precision.
            </p>
          </div>

          {/* Mode toggle */}
          <div className="mt-8 flex gap-0 border border-gold/20 self-start inline-flex">
            {([
              { key: 'scan',   label: '3D Body Scan' },
              { key: 'manual', label: 'Enter Manually' },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`px-7 py-3 font-josefin text-[0.58rem] tracking-[0.25em] uppercase transition-all duration-200
                  ${mode === key
                    ? 'bg-gold text-obsidian'
                    : 'text-cream-muted hover:text-cream'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Main panel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-gold/10">

          {/* ── LEFT: 3D Viewer ── */}
          <div
            className="relative bg-obsidian-100 border-r border-gold/10 overflow-hidden"
            style={{ minHeight: 540 }}
          >
            {/* Corner marks */}
            {(['top-0 left-0','top-0 right-0','bottom-0 left-0','bottom-0 right-0'] as const).map(pos => (
              <span key={pos} className={`absolute ${pos} w-5 h-5 pointer-events-none`} style={{
                borderTopWidth:    pos.includes('top')    ? 1 : 0,
                borderBottomWidth: pos.includes('bottom') ? 1 : 0,
                borderLeftWidth:   pos.includes('left')   ? 1 : 0,
                borderRightWidth:  pos.includes('right')  ? 1 : 0,
                borderColor: 'rgba(197,162,48,0.5)',
                borderStyle: 'solid',
              }} />
            ))}

            {/* Figure */}
            <FigureViewer
              displayAngle={displayAngle}
              phase={phase}
              sweepProgress={sweepProgress}
              pointCloud={pointCloud}
              activeDot={activeDot}
              revealedDots={revealedDots}
              onDotClick={k => setActiveDot(activeDot === k ? null : k)}
            />

            {/* ── Status bar ── */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gold/10 px-5 py-3"
                 style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(8px)' }}>
              {phase === 'idle' && (
                <p className="font-josefin text-[0.58rem] tracking-[0.25em] uppercase text-cream-muted">
                  Stand still · Arms slightly raised
                </p>
              )}
              {(phase === 'rotating' || phase === 'sweeping') && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <p className="font-josefin text-[0.58rem] tracking-[0.2em] uppercase text-gold"
                       style={{ animation: 'scanFlicker 1.1s ease-in-out infinite' }}>
                      {stepLabel}
                    </p>
                    <span className="font-josefin text-[0.5rem] tracking-widest text-cream-muted">{overallProgress}%</span>
                  </div>
                  <div className="h-px bg-smoke overflow-hidden">
                    <div className="h-full bg-gold transition-all duration-300" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>
              )}
              {phase === 'processing' && (
                <p className="font-josefin text-[0.58rem] tracking-[0.2em] uppercase text-gold"
                   style={{ animation: 'scanFlicker 0.7s ease-in-out infinite' }}>
                  {stepLabel}
                </p>
              )}
              {phase === 'complete' && (
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  <p className="font-josefin text-[0.58rem] tracking-[0.2em] uppercase text-gold">
                    Scan complete · {dataPoints.toLocaleString()} data points captured
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Controls / Results ── */}
          <div className="flex flex-col">

            {/* ── MANUAL ENTRY MODE ── */}
            {mode === 'manual' && (
              <motion.div
                key="manual"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col h-full"
              >
                {/* Header */}
                <div className="px-8 py-5 border-b border-gold/10">
                  <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-0.5">Manual Entry</p>
                  <p className="font-cormorant text-xl font-light text-cream">Enter Your Measurements</p>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                  <p className="font-dm text-xs text-cream-muted/60 leading-relaxed mb-6">
                    All measurements in inches. If you have a recent tailor measurement sheet, enter the values below. Fields marked with an asterisk are required.
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                    {MEASUREMENT_LABELS.map(({ key, label, unit }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label
                          htmlFor={`manual-${key}`}
                          className="font-josefin text-[0.55rem] tracking-[0.2em] uppercase text-cream-muted"
                        >
                          {label} <span className="text-gold">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id={`manual-${key}`}
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            min="0"
                            placeholder="0.0"
                            value={manualMeasurements[key] || ''}
                            onChange={e => setManualField(key, e.target.value)}
                            className="w-full bg-obsidian border border-smoke font-dm text-sm text-cream px-4 py-2.5 pr-10 outline-none
                              placeholder:text-cream-muted/25 focus:border-gold/50 transition-colors duration-200
                              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-josefin text-[0.5rem] tracking-widest uppercase text-cream-muted/40">
                            {unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-gold/10 pt-4">
                    <p className="font-dm text-[0.68rem] text-cream-muted/40 leading-relaxed">
                      Need help measuring? Visit us at Far East Plaza for a complimentary fitting consultation with our master tailor.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-8 py-5 border-t border-gold/10 flex gap-3 flex-shrink-0">
                  <button
                    disabled={!manualValid}
                    onClick={saveManual}
                    className="flex-1 py-3.5 bg-gold font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-obsidian hover:bg-gold-light transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {manualSaved ? 'Saved ✓' : 'Save to Profile'}
                  </button>
                  <button
                    onClick={() => setManualMeasurements(EMPTY_MANUAL)}
                    className="flex-1 py-3.5 border border-gold/30 font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted hover:text-cream hover:border-gold/60 transition-all duration-300"
                  >
                    Clear
                  </button>
                </div>
              </motion.div>
            )}

            {/* IDLE */}
            {mode === 'scan' && phase === 'idle' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col justify-center h-full px-10 py-12 gap-8">
                <div>
                  <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-4">How It Works</p>
                  <ul className="flex flex-col gap-4">
                    {[
                      { n: '01', text: 'Stand in a neutral position with arms slightly raised from your sides.' },
                      { n: '02', text: 'The scanner captures your full 360° contour — front, both sides, and rear.' },
                      { n: '03', text: 'Depth data is resolved into nine precise body measurements automatically.' },
                      { n: '04', text: 'Measurements are locked to your profile and used for every future order.' },
                    ].map(({ n, text }) => (
                      <li key={n} className="flex gap-4 items-start">
                        <span className="font-cormorant text-2xl text-gold/40 leading-none mt-0.5 flex-shrink-0">{n}</span>
                        <p className="font-dm text-sm text-cream-muted">{text}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Angle preview indicators */}
                <div className="flex items-center gap-3">
                  {CAPTURE_STOPS.map(s => (
                    <div key={s.angle} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 border border-gold/20 flex items-center justify-center">
                        <span className="font-josefin text-[0.45rem] tracking-widest text-cream-muted/50">{s.angleName}</span>
                      </div>
                    </div>
                  ))}
                  <p className="font-dm text-xs text-cream-muted/40 ml-2">4 capture angles</p>
                </div>

                <button
                  onClick={startScan}
                  className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase px-8 py-4 border border-gold/60 text-gold hover:bg-gold hover:text-obsidian transition-all duration-300 self-start"
                >
                  Begin 3D Scan
                </button>
              </motion.div>
            )}

            {/* SCANNING (rotating + sweeping) */}
            {mode === 'scan' && (phase === 'rotating' || phase === 'sweeping') && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col h-full px-10 py-10 gap-6">
                <div>
                  <p className="font-cormorant text-2xl font-light text-cream mb-1">Scanning in progress</p>
                  <p className="font-dm text-xs text-cream-muted">Please remain still throughout the full rotation.</p>
                </div>

                {/* Capture progress */}
                <div className="flex flex-col gap-3">
                  {CAPTURE_STOPS.map((stop, i) => {
                    const done    = i < captureIdx;
                    const active  = i === captureIdx;
                    return (
                      <div key={stop.angle} className="flex items-center gap-3">
                        <div className="w-5 h-5 border flex items-center justify-center flex-shrink-0" style={{
                          borderColor: done ? '#C5A230' : active ? 'rgba(197,162,48,0.8)' : 'rgba(197,162,48,0.15)',
                          background:  done ? '#C5A230' : 'transparent',
                        }}>
                          {done ? (
                            <span style={{ color: '#0A0A0A', fontSize: '0.5rem' }}>✓</span>
                          ) : (
                            <span style={{
                              width: 4, height: 4, borderRadius: '50%',
                              background: active ? '#C5A230' : 'rgba(197,162,48,0.2)',
                              display: 'block',
                              boxShadow: active ? '0 0 6px rgba(197,162,48,0.8)' : 'none',
                            }} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-josefin text-[0.58rem] tracking-[0.2em] uppercase" style={{
                            color: done ? 'rgba(197,162,48,0.5)' : active ? '#F0E6C8' : 'rgba(200,190,168,0.25)',
                          }}>
                            {stop.label}
                          </p>
                          {active && phase === 'sweeping' && (
                            <div className="h-px bg-smoke mt-1.5 overflow-hidden">
                              <div className="h-full bg-gold/60 transition-all duration-150"
                                   style={{ width: `${sweepProgress}%` }} />
                            </div>
                          )}
                        </div>
                        <span className="font-josefin text-[0.48rem] tracking-wider text-cream-muted/30">{stop.angleName}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Live data counter */}
                <div className="border border-gold/10 px-5 py-4 mt-auto">
                  <p className="font-josefin text-[0.55rem] tracking-[0.25em] uppercase text-cream-muted mb-2">
                    Depth Points Captured
                  </p>
                  <p className="font-cormorant text-3xl text-gold" style={{ animation: 'counterUp 0.2s ease' }}>
                    {dataPoints.toLocaleString()}
                    <span className="font-dm text-sm text-cream-muted/50 ml-2">/ 12,000 target</span>
                  </p>
                  <div className="h-px bg-smoke mt-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-300"
                         style={{ width: `${Math.min(100, (dataPoints / 12000) * 100)}%` }} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* PROCESSING */}
            {mode === 'scan' && phase === 'processing' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col justify-center h-full px-10 py-12 gap-6">
                <p className="font-cormorant text-2xl font-light text-cream">Resolving measurements…</p>
                <div className="flex flex-col gap-3">
                  {[
                    'Aligning multi-angle point clouds',
                    'Generating 3D mesh surface',
                    'Extracting anthropometric landmarks',
                    'Applying Picadilly fit algorithm',
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0"
                            style={{ animation: `scanFlicker ${0.6 + i * 0.15}s ease-in-out infinite` }} />
                      <p className="font-dm text-xs text-cream-muted">{s}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* COMPLETE */}
            {mode === 'scan' && phase === 'complete' && measurements && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
                className="flex flex-col h-full">

                {/* Header */}
                <div className="px-8 py-5 border-b border-gold/10 flex items-center justify-between flex-shrink-0">
                  <div>
                    <p className="font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-gold">Scan Complete</p>
                    <p className="font-cormorant text-xl font-light text-cream mt-0.5">Your Measurements</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-josefin text-[0.5rem] tracking-widest uppercase text-cream-muted border border-gold/20 px-2.5 py-1">
                      Accuracy 98.4%
                    </span>
                    <span className="font-josefin text-[0.45rem] tracking-wider text-cream-muted/40">
                      {dataPoints.toLocaleString()} pts
                    </span>
                  </div>
                </div>

                {/* Measurements */}
                <div className="flex-1 overflow-y-auto px-8 py-5">
                  <div className="grid grid-cols-2 gap-x-8">
                    {MEASUREMENT_LABELS.map(({ key, label, unit }, i) => (
                      <motion.button
                        key={key}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.35 }}
                        onClick={() => setActiveDot(activeDot === key ? null : key)}
                        className="flex items-center justify-between py-3 border-b text-left w-full"
                        style={{ borderColor: '#252525' }}
                      >
                        <span className="font-josefin text-[0.58rem] tracking-[0.18em] uppercase"
                              style={{ color: activeDot === key ? '#C5A230' : '#C8BEA8' }}>
                          {label}
                        </span>
                        <span className="font-cormorant text-lg font-light"
                              style={{ color: activeDot === key ? '#C5A230' : '#F5EFE0' }}>
                          {measurements[key]}
                          <span className="text-xs text-cream-muted ml-0.5">{unit}</span>
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  <p className="font-dm text-xs text-cream-muted/40 mt-4 leading-relaxed">
                    Tap a row to highlight on the figure. Rotate back to 0° to see measurement dots.
                  </p>
                </div>

                {/* Actions */}
                <div className="px-8 py-5 border-t border-gold/10 flex gap-3 flex-shrink-0">
                  <button
                    className="flex-1 py-3.5 bg-gold font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-obsidian hover:bg-gold-light transition-colors duration-300"
                    onClick={() => showToast('Measurements saved to your profile.')}
                  >
                    Save to Profile
                  </button>
                  <button
                    className="flex-1 py-3.5 border border-gold/30 font-josefin text-[0.6rem] tracking-[0.3em] uppercase text-cream-muted hover:text-cream hover:border-gold/60 transition-all duration-300"
                    onClick={startScan}
                  >
                    Re-scan
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* ── Toast notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="scan-toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-8 right-8 z-[9999] flex items-center gap-3 px-5 py-4 border"
            style={{
              background: 'rgba(10,10,10,0.96)',
              borderColor: 'rgba(197,162,48,0.4)',
              backdropFilter: 'blur(12px)',
              maxWidth: 340,
              pointerEvents: 'none',
            }}
          >
            <span className="w-5 h-5 border border-gold flex items-center justify-center flex-shrink-0"
                  style={{ color: '#C5A230', fontSize: '0.55rem' }}>✓</span>
            <p className="font-josefin text-[0.6rem] tracking-[0.2em] uppercase text-cream">{toast}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
