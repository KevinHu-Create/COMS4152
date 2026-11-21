import { useNavigate, NavLink } from "react-router-dom";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { getUser, logout } from "../../api";
import { AlertIcon, CheckIcon, ChevronLeftIcon, InfoIcon, LogoutIcon } from "./icons";
import { AppMark } from "./illustrations";
import { cx, initials } from "./format";

/* ---------- layout ---------- */

const ROLE_NAMES: Record<string, string> = { instructor: "Instructor", ta: "TA", student: "Student", admin: "Admin" };

export function AppShell({ children, width = "max-w-5xl" }: { children: ReactNode; width?: string }) {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const link = ({ isActive }: { isActive: boolean }) =>
    cx("px-3 py-1.5 rounded-full text-sm transition-colors",
       isActive ? "bg-ink text-white" : "text-ink-2 hover:text-ink hover:bg-black/5");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-white/75 backdrop-blur-xl backdrop-saturate-150 border-b border-black/5">
        <div className={cx(width, "mx-auto px-4 sm:px-6 h-14 flex items-center gap-3")}>
          <button type="button" onClick={() => navigate("/events")} className="flex items-center gap-2 shrink-0"
                  aria-label="Presentation Evaluations home">
            <AppMark className="w-7 h-7" />
            <span className="hidden sm:inline font-semibold tracking-tight">Evaluations</span>
          </button>
          <nav className="flex items-center gap-1 ml-1 sm:ml-4" aria-label="Main">
            <NavLink to="/events" className={link}>Events</NavLink>
            <NavLink to="/feedback" className={link}>My Feedback</NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3 min-w-0">
            {user && (
              <div className="hidden md:flex items-center gap-2 min-w-0">
                <Avatar name={user.name} size="sm" />
                <span className="text-sm text-ink truncate max-w-[10rem]">{user.name}</span>
                <span className="text-xs text-ink-3">{ROLE_NAMES[user.role] ?? user.role}</span>
              </div>
            )}
            <button type="button" onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-ink-2 hover:text-ink hover:bg-black/5">
              <LogoutIcon className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className={cx(width, "mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-up")}>{children}</main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }: {
  eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div className="min-w-0">
        {eyebrow && <p className="text-sm font-medium text-accent mb-1">{eyebrow}</p>}
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <div className="mt-2 text-ink-2 text-[15px] leading-relaxed">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function BackLink({ to = "/events", children = "Back to events" }: { to?: string; children?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}
            className="inline-flex items-center gap-1 text-sm text-accent hover:underline mb-4 -ml-1">
      <ChevronLeftIcon className="w-4 h-4" />
      {children}
    </button>
  );
}

export function Card({ className, children, as: Tag = "div", ...rest }: {
  className?: string; children: ReactNode; as?: "div" | "section" | "article";
} & Record<string, unknown>) {
  return (
    <Tag className={cx("bg-white rounded-3xl shadow-card", className)} {...rest}>
      {children}
    </Tag>
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-ink-2">
        <span className="w-7 h-7 rounded-full border-[3px] border-hair border-t-accent animate-spin" />
        <p className="text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function EmptyState({ illustration, title, children, action }: {
  illustration: ReactNode; title?: ReactNode; children?: ReactNode; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-10">
      <div className="w-56 max-w-full mb-6">{illustration}</div>
      {title && <h3 className="text-lg font-semibold text-ink mb-1">{title}</h3>}
      {children && <div className="text-ink-2 max-w-md leading-relaxed">{children}</div>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------- controls ---------- */

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-hover shadow-sm",
  secondary: "bg-[#e8e8ed] text-ink hover:bg-[#dcdce1]",
  ghost: "text-accent hover:bg-accent-soft",
  danger: "bg-danger text-white hover:bg-[#c00013]",
  "danger-ghost": "text-danger hover:bg-danger-soft",
};

export function Button({ variant = "primary", size = "md", className, children, ...rest }: {
  variant?: Variant; size?: "sm" | "md" | "lg";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-[15px]", lg: "px-6 py-3 text-base" };
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant], sizes[size], className,
      )}
    >
      {children}
    </button>
  );
}

const FIELD = cx(
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-3",
  "transition-shadow focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/15",
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
  return <input {...rest} className={cx(FIELD, className)} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cx(FIELD, "min-h-[96px] resize-y", className)} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...rest} className={cx(FIELD, "appearance-none pr-10 cursor-pointer", className)}>
        {children}
      </select>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3"
           fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

/* ---------- feedback ---------- */

export function Alert({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: ReactNode }) {
  const tones = {
    error: { box: "bg-danger-soft text-danger", Icon: AlertIcon },
    success: { box: "bg-success-soft text-success", Icon: CheckIcon },
    info: { box: "bg-accent-soft text-accent", Icon: InfoIcon },
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"}
         className={cx("flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm mb-5", tones.box)}>
      <tones.Icon className="w-5 h-5 shrink-0 mt-px" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export function Badge({ tone = "gray", children }: { tone?: "blue" | "green" | "gray" | "orange"; children: ReactNode }) {
  const tones = {
    blue: "bg-accent-soft text-accent",
    green: "bg-success-soft text-success",
    gray: "bg-[#f0f0f3] text-ink-2",
    orange: "bg-warning-soft text-warning",
  };
  return (
    <span className={cx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", tones[tone])}>
      {children}
    </span>
  );
}

export function Avatar({ name, size = "md" }: { name?: string; size?: "sm" | "md" }) {
  const palette = ["#0071e3", "#5e5ce6", "#bf5af2", "#ff375f", "#ff9f0a", "#30b0c7", "#34c759"];
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
export function StatTile({ label, value, max = 5, accent = "#0071e3", elevated = false }: {
  label: string; value: number | string | null | undefined; max?: number | null; accent?: string;
  /** White card with a shadow, for tiles placed directly on the grey page background. */
  elevated?: boolean;
}) {
  const numeric = typeof value === "number" ? value : null;
  const shown = numeric !== null && max ? numeric.toFixed(1) : value ?? "-";
  return (
    <div className={cx("rounded-2xl px-4 py-4 h-full", elevated ? "bg-white shadow-card" : "bg-canvas")}>
      <p className="text-xs font-medium text-ink-2">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">{shown}</p>
      {max && (
        <div className="mt-3 h-1.5 rounded-full bg-hair overflow-hidden" aria-hidden="true">
          <div className="h-full rounded-full" style={{ width: `${numeric ? (numeric / max) * 100 : 0}%`, background: accent }} />
        </div>
      )}
    </div>
  );
}
