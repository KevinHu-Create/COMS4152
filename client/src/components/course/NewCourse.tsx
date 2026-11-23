import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse, getUser, setCurrentCourseId } from "../../api";

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

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <button
          type="button"
          onClick={() => navigate("/events")}
          className="text-xs text-blue-600 hover:text-blue-700 mb-2"
        >
          Back to events
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Create a Course</h1>

        {!canCreate ? (
          <p className="text-red-600">Only instructors can create courses.</p>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="course_code" className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input id="course_code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)}
                       placeholder="COMS4152" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <input id="term" value={term} onChange={(e) => setTerm(e.target.value)}
                         placeholder="Fall 2026" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">Section (optional)</label>
                  <input id="section" value={section} onChange={(e) => setSection(e.target.value)}
                         placeholder="001" className={inputClass} />
                </div>
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                <input id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                       placeholder="Engineering Software-as-a-Service" className={inputClass} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => navigate("/events")}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Creating..." : "Create Course"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
