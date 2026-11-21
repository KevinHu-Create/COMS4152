import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup, saveAuth } from "../../api";
import { Alert, Button, Field, Input } from "../ui/ui";
import { AppMark, PresentingIllustration } from "../ui/illustrations";
import { ChartIcon, CheckIcon, UsersIcon } from "../ui/icons";

const HIGHLIGHTS = [
  { Icon: CheckIcon, title: "Structured scoring", text: "Clarity, organization, delivery and overall, from 1 to 5." },
  { Icon: UsersIcon, title: "Anonymous for presenters", text: "Honest comments without names attached." },
  { Icon: ChartIcon, title: "Results at a glance", text: "Instructors see every evaluation and the averages." },
];

export function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isLogin && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const result = isLogin ? await login(email, password) : await signup(fullName, email, password);

      if (result.error || result.errors) {
        setError(result.error || result.errors.join(", "));
        setLoading(false);
        return;
      }

      saveAuth(result.token, result.user);
      navigate("/events");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Form */}
      <section className="flex flex-col px-6 sm:px-12 py-8">
        <div className="flex items-center gap-2.5">
          <AppMark className="w-8 h-8" />
          <span className="font-semibold">Evaluations</span>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-sm animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">COMS4152 · Peer review</p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">Presentation Evaluations</h1>
            <p className="text-ink-2 mt-2 mb-8">
              {isLogin ? "Sign in to your account" : "Create a new account"}
            </p>

            {error && <Alert>{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Field id="fullName" label="Full Name">
                  <Input id="fullName" type="text" autoComplete="name" value={fullName}
                         onChange={(e) => setFullName(e.target.value)} required />
                </Field>
              )}

              <Field id="email" label="Email">
                <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email}
                       onChange={(e) => setEmail(e.target.value)} required />
              </Field>

              <Field id="password" label="Password" hint={!isLogin ? "At least 6 characters." : undefined}>
                <Input id="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"}
                       value={password} onChange={(e) => setPassword(e.target.value)} required />
              </Field>

              <Button type="submit" size="lg" disabled={loading} className="w-full mt-2">
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-2">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="font-medium text-accent hover:text-accent-hover"
                type="button"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-xs text-ink-3">Columbia University · COMS4152 Engineering SaaS</p>
      </section>

      {/* Product panel */}
      <section className="hidden lg:flex relative overflow-hidden flex-col justify-center px-14 py-12 bg-gradient-to-br from-[#4f46e5] via-[#5b4ee6] to-[#7c3aed] text-white">
        <div aria-hidden="true" className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden="true" className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-[#a78bfa]/30 blur-3xl" />
        <div className="relative max-w-lg">
          <h2 className="text-4xl font-semibold tracking-tight leading-tight">
            Feedback that helps every presenter grow.
          </h2>
          <p className="mt-3 text-white/80 text-lg">
            Peer evaluations for classroom presentations, simple enough to fill in before the next talk starts.
          </p>
          <div className="mt-10 rounded-2xl bg-white p-6 shadow-2xl shadow-black/20 animate-float">
            <PresentingIllustration className="w-full" />
          </div>
          <ul className="mt-10 grid gap-5">
            {HIGHLIGHTS.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="w-9 h-9 shrink-0 rounded-lg bg-white/15 ring-1 ring-white/25 flex items-center justify-center">
                  <Icon className="w-[18px] h-[18px]" />
                </span>
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="block text-sm text-white/75">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
