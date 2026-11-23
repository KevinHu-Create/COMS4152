import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deletePresentation, getCourse, getCourseMembers, getPresentation, getUser,
  isCourseStaff, updatePresentation,
} from "../../api";

interface Member {
  id: number;
  name: string;
  role: string;
}

export function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const presentationId = Number(id);
  const user = getUser();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [students, setStudents] = useState<Member[]>([]);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [presenterIds, setPresenterIds] = useState<number[]>([]);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    load();
  }, [presentationId]);

  async function load() {
    try {
      const data = await getPresentation(presentationId);
      if (!data.id) {
        setLoadError(data.error || "Event not found.");
        return;
      }
      setTitle(data.title ?? "");
      setDate(data.date ?? "");
      setStartTime(data.startTime ?? "");
      setEndTime(data.endTime ?? "");
      setLocation(data.location ?? "");
      setDescription(data.description ?? "");
      setPresenterIds((data.presenters ?? []).map((p: { id: number }) => p.id));

      const [course, members] = await Promise.all([getCourse(data.courseId), getCourseMembers(data.courseId)]);
      setCanEdit(isCourseStaff(course));
      if (Array.isArray(members)) setStudents(members.filter((m: Member) => m.role === "student"));
    } catch (err) {
      setLoadError("Failed to load the event.");
    } finally {
      setLoading(false);
    }
  }

  function togglePresenter(memberId: number) {
    setPresenterIds((ids) => (ids.includes(memberId) ? ids.filter((x) => x !== memberId) : [...ids, memberId]));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !date) {
      setError("Please enter a title and a date.");
      return;
    }
    setSaving(true);
    try {
      const result = await updatePresentation(presentationId, {
        title: title.trim(),
        presentation_date: date,
        start_time: startTime,
        end_time: endTime,
        location,
        description,
        presenter_ids: presenterIds,
      });
      if (result.id) {
        navigate("/events");
      } else {
        setError(result.errors?.join(", ") || result.error || "Could not save the event.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${title}"? Its evaluations will be deleted too.`)) return;
    const result = await deletePresentation(presentationId);
    if (result.error || result.errors) {
      setError(result.errors?.join(", ") || result.error);
    } else {
      navigate("/events");
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6">
        <button
          type="button"
          onClick={() => navigate("/events")}
          className="text-xs text-blue-600 hover:text-blue-700 mb-2"
        >
          Back to events
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Event</h1>

        {loadError ? (
          <p className="text-red-600 font-semibold">{loadError}</p>
        ) : !canEdit ? (
          <p className="text-red-600 font-semibold">Only the course's instructors and TAs can edit events.</p>
        ) : (
          <>
            <p className="text-gray-600 mb-4">Update the presentation details below.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input id="event-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="event-start" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input id="event-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="event-end" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input id="event-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input id="event-location" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="event-description" value={description} onChange={(e) => setDescription(e.target.value)}
                          className={`${inputClass} min-h-[90px]`} />
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-1">Presenters</p>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {students.length === 0 ? (
                    <p className="text-gray-500 text-sm">No students available</p>
                  ) : (
                    students.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                        <input type="checkbox" checked={presenterIds.includes(m.id)} onChange={() => togglePresenter(m.id)}
                               className="w-4 h-4" />
                        <span>{m.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button type="button" onClick={handleDelete}
                        className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">
                  Delete Event
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => navigate("/events")}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
