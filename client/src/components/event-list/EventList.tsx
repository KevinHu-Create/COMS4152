import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  getPresentations, createPresentation, getUser, getCourseMembers, getCourses, getPendingEvaluations,
  getCurrentCourseId, setCurrentCourseId, isCourseStaff, courseLabel, type Course,
} from "../../api";
import { Alert, AppShell, Badge, Button, Card, EmptyState, Field, Input, LoadingScreen, PageHeader, Select, Textarea } from "../ui/ui";
import { cx, formatDate } from "../ui/format";
import { AllDoneIllustration, CoursesIllustration, EmptyCalendarIllustration } from "../ui/illustrations";
import { ChartIcon, CheckIcon, ChevronRightIcon, ClockIcon, PencilIcon, PersonIcon, PinIcon, PlusIcon, UsersIcon } from "../ui/icons";

interface EventItem {
  id: number;
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  presenter: string;
  isMine: boolean;
  evaluatedByMe: boolean;
  upcoming: boolean;
}

interface PendingItem {
  id: number;
  title: string;
  date: string;
  startTime: string | null;
  presenters: string[];
}

interface Member {
  id: number;
  name: string;
  role: string;
}

function timeRange(event: { startTime: string | null; endTime?: string | null }) {
  if (event.startTime && event.endTime) return `${event.startTime} – ${event.endTime}`;
  return event.startTime || "";
}

/** Calendar-style date tile: month on top, day below. */
function DateTile({ date, muted }: { date: string; muted?: boolean }) {
  return (
    <div className={cx("w-14 shrink-0 self-start rounded-2xl text-center py-2", muted ? "bg-[#f0f0f3]" : "bg-accent-soft")}>
      <p className={cx("text-[11px] font-semibold uppercase tracking-wide", muted ? "text-ink-3" : "text-accent")}>
        {formatDate(date, { weekday: undefined, day: undefined, year: undefined, month: "short" })}
      </p>
      <p className="text-2xl font-semibold leading-tight text-ink">
        {formatDate(date, { weekday: undefined, month: undefined, year: undefined, day: "numeric" })}
      </p>
    </div>
  );
}

export function EventList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedPresenters, setSelectedPresenters] = useState<number[]>([]);
  const [formError, setFormError] = useState("");

  const user = getUser();
  const isStaff = isCourseStaff(course);
  const isStudent = course?.my_role === "student";
  const canCreateCourse = user?.role === "instructor" || user?.role === "admin";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      const data = await getCourses();
      const list = Array.isArray(data) ? data : [];
      setCourses(list);
      const savedId = getCurrentCourseId();
      await selectCourse(list.find((c) => c.id === savedId) ?? list[0] ?? null);
    } catch (err) {
      console.error("Failed to load courses", err);
    } finally {
      setLoading(false);
    }
  }

  async function selectCourse(next: Course | null) {
    setCourse(next);
    setEvents([]);
    setMembers([]);
    setPending([]);
    setShowForm(false);
    if (!next) return;

    setCurrentCourseId(next.id);
    await Promise.all([loadEvents(next.id), loadMembers(next.id), loadPending(next.id)]);
  }

  async function loadPending(courseId: number) {
    try {
      const data = await getPendingEvaluations(courseId);
      if (Array.isArray(data)) setPending(data);
    } catch (err) {
      console.error("Failed to load pending evaluations", err);
    }
  }

  async function loadMembers(courseId: number) {
    try {
      const data = await getCourseMembers(courseId);
      if (Array.isArray(data)) {
        setMembers(data.filter((m: Member) => m.role === "student"));
      }
    } catch (err) {
      console.error("Failed to load members", err);
    }
  }

  async function loadEvents(courseId: number) {
    try {
      const data = await getPresentations(courseId);
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.error("Failed to load events", err);
    }
  }

  function resetForm() {
    setNewTitle("");
    setNewDate("");
    setNewStart("");
    setNewEnd("");
    setNewLocation("");
    setNewDescription("");
    setSelectedPresenters([]);
    setFormError("");
  }

  async function handleCreateEvent() {
    if (!course) return;
    if (!newTitle.trim() || !newDate.trim()) {
      setFormError("Please enter a title and a date.");
      return;
    }

    try {
      const result = await createPresentation(course.id, {
        title: newTitle,
        presentation_date: newDate,
        start_time: newStart || undefined,
        end_time: newEnd || undefined,
        location: newLocation || undefined,
        description: newDescription || undefined,
        presenter_ids: selectedPresenters,
      });

      if (result.id) {
        loadEvents(course.id);
        resetForm();
        setShowForm(false);
      } else {
        setFormError(result.errors?.join(", ") || result.error || "Could not create the event.");
      }
    } catch (err) {
      console.error("Failed to create event", err);
    }
  }

  function togglePresenter(id: number) {
    if (selectedPresenters.includes(id)) {
      setSelectedPresenters(selectedPresenters.filter((p) => p !== id));
    } else {
      setSelectedPresenters([...selectedPresenters, id]);
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <AppShell>
      <PageHeader
        eyebrow={course ? courseLabel(course) : undefined}
        title="Presentation Events"
        subtitle={<>Welcome, {user?.name} ({user?.role})</>}
        actions={
          <>
            {canCreateCourse && (
              <Button variant="secondary" size="sm" onClick={() => navigate("/courses/new")}>
                + New Course
              </Button>
            )}
            {isStaff && course && (
              <Button variant="secondary" size="sm" onClick={() => navigate(`/courses/${course.id}/members`)}>
                <UsersIcon className="w-4 h-4" />
                Manage Members
              </Button>
            )}
            {isStaff && (
              <Button size="sm" onClick={() => setShowForm(true)}>
                + Create Event
              </Button>
            )}
          </>
        }
      />

      {courses.length > 1 && (
        <div className="mb-8 max-w-md">
          <Field id="course-select" label="Course">
            <Select
              id="course-select"
              value={course?.id ?? ""}
              onChange={(e) => selectCourse(courses.find((c) => c.id === Number(e.target.value)) ?? null)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {courseLabel(c)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      )}

      {!course ? (
        <Card>
          <EmptyState illustration={<CoursesIllustration />} title="No courses yet">
            <p>
              You are not enrolled in any course yet.
              {canCreateCourse ? " Create a course to get started." : " Ask your instructor to add you."}
            </p>
          </EmptyState>
        </Card>
      ) : (
        <>
          {isStudent && (
            <Card as="section" aria-labelledby="pending-heading" className="mb-10 p-6 sm:p-7 border-l-4 border-l-accent">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                 <span className="w-9 h-9 shrink-0 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                   <CheckIcon className="w-5 h-5" />
                 </span>
                 <div>
                  <h2 id="pending-heading" className="text-lg font-semibold tracking-tight">
                    Waiting for your evaluation
                  </h2>
                  <p className="text-sm text-ink-2 mt-0.5">Presentations you have seen but not scored yet.</p>
                 </div>
                </div>
                {pending.length > 0 && <Badge tone="orange">{pending.length} to do</Badge>}
              </div>
              {pending.length === 0 ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 rounded-lg border border-hair bg-canvas p-5">
                  <AllDoneIllustration className="w-32 shrink-0" />
                  <p className="text-ink-2 text-center sm:text-left">
                    <span className="block font-semibold text-ink">You're all caught up!</span>
                    No presentations are waiting for your evaluation.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-hair">
                  {pending.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-medium text-ink truncate">{p.title}</p>
                        <p className="text-sm text-ink-2">
                          {formatDate(p.date)}{p.startTime ? ` · ${p.startTime}` : ""} · {p.presenters.join(", ") || "Presenter to be announced"}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => navigate(`/evaluation/${p.id}`)}>
                        Evaluate
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">All events</h2>
            <p className="text-sm text-ink-3">
              {events.length > 0 && `${events.length} ${events.length === 1 ? "event" : "events"}`}
            </p>
          </div>

          {events.length === 0 ? (
            <Card>
              <EmptyState
                illustration={<EmptyCalendarIllustration />}
                action={isStaff && <Button onClick={() => setShowForm(true)}><PlusIcon className="w-4 h-4" />Create the first event</Button>}
              >
                <p>No presentations yet.</p>
              </EmptyState>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 stagger">
              {events.map((event) => (
                <Card
                  key={event.id}
                  as="article"
                  data-testid="event-card"
                  className="group p-5 cursor-pointer transition-all duration-200 hover:shadow-lift hover:-translate-y-0.5 hover:border-accent/30"
                  onClick={() => navigate(`/evaluation/${event.id}`)}
                >
                  <div className="flex gap-4">
                    <DateTile date={event.date} muted={event.upcoming} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        {event.isMine && <Badge tone="blue">Your presentation</Badge>}
                        {event.evaluatedByMe && <Badge tone="green">Evaluated</Badge>}
                        {event.upcoming && <Badge tone="gray">Upcoming</Badge>}
                      </div>
                      <h2 className="text-lg font-semibold tracking-tight leading-snug">{event.title}</h2>
                      <ul className="mt-2 space-y-1 text-sm text-ink-2">
                        <li className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-ink-3" />
                          <span>{formatDate(event.date)}{timeRange(event) && ` · ${timeRange(event)}`}</span>
                        </li>
                        {event.location && (
                          <li className="flex items-center gap-2">
                            <PinIcon className="w-4 h-4 text-ink-3" />
                            <span>{event.location}</span>
                          </li>
                        )}
                        <li className="flex items-center gap-2">
                          <PersonIcon className="w-4 h-4 text-ink-3" />
                          <span>{event.presenter ? `Presented by ${event.presenter}` : "Presenter to be announced"}</span>
                        </li>
                      </ul>
                    </div>
                    <ChevronRightIcon className="hidden sm:block w-5 h-5 text-line self-center transition-transform group-hover:translate-x-0.5" />
                  </div>
                  {isStaff && (
                    <div className="flex gap-1 mt-4 pt-3 border-t border-hair -mx-1">
                      <Button variant="ghost" size="sm"
                              onClick={(e) => { e.stopPropagation(); navigate(`/admin/results/${event.id}`); }}>
                        <ChartIcon className="w-4 h-4" />
                        View Results
                      </Button>
                      <Button variant="ghost" size="sm"
                              onClick={(e) => { e.stopPropagation(); navigate(`/event/edit/${event.id}`); }}>
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {showForm && createPortal(
        <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
             role="dialog" aria-modal="true" aria-labelledby="create-event-heading">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-lift max-h-[92vh] overflow-y-auto p-6 sm:p-8 animate-pop">
            <h3 id="create-event-heading" className="text-xl font-semibold tracking-tight mb-1">Create New Event</h3>
            <p className="text-sm text-ink-2 mb-6">Schedule a presentation for {course ? course.course_code : "this course"}.</p>

            {formError && <Alert>{formError}</Alert>}

            <div className="space-y-4">
              <Field id="new-title" label="Event Title">
                <Input id="new-title" type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                       placeholder="e.g. Final project demo" />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field id="new-date" label="Date">
                  <Input id="new-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                </Field>
                <Field id="new-start" label="Start Time">
                  <Input id="new-start" type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
                </Field>
                <Field id="new-end" label="End Time">
                  <Input id="new-end" type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
                </Field>
              </div>

              <Field id="new-location" label="Location">
                <Input id="new-location" type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)}
                       placeholder="e.g. Mudd 833" />
              </Field>

              <Field id="new-description" label="Description">
                <Textarea id="new-description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              </Field>

              <fieldset>
                <legend className="block text-sm font-medium text-ink mb-1.5">Select Presenters</legend>
                <div className="max-h-44 overflow-y-auto rounded-lg border border-hair divide-y divide-hair">
                  {members.length === 0 ? (
                    <p className="text-ink-3 text-sm p-3">No students available</p>
                  ) : (
                    members.map((member) => (
                      <label key={member.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-canvas">
                        <input
                          type="checkbox"
                          checked={selectedPresenters.includes(member.id)}
                          onChange={() => togglePresenter(member.id)}
                          className="w-4 h-4 accent-accent"
                        />
                        <span>{member.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </fieldset>
            </div>

            <div className="flex justify-end gap-2 mt-8">
              <Button variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent}>
                Create
              </Button>
            </div>
          </div>
        </div>
      , document.body)}
    </AppShell>
  );
}
