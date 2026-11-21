import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addCourseMember, courseLabel, getCourse, getCourseMembers, getUser,
  isCourseStaff, removeCourseMember, type Course,
} from "../../api";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = { instructor: "Instructor", ta: "TA", student: "Student" };

export function CourseMembers() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const user = getUser();

  const [course, setCourse] = useState<Course | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isStaff = isCourseStaff(course);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    load();
  }, [courseId]);

  async function load() {
    try {
      const data = await getCourse(courseId);
      if (data.error) {
        setLoadError(data.error);
        return;
      }
      setCourse(data);
      await loadMembers();
    } catch (err) {
      setLoadError("Failed to load the course.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMembers() {
    const data = await getCourseMembers(courseId);
    if (Array.isArray(data)) setMembers(data);
  }

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }
    const result = await addCourseMember(courseId, email.trim(), role);
    if (result.user) {
      setNotice(`${result.user.name} was added to the course.`);
      setEmail("");
      setRole("student");
      loadMembers();
    } else {
      setError(result.errors?.join(", ") || result.error || "Could not add the member.");
    }
  }

  async function handleRemove(member: Member) {
    if (!window.confirm(`Remove ${member.name} from this course?`)) return;
    setError("");
    setNotice("");
    const result = await removeCourseMember(courseId, member.id);
    if (result.errors || result.error) {
      setError(result.errors?.join(", ") || result.error);
    } else {
      setNotice(`${member.name} was removed from the course.`);
      loadMembers();
    }
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
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6">
        <button
          type="button"
          onClick={() => navigate("/events")}
          className="text-xs text-blue-600 hover:text-blue-700 mb-2"
        >
          Back to events
        </button>

        {loadError || !course ? (
          <p className="text-red-600 font-semibold">{loadError || "Course not found."}</p>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Course Members</h1>
            <p className="text-gray-600 mb-4">{courseLabel(course)}</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}
            {notice && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{notice}</div>
            )}

            {isStaff && (
              <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex-1 min-w-[14rem]">
                  <label htmlFor="member-email" className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    id="member-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="member-role" className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <select
                    id="member-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="ta">TA</option>
                  </select>
                </div>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  Add Member
                </button>
              </form>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Email</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600">Role</th>
                    {isStaff && <th className="px-4 py-2" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-2 font-medium text-gray-800">{m.name}</td>
                      <td className="px-4 py-2 text-gray-600">{m.email}</td>
                      <td className="px-4 py-2">{ROLE_LABELS[m.role] ?? m.role}</td>
                      {isStaff && (
                        <td className="px-4 py-2 text-right">
                          {m.role !== "instructor" && m.id !== user?.id && (
                            <button onClick={() => handleRemove(m)} className="text-red-600 hover:text-red-700 text-sm">
                              Remove
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
