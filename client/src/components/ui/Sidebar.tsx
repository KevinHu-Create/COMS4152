import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  COURSE_CHANGE_EVENT, getCourses, getCurrentCourseId, getPendingEvaluations, getUser,
  isCourseStaff, setCurrentCourseId, type Course,
} from "../../api";
import { AppMark } from "./illustrations";
import { CalendarIcon, LogoutIcon, PlusIcon, QuoteIcon, UsersIcon } from "./icons";
import { cx, initials } from "./format";
import { Avatar } from "./ui";

// Last loaded sidebar data, shown straight away on the next page while it refreshes.
let cache: { courses: Course[]; pending: number } | null = null;

const ROLE_NAMES: Record<string, string> = { instructor: "Instructor", ta: "TA", student: "Student", admin: "Admin" };

// iOS-style icon tiles
const TILE = {
  blue: "from-[#3b9bff] to-[#0a6cff]",
  orange: "from-[#ffb340] to-[#ff8a00]",
  green: "from-[#4cd964] to-[#22b04a]",
  gray: "from-[#a1a1aa] to-[#71717a]",
};
const COURSE_TILES = [
  "from-[#a78bfa] to-[#7c3aed]",
  "from-[#5eead4] to-[#0d9488]",
  "from-[#f9a8d4] to-[#db2777]",
  "from-[#93c5fd] to-[#2563eb]",
  "from-[#fcd34d] to-[#d97706]",
];

function Tile({ gradient, children }: { gradient: string; children: ReactNode }) {
  return (
    <span className={cx("w-7 h-7 shrink-0 rounded-[8px] bg-gradient-to-b text-white flex items-center justify-center shadow-sm", gradient)}>
      {children}
    </span>
  );
}

function rowClass(active: boolean) {
  return cx(
    "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13.5px] text-left transition-colors",
    active ? "bg-white text-ink font-medium shadow-sm ring-1 ring-black/5" : "text-ink-2 hover:bg-black/[0.04] hover:text-ink",
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="px-2 pt-5 pb-1.5 text-[11px] font-semibold text-ink-3">{children}</p>;
}

/** Calendar-icon style date card with the user's status for today. */
function TodayCard({ status }: { status: ReactNode }) {
  const now = new Date();
  return (
    <div className="mx-1 flex items-center gap-3 rounded-xl bg-white/80 ring-1 ring-black/5 shadow-sm p-2.5">
      <div className="w-12 shrink-0 overflow-hidden rounded-[10px] bg-white ring-1 ring-black/10 text-center shadow-sm">
        <p className="bg-[#ff3b30] text-white text-[9px] font-semibold tracking-wider leading-[15px]">
          {now.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
        </p>
        <p className="text-[22px] font-light leading-[30px] text-ink tabular-nums">{now.getDate()}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink leading-tight">
          {now.toLocaleDateString("en-US", { weekday: "long" })}
        </p>
        <p className="text-xs text-ink-3">{now.toLocaleDateString("en-US", { month: "long", day: "numeric" })}</p>
        <p className="text-xs text-ink-2 mt-0.5 truncate">{status}</p>
      </div>
    </div>
  );
}

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = getUser();
  const [data, setData] = useState(cache);
  const [currentId, setCurrentId] = useState(getCurrentCourseId());

  useEffect(() => {
    let alive = true;
    Promise.all([getCourses(), getPendingEvaluations()])
      .then(([courses, pending]) => {
        cache = { courses: Array.isArray(courses) ? courses : [], pending: Array.isArray(pending) ? pending.length : 0 };
        if (alive) setData(cache);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [pathname]);

  useEffect(() => {
    const follow = (e: Event) => setCurrentId((e as CustomEvent<number>).detail);
    window.addEventListener(COURSE_CHANGE_EVENT, follow);
    return () => window.removeEventListener(COURSE_CHANGE_EVENT, follow);
  }, []);

  const courses = data?.courses ?? [];
  const pending = data?.pending ?? 0;
  const current = courses.find((c) => c.id === currentId) ?? courses[0] ?? null;
  const teaching = courses.filter((c) => isCourseStaff(c)).length;
  const canCreateCourse = user?.role === "instructor" || user?.role === "admin";
  // The to-do count is for students; staff do not evaluate their own course.
  const showPending = teaching === 0;
  const inEvents = ["/events", "/evaluation", "/admin", "/event/"].some((p) => pathname.startsWith(p));

  const status = !data
    ? " "
    : teaching > 0
      ? `Teaching ${teaching} ${teaching === 1 ? "course" : "courses"}`
      : showPending && pending > 0
        ? `${pending} ${pending === 1 ? "talk" : "talks"} to evaluate`
        : "Nothing to evaluate";

  function openCourse(course: Course) {
    setCurrentCourseId(course.id);
    setCurrentId(course.id);
    if (pathname !== "/events") navigate("/events");
  }

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-20 w-64 flex-col bg-[#f2f2f5]/85 backdrop-blur-2xl backdrop-saturate-150 border-r border-black/[0.06]">
      <div className="h-16 shrink-0 flex items-center px-4">
        <button type="button" onClick={() => navigate("/events")} className="flex items-center gap-2.5"
                aria-label="Presentation Evaluations home">
          <AppMark className="w-8 h-8 drop-shadow-sm" />
          <span className="text-left leading-tight">
            <span className="block text-[15px] font-semibold text-ink">Evaluations</span>
            <span className="block text-xs text-ink-3">Peer feedback for talks</span>
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <TodayCard status={status} />

        <nav aria-label="Main">
          <SectionTitle>Menu</SectionTitle>
          <NavLink to="/events" className={rowClass(inEvents)}>
            <Tile gradient={TILE.blue}><CalendarIcon className="w-4 h-4" /></Tile>
            <span className="flex-1">Events</span>
            {showPending && pending > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#ff3b30] text-white text-[11px] font-semibold flex items-center justify-center"
                    title={`${pending} to evaluate`}>
                {pending}
              </span>
            )}
          </NavLink>
          <NavLink to="/feedback" className={rowClass(pathname.startsWith("/feedback"))}>
            <Tile gradient={TILE.orange}><QuoteIcon className="w-4 h-4" /></Tile>
            <span className="flex-1">My Feedback</span>
          </NavLink>
        </nav>

        {courses.length > 0 && (
          <>
            <SectionTitle>My Courses</SectionTitle>
            <ul className="space-y-0.5">
              {courses.map((c, i) => {
                const active = c.id === current?.id;
                return (
                  <li key={c.id}>
                    <button type="button" onClick={() => openCourse(c)} className={rowClass(active && inEvents)}
                            aria-current={active ? "true" : undefined}>
                      <Tile gradient={COURSE_TILES[i % COURSE_TILES.length]}>
                        <span className="text-[10px] font-bold">{initials(c.title)}</span>
                      </Tile>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{c.course_code}{c.section ? `-${c.section}` : ""}</span>
                        <span className="block truncate text-[11px] text-ink-3 font-normal">{c.title}</span>
                      </span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {(canCreateCourse || isCourseStaff(current)) && (
          <>
            <SectionTitle>Manage</SectionTitle>
            {current && isCourseStaff(current) && (
              <NavLink to={`/courses/${current.id}/members`} className={rowClass(pathname.endsWith("/members"))}>
                <Tile gradient={TILE.green}><UsersIcon className="w-4 h-4" /></Tile>
                <span>Course roster</span>
              </NavLink>
            )}
            {canCreateCourse && (
              <NavLink to="/courses/new" className={rowClass(pathname === "/courses/new")}>
                <Tile gradient={TILE.gray}><PlusIcon className="w-4 h-4" /></Tile>
                <span>Add a course</span>
              </NavLink>
            )}
          </>
        )}
      </div>

      {user && (
        <div className="shrink-0 p-3">
          <div className="rounded-xl bg-white/80 ring-1 ring-black/5 shadow-sm p-2">
            <div className="flex items-center gap-2.5 px-1 py-1">
              <Avatar name={user.name} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-ink truncate">{user.name}</p>
                <p className="text-[11px] text-ink-3">{ROLE_NAMES[user.role] ?? user.role}</p>
              </div>
            </div>
            <button type="button" onClick={onLogout}
                    className="mt-1 w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[13px] text-ink-2 hover:text-danger hover:bg-danger-soft">
              <LogoutIcon className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
