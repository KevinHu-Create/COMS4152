import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addCourseMember, courseLabel, getCourse, getCourseMembers, getUser,
  isCourseStaff, removeCourseMember, type Course,
} from "../../api";
import { Alert, AppShell, Avatar, BackLink, Badge, Button, Card, EmptyState, Field, Input, LoadingScreen, PageHeader, Select } from "../ui/ui";
import { LockedIllustration } from "../ui/illustrations";
import { PlusIcon } from "../ui/icons";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

const ROLE_LABELS: Record<string, string> = { instructor: "Instructor", ta: "TA", student: "Student" };
function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

const ROLE_TONES: Record<string, "blue" | "orange" | "gray"> = { instructor: "blue", ta: "orange", student: "gray" };

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
    } catch {
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

  if (loading) return <LoadingScreen />;

  if (loadError || !course) {
    return (
      <AppShell width="max-w-3xl">
        <BackLink />
        <Card>
          <EmptyState illustration={<LockedIllustration />} title={loadError || "Course not found."} />
        </Card>
      </AppShell>
    );
  }

  const counts = members.reduce<Record<string, number>>((acc, m) => ({ ...acc, [m.role]: (acc[m.role] ?? 0) + 1 }), {});

  return (
    <AppShell width="max-w-4xl">
      <BackLink />
      <PageHeader
        eyebrow={courseLabel(course)}
        title="Course Members"
        subtitle={`${plural(counts.student ?? 0, "student")} · ${plural(counts.ta ?? 0, "TA")} · taught by ${course.instructor.name}`}
      />

      {error && <Alert>{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}

      {isStaff && (
        <Card className="p-5 sm:p-6 mb-6">
          <h2 className="font-semibold mb-4">Add someone to this course</h2>
          <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
            <Field id="member-email" label="Email">
              <Input id="member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                     placeholder="student@example.com" />
            </Field>
            <Field id="member-role" label="Role">
              <Select id="member-role" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="ta">TA</option>
              </Select>
            </Field>
            <Button type="submit">
              <PlusIcon className="w-4 h-4" />
              Add Member
            </Button>
          </form>
          <p className="text-xs text-ink-3 mt-3">They need an account first. Ask them to sign up with this email.</p>
        </Card>
      )}

      <Card className="overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-ink-3 bg-canvas border-b border-hair">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              {isStaff && <th className="px-5 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-hair">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-3">
                    <Avatar name={m.name} />
                    <span>
                      <span className="block font-medium text-ink">{m.name}</span>
                      <span className="block text-xs text-ink-3 sm:hidden">{m.email}</span>
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3 text-ink-2 hidden sm:table-cell">{m.email}</td>
                <td className="px-5 py-3"><Badge tone={ROLE_TONES[m.role] ?? "gray"}>{ROLE_LABELS[m.role] ?? m.role}</Badge></td>
                {isStaff && (
                  <td className="px-5 py-3 text-right">
                    {m.role !== "instructor" && m.id !== user?.id && (
                      <Button variant="danger-ghost" size="sm" onClick={() => handleRemove(m)}>
                        Remove
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
