import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse, getUser, setCurrentCourseId } from "../../api";
import { Alert, AppShell, BackLink, Button, Card, EmptyState, Field, Input } from "../ui/ui";
import { CoursesIllustration, LockedIllustration } from "../ui/illustrations";

export function NewCourse() {
  const navigate = useNavigate();
  const user = getUser();
  const [courseCode, setCourseCode] = useState("");
  const [term, setTerm] = useState("");
  const [section, setSection] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const canCreate = user?.role === "instructor" || user?.role === "admin";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const result = await createCourse({
        course_code: courseCode.trim(),
        term: term.trim(),
        section: section.trim() || undefined,
        title: title.trim(),
      });
      if (result.id) {
        setCurrentCourseId(result.id);
        navigate("/events");
      } else {
        setError(result.errors?.join(", ") || result.error || "Could not create the course.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell width="max-w-2xl">
      <BackLink />
      {!canCreate ? (
        <Card>
          <EmptyState illustration={<LockedIllustration />} title="Only instructors can create courses." />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="bg-canvas/60 px-6 sm:px-10 pt-8 pb-6 flex flex-col sm:flex-row items-center gap-6 border-b border-hair">
            <CoursesIllustration className="w-36 shrink-0" />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-semibold tracking-tight">Create a Course</h1>
              <p className="text-ink-2 mt-1">You will be its instructor. Add students and TAs next.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-5">
            {error && <Alert>{error}</Alert>}
            <Field id="course_code" label="Course Code">
              <Input id="course_code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="COMS4152" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="term" label="Term">
                <Input id="term" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Fall 2026" />
              </Field>
              <Field id="section" label="Section (optional)">
                <Input id="section" value={section} onChange={(e) => setSection(e.target.value)} placeholder="001" />
              </Field>
            </div>
            <Field id="title" label="Course Title">
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Engineering Software-as-a-Service" />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => navigate("/events")}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Course"}</Button>
            </div>
          </form>
        </Card>
      )}
    </AppShell>
  );
}
