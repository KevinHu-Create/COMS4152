import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPresentations, createPresentation, getUser, logout, getCourseMembers, getCourses, getPendingEvaluations,
  getCurrentCourseId, setCurrentCourseId, isCourseStaff, courseLabel, type Course,
} from "../../api";

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

function Badge({ children, tone }: { children: string; tone: "blue" | "green" | "gray" }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tones[tone]}`}>{children}</span>;
}

function timeRange(event: EventItem) {
  if (event.startTime && event.endTime) return `${event.startTime} - ${event.endTime}`;
  return event.startTime || "";
}

interface Member {
  id: number;
  name: string;
  role: string;
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
        setNewTitle("");
        setNewDate("");
        setNewStart("");
        setNewEnd("");
        setNewLocation("");
        setNewDescription("");
        setSelectedPresenters([]);
        setFormError("");
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

  function handleLogout() {
    logout();
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Presentation Events
            </h1>
            <p className="text-gray-600">
              Welcome, {user?.name} ({user?.role})
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/feedback")}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              My Feedback
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          {courses.length > 0 && (
            <div className="flex-1 min-w-[16rem]">
              <label htmlFor="course-select" className="block text-xs font-medium text-gray-600 mb-1">
                Course
              </label>
              <select
                id="course-select"
                value={course?.id ?? ""}
                onChange={(e) => selectCourse(courses.find((c) => c.id === Number(e.target.value)) ?? null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {courseLabel(c)}
                  </option>
                ))}
              </select>
            </div>
          )}
          {isStaff && course && (
            <button
              onClick={() => navigate(`/courses/${course.id}/members`)}
              className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
            >
              Manage Members
            </button>
          )}
          {canCreateCourse && (
            <button
              onClick={() => navigate("/courses/new")}
              className="px-3 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 text-sm"
            >
              + New Course
            </button>
          )}
        </div>

        {!course ? (
          <p className="text-gray-500 text-center py-8">
            You are not enrolled in any course yet.
            {canCreateCourse ? " Create a course to get started." : " Ask your instructor to add you."}
          </p>
        ) : (
          <>
            {isStudent && (
              <section className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-lg" aria-labelledby="pending-heading">
                <h2 id="pending-heading" className="text-lg font-semibold text-amber-900 mb-2">
                  Waiting for your evaluation
                </h2>
                {pending.length === 0 ? (
                  <p className="text-sm text-amber-800">You're all caught up! No presentations are waiting for your evaluation.</p>
                ) : (
                  <ul className="space-y-2">
                    {pending.map((p) => (
                      <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 bg-white border border-amber-100 rounded-lg px-3 py-2">
                        <div>
                          <p className="font-medium text-gray-900">{p.title}</p>
                          <p className="text-xs text-gray-600">
                            {p.date}{p.startTime ? ` ${p.startTime}` : ""} - {p.presenters.join(", ") || "TBD"}
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/evaluation/${p.id}`)}
                          className="px-3 py-1 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-700"
                        >
                          Evaluate
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            <p className="text-gray-600 mb-6">
              Select a presentation to submit an evaluation or view details.
            </p>

            {isStaff && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  + Create Event
                </button>
              </div>
            )}

            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No presentations yet.</p>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="border p-4 rounded-lg shadow-sm hover:shadow transition cursor-pointer bg-white"
                    onClick={() => navigate(`/evaluation/${event.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-semibold">{event.title}</h2>
                          {event.isMine && <Badge tone="blue">Your presentation</Badge>}
                          {event.evaluatedByMe && <Badge tone="green">Evaluated</Badge>}
                          {event.upcoming && <Badge tone="gray">Upcoming</Badge>}
                        </div>
                        <p className="text-gray-600 mt-1">
                          Date: {event.date}
                          {timeRange(event) && <span className="ml-3">Time: {timeRange(event)}</span>}
                        </p>
                        {event.location && <p className="text-gray-600">Location: {event.location}</p>}
                        <p className="text-gray-600">Presenter: {event.presenter || "TBD"}</p>
                      </div>
                      {isStaff && (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/results/${event.id}`);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            View Results
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/event/edit/${event.id}`);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Create New Event</h3>

              {formError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {formError}
                </div>
              )}

              <label className="block mb-2 text-sm font-medium">Event Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border rounded-lg p-2 mb-3"
              />

              <label className="block mb-2 text-sm font-medium">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full border rounded-lg p-2 mb-3"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-2 text-sm font-medium">Start Time</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full border rounded-lg p-2 mb-3"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">End Time</label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full border rounded-lg p-2 mb-3"
                  />
                </div>
              </div>

              <label className="block mb-2 text-sm font-medium">Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full border rounded-lg p-2 mb-3"
              />

              <label className="block mb-2 text-sm font-medium">Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full border rounded-lg p-2 mb-3"
              />

              <label className="block mb-2 text-sm font-medium">Select Presenters</label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 mb-4">
                {members.length === 0 ? (
                  <p className="text-gray-500 text-sm">No students available</p>
                ) : (
                  members.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPresenters.includes(member.id)}
                        onChange={() => togglePresenter(member.id)}
                        className="w-4 h-4"
                      />
                      <span>{member.name}</span>
                    </label>
                  ))
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                  onClick={() => { setShowForm(false); setFormError(""); }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleCreateEvent}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
