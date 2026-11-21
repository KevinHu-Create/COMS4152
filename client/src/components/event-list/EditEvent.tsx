import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deletePresentation, getCourse, getCourseMembers, getPresentation, getUser,
  isCourseStaff, updatePresentation,
} from "../../api";
import { Alert, AppShell, BackLink, Button, Card, EmptyState, Field, Input, LoadingScreen, Textarea } from "../ui/ui";
import { LockedIllustration } from "../ui/illustrations";
import { TrashIcon } from "../ui/icons";

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
    } catch {
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
    } catch {
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

  if (loading) return <LoadingScreen />;

  if (loadError || !canEdit) {
    return (
      <AppShell width="max-w-3xl">
        <BackLink />
        <Card>
          <EmptyState illustration={<LockedIllustration />}
                      title={loadError || "Only the course's instructors and TAs can edit events."} />
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell width="max-w-3xl">
      <BackLink />
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">{title || "Event"}</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Edit Event</h1>
        <p className="text-ink-2 mt-2">Update the presentation details below.</p>
      </div>

      <Card className="p-6 sm:p-8">
        {error && <Alert>{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field id="event-title" label="Event Title">
            <Input id="event-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field id="event-date" label="Date">
              <Input id="event-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field id="event-start" label="Start Time">
              <Input id="event-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </Field>
            <Field id="event-end" label="End Time">
              <Input id="event-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </Field>
          </div>
          <Field id="event-location" label="Location">
            <Input id="event-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </Field>
          <Field id="event-description" label="Description">
            <Textarea id="event-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <fieldset>
            <legend className="block text-sm font-medium text-ink mb-1.5">Presenters</legend>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-hair divide-y divide-hair">
              {students.length === 0 ? (
                <p className="text-ink-3 text-sm p-3">No students available</p>
              ) : (
                students.map((m) => (
                  <label key={m.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-canvas">
                    <input type="checkbox" checked={presenterIds.includes(m.id)} onChange={() => togglePresenter(m.id)}
                           className="w-4 h-4 accent-accent" />
                    <span>{m.name}</span>
                  </label>
                ))
              )}
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => navigate("/events")}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6 sm:p-8 mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Delete this event</h2>
            <p className="text-sm text-ink-2 mt-0.5">Its evaluations are deleted too. This cannot be undone.</p>
          </div>
          <Button variant="danger-ghost" onClick={handleDelete} className="border border-danger/30">
            <TrashIcon className="w-4 h-4" />
            Delete Event
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
