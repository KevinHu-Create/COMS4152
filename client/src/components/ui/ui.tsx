import { useLocation, useNavigate, NavLink } from "react-router-dom";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { getUser, logout } from "../../api";
import { AlertIcon, CalendarIcon, CheckIcon, ChevronLeftIcon, InfoIcon, LogoutIcon, QuoteIcon } from "./icons";
import { AppMark } from "./illustrations";
import { cx, initials } from "./format";

/* ---------- layout ---------- */

const ROLE_NAMES: Record<string, string> = { instructor: "Instructor", ta: "TA", student: "Student", admin: "Admin" };

// "Events" stays highlighted on the pages you reach from an event.
const NAV = [
  { to: "/events", label: "Events", Icon: CalendarIcon, section: ["/events", "/evaluation", "/admin", "/event/", "/courses"] },
  { to: "/feedback", label: "My Feedback", Icon: QuoteIcon, section: ["/feedback"] },
];

/** App frame: a sidebar on wide screens, a top bar on phones. */
export function AppShell({ children, width = "max-w-5xl" }: { children: ReactNode; width?: string }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = getUser();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const inSection = (section: string[]) => section.some((prefix) => pathname.startsWith(prefix));

  const sideLink = (active: boolean) =>
    cx("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
       active ? "bg-accent-soft text-accent" : "text-ink-2 hover:bg-canvas hover:text-ink");

  const topLink = (active: boolean) =>
    cx("px-3 py-1.5 rounded-lg text-sm font-medium", active ? "bg-accent-soft text-accent" : "text-ink-2");

  const brand = (
    <button type="button" onClick={() => navigate("/events")} className="flex items-center gap-2.5"
            aria-label="Presentation Evaluations home">
      <AppMark className="w-8 h-8" />
      <span className="text-left leading-tight">
        <span className="block text-[15px] font-semibold text-ink">Evaluations</span>
        <span className="block text-xs text-ink-3">Peer feedback for talks</span>
      </span>
    </button>
  );

  return (
    <div className="min-h-screen md:pl-64">
      {/* Sidebar (md and up) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-hair">
        <div className="h-16 flex items-center px-5 border-b border-hair">{brand}</div>
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">Menu</p>
          {NAV.map(({ to, label, Icon, section }) => (
            <NavLink key={to} to={to} className={sideLink(inSection(section))}>
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="p-3 border-t border-hair">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar name={user.name} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate">{user.name}</p>
                <p className="text-xs text-ink-3">{ROLE_NAMES[user.role] ?? user.role}</p>
              </div>
            </div>
            <button type="button" onClick={handleLogout}
                    className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-ink-2 hover:text-danger hover:bg-danger-soft">
              <LogoutIcon className="w-[18px] h-[18px]" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Top bar (phones) */}
      <header className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-hair">
        <div className="h-14 px-4 flex items-center gap-2">
          {brand}
          <button type="button" onClick={handleLogout}
                  className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-ink-2 hover:bg-canvas">
            <LogoutIcon className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
        <nav className="px-3 pb-2 flex gap-1" aria-label="Main">
          {NAV.map(({ to, label, section }) => (
            <NavLink key={to} to={to} className={topLink(inSection(section))}>{label}</NavLink>
          ))}
        </nav>
      </header>

      <main className={cx(width, "mx-auto px-4 sm:px-8 py-8 sm:py-10 animate-fade-up")}>{children}</main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }: {
  eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8">
      <div className="min-w-0">
        {eyebrow && (
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <div className="mt-1.5 text-ink-2">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function BackLink({ to = "/events", children = "Back to events" }: { to?: string; children?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}
            className="group inline-flex items-center gap-1 text-sm font-medium text-ink-2 hover:text-accent mb-5 -ml-1">
      <ChevronLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      {children}
    </button>
  );
}

export function Card({ className, children, as: Tag = "div", ...rest }: {
  className?: string; children: ReactNode; as?: "div" | "section" | "article";
} & Record<string, unknown>) {
  return (
    <Tag className={cx("bg-white rounded-xl border border-hair shadow-card", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-ink-2">
        <span className="w-8 h-8 rounded-full border-[3px] border-accent-soft border-t-accent animate-spin" />
        <p className="text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function EmptyState({ illustration, title, children, action }: {
  illustration: ReactNode; title?: ReactNode; children?: ReactNode; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-12">
      <div className="w-52 max-w-full mb-6 animate-float">{illustration}</div>
      {title && <h3 className="text-base font-semibold text-ink mb-1">{title}</h3>}
      {children && <div className="text-sm text-ink-2 max-w-sm leading-relaxed">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------- controls ---------- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-sm hover:bg-accent-hover",
  secondary: "bg-white text-ink border border-hair shadow-sm hover:bg-canvas hover:border-line",
  ghost: "text-ink-2 hover:text-accent hover:bg-accent-soft",
  danger: "bg-danger text-white shadow-sm hover:bg-[#be123c]",
  "danger-ghost": "text-danger hover:bg-danger-soft",
};

export function Button({ variant = "primary", size = "md", className, children, ...rest }: {
  variant?: Variant; size?: "sm" | "md" | "lg";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-11 px-5 text-[15px]" };
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        VARIANTS[variant], sizes[size], className,
      )}
    >
      {children}
    </button>
  );
}

const FIELD = cx(
  "w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-3 shadow-sm",
  "transition focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10",
);

export function Field({ id, label, hint, children }: { id: string; label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink mb-1.5">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cx(FIELD, "h-10", className)} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cx(FIELD, "min-h-[96px] resize-y", className)} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...rest} className={cx(FIELD, "h-10 appearance-none pr-9 cursor-pointer", className)}>
        {children}
      </select>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3"
           fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ---------- feedback ---------- */

export function Alert({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: ReactNode }) {
  const tones = {
    error: { box: "bg-danger-soft text-danger border-danger/20", Icon: AlertIcon },
    success: { box: "bg-success-soft text-success border-success/20", Icon: CheckIcon },
    info: { box: "bg-accent-soft text-accent border-accent/20", Icon: InfoIcon },
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"}
         className={cx("flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm mb-5 animate-fade-up", tones.box)}>
      <tones.Icon className="w-[18px] h-[18px] shrink-0 mt-px" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export function Badge({ tone = "gray", children }: { tone?: "blue" | "green" | "gray" | "orange"; children: ReactNode }) {
  const tones = {
    blue: "bg-accent-soft text-accent ring-accent/20",
    green: "bg-success-soft text-success ring-success/20",
    gray: "bg-canvas text-ink-2 ring-hair",
    orange: "bg-warning-soft text-warning ring-warning/20",
  };
  return (
    <span className={cx("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset whitespace-nowrap", tones[tone])}>
      {children}
    </span>
  );
}

export function Avatar({ name, size = "md" }: { name?: string; size?: "sm" | "md" }) {
  const palette = ["#4f46e5", "#7c3aed", "#db2777", "#ea580c", "#0891b2", "#059669", "#2563eb"];
  const hash = Array.from(name ?? "").reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const dims = size === "sm" ? "w-7 h-7 text-[11px]" : "w-9 h-9 text-xs";
  return (
    <span aria-hidden="true" style={{ background: palette[hash % palette.length] }}
          className={cx("inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0", dims)}>
      {initials(name)}
    </span>
  );
}

/** Score tile: a label <p> followed by a value <p> (tests read the value after the label). */
export function StatTile({ label, value, max = 5, accent = "#4f46e5", elevated = false }: {
  label: string; value: number | string | null | undefined; max?: number | null; accent?: string;
  /** White card with a border, for tiles placed directly on the page background. */
  elevated?: boolean;
}) {
  const numeric = typeof value === "number" ? value : null;
  const shown = numeric !== null && max ? numeric.toFixed(1) : value ?? "-";
  return (
    <div className={cx("rounded-xl px-4 py-4 h-full", elevated ? "bg-white border border-hair shadow-card" : "bg-canvas border border-hair")}>
      <p className="text-xs font-medium text-ink-2">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-ink tabular-nums">{shown}</p>
      {max && (
        <div className="mt-3 h-1.5 rounded-full bg-hair overflow-hidden" aria-hidden="true">
          <div className="h-full rounded-full animate-grow"
               style={{ width: `${numeric ? (numeric / max) * 100 : 0}%`, background: accent }} />
        </div>
      )}
    </div>
  );
}
