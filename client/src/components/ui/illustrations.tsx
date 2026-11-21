import { useId } from "react";

// Flat illustrations in the unDraw style: simple shapes, a single accent
// colour and neutral greys. Drawn for this app so they share its palette.

const INK = "#334155";
const HAIR = "#2f2e41";
const SKIN = "#f9b9a7";
const LIGHT = "#e2e8f0";
const PAPER = "#ffffff";
const ACCENT = "#4f46e5";
const ACCENT_LIGHT = "#e0e7ff";
const GOLD = "#ffc83d";

type Props = { className?: string };

function Svg({ className, viewBox, children }: Props & { viewBox: string; children: React.ReactNode }) {
  return (
    <svg viewBox={viewBox} className={className} role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

function Star({ x, y, size = 10, fill = GOLD }: { x: number; y: number; size?: number; fill?: string }) {
  const s = size;
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? s : s * 0.45;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} />;
}

/** A presenter pointing at a chart on a big screen, with audience and a rating card. */
export function PresentingIllustration({ className }: Props) {
  return (
    <Svg className={className} viewBox="0 0 480 360">
      <ellipse cx="240" cy="334" rx="220" ry="10" fill={LIGHT} />

      {/* screen */}
      <rect x="168" y="36" width="270" height="178" rx="16" fill={PAPER} stroke={LIGHT} strokeWidth="3" />
      <circle cx="188" cy="56" r="4" fill="#ff6b6b" />
      <circle cx="201" cy="56" r="4" fill={GOLD} />
      <circle cx="214" cy="56" r="4" fill="#4cd964" />
      <rect x="196" y="140" width="26" height="52" rx="5" fill={ACCENT_LIGHT} />
      <rect x="236" y="112" width="26" height="80" rx="5" fill={ACCENT_LIGHT} />
      <rect x="276" y="124" width="26" height="68" rx="5" fill={ACCENT_LIGHT} />
      <rect x="316" y="92" width="26" height="100" rx="5" fill={ACCENT} />
      <rect x="356" y="78" width="26" height="114" rx="5" fill={ACCENT} opacity="0.85" />
      <polyline points="209,128 249,100 289,110 329,80 369,64 404,52" fill="none" stroke={INK} strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="404" cy="52" r="5" fill={INK} />
      <rect x="296" y="214" width="10" height="92" fill={LIGHT} />
      <rect x="262" y="302" width="78" height="10" rx="5" fill={LIGHT} />

      {/* presenter */}
      <rect x="86" y="246" width="13" height="82" rx="6" fill={HAIR} />
      <rect x="106" y="246" width="13" height="82" rx="6" fill={HAIR} />
      <ellipse cx="90" cy="330" rx="13" ry="5" fill={INK} />
      <ellipse cx="116" cy="330" rx="13" ry="5" fill={INK} />
      <path d="M118 188 L170 136" stroke={SKIN} strokeWidth="10" strokeLinecap="round" />
      <path d="M116 190 L140 166" stroke={ACCENT} strokeWidth="15" strokeLinecap="round" />
      <path d="M78 180 q24 -16 50 0 l6 72 h-62z" fill={ACCENT} />
      <path d="M82 196 L74 244" stroke={SKIN} strokeWidth="10" strokeLinecap="round" />
      <path d="M84 188 L80 214" stroke={ACCENT} strokeWidth="15" strokeLinecap="round" />
      <rect x="96" y="160" width="12" height="18" rx="5" fill={SKIN} />
      <circle cx="102" cy="142" r="22" fill={SKIN} />
      <path d="M79 140 a23 23 0 0 1 46 -3 c-8 -9 -19 -11 -29 -8 c-7 2 -12 6 -17 11z" fill={HAIR} />

      {/* rating card */}
      <g>
        <rect x="330" y="236" width="128" height="62" rx="14" fill={PAPER} stroke={LIGHT} strokeWidth="2" />
        <rect x="346" y="250" width="54" height="7" rx="3.5" fill={LIGHT} />
        <Star x={352} y={278} size={9} />
        <Star x={374} y={278} size={9} />
        <Star x={396} y={278} size={9} />
        <Star x={418} y={278} size={9} />
        <Star x={440} y={278} size={9} fill={LIGHT} />
      </g>

      {/* audience */}
      <g>
        <path d="M176 334 q0 -42 32 -42 q32 0 32 42z" fill={INK} />
        <circle cx="208" cy="272" r="17" fill={HAIR} />
        <path d="M232 334 q0 -36 28 -36 q28 0 28 36z" fill="#a78bfa" opacity="0.85" />
        <circle cx="260" cy="282" r="15" fill={HAIR} />
      </g>
    </Svg>
  );
}

/** An empty calendar page with a plus. */
export function EmptyCalendarIllustration({ className }: Props) {
  return (
    <Svg className={className} viewBox="0 0 320 220">
      <ellipse cx="160" cy="206" rx="130" ry="8" fill={LIGHT} />
      <rect x="70" y="30" width="180" height="160" rx="18" fill={PAPER} stroke={LIGHT} strokeWidth="3" />
      <path d="M70 48 a18 18 0 0 1 18 -18 h144 a18 18 0 0 1 18 18 v20 h-180z" fill={ACCENT} />
      <rect x="104" y="18" width="10" height="26" rx="5" fill={INK} />
      <rect x="206" y="18" width="10" height="26" rx="5" fill={INK} />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2, 3, 4].map((c) => (
          <rect key={`${r}-${c}`} x={88 + c * 30} y={82 + r * 25} width="22" height="16" rx="4"
                fill={r === 1 && c === 2 ? ACCENT_LIGHT : "#f1f1f5"} />
        )),
      )}
      <circle cx="248" cy="160" r="24" fill={ACCENT} />
      <path d="M248 149v22M237 160h22" stroke={PAPER} strokeWidth="4" strokeLinecap="round" />
      {/* plant */}
      <path d="M44 190 q-4 -40 10 -62" stroke="#4caf7a" strokeWidth="3" fill="none" />
      <ellipse cx="48" cy="140" rx="7" ry="14" fill="#4caf7a" transform="rotate(-25 48 140)" />
      <ellipse cx="60" cy="156" rx="6" ry="12" fill="#6fcf97" transform="rotate(30 60 156)" />
      <rect x="34" y="182" width="28" height="18" rx="4" fill={INK} />
    </Svg>
  );
}

/** A clipboard with every item ticked. */
export function AllDoneIllustration({ className }: Props) {
  return (
    <Svg className={className} viewBox="0 0 320 220">
      <ellipse cx="160" cy="206" rx="120" ry="8" fill={LIGHT} />
      <rect x="96" y="28" width="128" height="168" rx="16" fill={PAPER} stroke={LIGHT} strokeWidth="3" />
      <rect x="128" y="18" width="64" height="22" rx="8" fill={INK} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx="124" cy={78 + i * 40} r="11" fill={ACCENT} />
          <path d={`M118 ${78 + i * 40} l4 4 l8 -8`} stroke={PAPER} strokeWidth="3" fill="none"
                strokeLinecap="round" strokeLinejoin="round" />
          <rect x="144" y={72 + i * 40} width={58 - i * 10} height="6" rx="3" fill={LIGHT} />
          <rect x="144" y={82 + i * 40} width="40" height="5" rx="2.5" fill="#f1f1f5" />
        </g>
      ))}
      <Star x={250} y={50} size={11} />
      <Star x={74} y={70} size={8} fill={ACCENT_LIGHT} />
      <Star x={262} y={150} size={7} fill={ACCENT_LIGHT} />
      <circle cx="62" cy="140" r="4" fill={GOLD} />
      <circle cx="270" cy="100" r="3" fill={ACCENT} />
    </Svg>
  );
}

/** Books and a graduation cap: no courses yet. */
export function CoursesIllustration({ className }: Props) {
  return (
    <Svg className={className} viewBox="0 0 320 220">
      <ellipse cx="160" cy="206" rx="130" ry="8" fill={LIGHT} />
      <rect x="86" y="164" width="150" height="30" rx="6" fill={ACCENT} />
      <rect x="96" y="170" width="120" height="4" rx="2" fill={ACCENT_LIGHT} />
      <rect x="98" y="134" width="132" height="30" rx="6" fill={INK} />
      <rect x="108" y="140" width="96" height="4" rx="2" fill="#6b6987" />
      <rect x="92" y="104" width="140" height="30" rx="6" fill="#a78bfa" opacity="0.85" />
      <rect x="102" y="110" width="110" height="4" rx="2" fill="#d6d3ff" />
      <path d="M160 46 l78 28 l-78 28 l-78 -28z" fill={HAIR} />
      <path d="M126 86 v20 q34 18 68 0 v-20 l-34 12z" fill={INK} />
      <path d="M238 74 v34" stroke={GOLD} strokeWidth="3" />
      <circle cx="238" cy="112" r="6" fill={GOLD} />
      <Star x={60} y={70} size={8} fill={ACCENT_LIGHT} />
      <Star x={268} y={150} size={7} />
    </Svg>
  );
}

/** Two speech bubbles: feedback / comments. */
export function FeedbackIllustration({ className }: Props) {
  return (
    <Svg className={className} viewBox="0 0 320 220">
      <ellipse cx="160" cy="206" rx="120" ry="8" fill={LIGHT} />
      <path d="M56 40 h140 a16 16 0 0 1 16 16 v58 a16 16 0 0 1 -16 16 h-96 l-26 22 v-22 h-18 a16 16 0 0 1 -16 -16 v-58 a16 16 0 0 1 16 -16z"
            fill={PAPER} stroke={LIGHT} strokeWidth="3" />
      <rect x="64" y="62" width="110" height="8" rx="4" fill={LIGHT} />
      <rect x="64" y="80" width="128" height="8" rx="4" fill={LIGHT} />
      <Star x={72} y={108} size={7} />
      <Star x={90} y={108} size={7} />
      <Star x={108} y={108} size={7} />
      <Star x={126} y={108} size={7} />
      <path d="M150 104 h112 a14 14 0 0 1 14 14 v46 a14 14 0 0 1 -14 14 h-14 v20 l-24 -20 h-74 a14 14 0 0 1 -14 -14 v-46 a14 14 0 0 1 14 -14z"
            fill={ACCENT} />
      <rect x="156" y="124" width="96" height="7" rx="3.5" fill={ACCENT_LIGHT} />
      <rect x="156" y="140" width="76" height="7" rx="3.5" fill={ACCENT_LIGHT} />
      <rect x="156" y="156" width="88" height="7" rx="3.5" fill={ACCENT_LIGHT} />
    </Svg>
  );
}

/** A paper plane with a dotted trail and a tick: evaluation sent. */
export function SentIllustration({ className }: Props) {
  return (
    <Svg className={className} viewBox="0 0 320 220">
      <ellipse cx="160" cy="206" rx="110" ry="8" fill={LIGHT} />
      <path d="M40 170 q60 -10 90 -50 q20 -28 60 -36" stroke={LIGHT} strokeWidth="3" strokeDasharray="2 10"
            strokeLinecap="round" fill="none" />
      <path d="M180 64 l100 -30 l-40 110 l-26 -42z" fill={ACCENT} />
      <path d="M180 64 l34 38 l66 -68z" fill="#818cf8" />
      <path d="M214 102 l-4 40 l22 -28z" fill="#3730a3" />
      <circle cx="96" cy="156" r="26" fill="#10b981" />
      <path d="M84 156 l8 8 l16 -16" stroke={PAPER} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Star x={268} y={150} size={8} />
      <Star x={64} y={70} size={7} fill={ACCENT_LIGHT} />
    </Svg>
  );
}

/** A padlock: no access. */
export function LockedIllustration({ className }: Props) {
  return (
    <Svg className={className} viewBox="0 0 320 220">
      <ellipse cx="160" cy="206" rx="100" ry="8" fill={LIGHT} />
      <path d="M118 96 v-24 a42 42 0 0 1 84 0 v24" stroke={INK} strokeWidth="14" fill="none" strokeLinecap="round" />
      <rect x="96" y="92" width="128" height="104" rx="20" fill={ACCENT} />
      <circle cx="160" cy="134" r="13" fill={PAPER} />
      <rect x="155" y="138" width="10" height="28" rx="5" fill={PAPER} />
      <Star x={252} y={70} size={8} fill={ACCENT_LIGHT} />
      <Star x={70} y={120} size={7} />
    </Svg>
  );
}

/** App mark used in the navigation bar. */
export function AppMark({ className = "w-7 h-7" }: Props) {
  // Unique per instance: the mark appears in both the sidebar and the phone
  // top bar, and a gradient defined inside a hidden copy would not render.
  const gradientId = useId();
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#3730a3" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${gradientId})`} />
      <rect x="15" y="34" width="8" height="16" rx="3" fill="#fff" opacity=".75" />
      <rect x="28" y="24" width="8" height="26" rx="3" fill="#fff" opacity=".9" />
      <rect x="41" y="14" width="8" height="36" rx="3" fill="#fff" />
    </svg>
  );
}
