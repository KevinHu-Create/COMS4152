// Small line icons (24px grid, 1.8 stroke) in the style of SF Symbols.
type IconProps = { className?: string };

function Icon({ className = "w-4 h-4", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
         strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Icon>
);
export const ClockIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Icon>
);
export const PinIcon = (p: IconProps) => (
  <Icon {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" /><circle cx="12" cy="10" r="2.3" /></Icon>
);
export const PersonIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="8" r="3.6" /><path d="M5 20c.9-3.6 3.6-5.5 7-5.5s6.1 1.9 7 5.5" /></Icon>
);
export const UsersIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="9" cy="8.5" r="3.2" /><path d="M3 19.5c.8-3.2 3.1-4.9 6-4.9s5.2 1.7 6 4.9" /><path d="M15.5 5.6a3.2 3.2 0 0 1 0 6M17.5 14.9c1.7.6 2.9 2.1 3.4 4.6" /></Icon>
);
export const PlusIcon = (p: IconProps) => (
  <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
);
export const ChartIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4 20h16" /><rect x="6" y="11" width="3" height="6" rx="1" /><rect x="11" y="7" width="3" height="10" rx="1" /><rect x="16" y="4" width="3" height="13" rx="1" /></Icon>
);
export const PencilIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z" /><path d="M14.5 6.5l3 3" /></Icon>
);
export const CheckIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Icon>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <Icon {...p}><path d="M14.5 5.5L8 12l6.5 6.5" /></Icon>
);
export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}><path d="M9.5 5.5L16 12l-6.5 6.5" /></Icon>
);
export const AlertIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.8v5M12 16.2v.01" /></Icon>
);
export const InfoIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 7.8v.01" /></Icon>
);
export const TrashIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4.5 7h15M10 4h4M6.5 7l1 12.5h9l1-12.5M10 11v5M14 11v5" /></Icon>
);
export const LogoutIcon = (p: IconProps) => (
  <Icon {...p}><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" /></Icon>
);
export const QuoteIcon = (p: IconProps) => (
  <Icon {...p}><path d="M9 7H6a2 2 0 0 0-2 2v3h4v4H4M20 7h-3a2 2 0 0 0-2 2v3h4v4h-4" /></Icon>
);
