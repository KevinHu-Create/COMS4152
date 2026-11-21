import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup, saveAuth } from "../../api";
import { Alert, Button, Field, Input } from "../ui/ui";
import { AppMark, PresentingIllustration } from "../ui/illustrations";
import { ChartIcon, CheckIcon, UsersIcon } from "../ui/icons";

const HIGHLIGHTS = [
  { Icon: CheckIcon, text: "Score every talk on clarity, organization and delivery" },
  { Icon: UsersIcon, text: "Presenters read honest, anonymous comments" },
  { Icon: ChartIcon, text: "Instructors see every result at a glance" },
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
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* Story panel */}
      <section className="hidden lg:flex flex-col justify-between bg-white px-14 py-12 border-r border-black/5">
        <div className="flex items-center gap-2.5">
          <AppMark className="w-8 h-8" />
          <span className="font-semibold tracking-tight">Evaluations</span>
        </div>
        <div className="max-w-lg">
          <h2 className="text-5xl font-semibold tracking-tight leading-[1.05] text-ink">
            Feedback that helps every presenter grow.
          </h2>
          <p className="mt-4 text-lg text-ink-2">
            Peer evaluations for classroom presentations, simple enough to fill in before the next talk starts.
          </p>
          <PresentingIllustration className="w-full mt-10" />
        </div>
        <ul className="space-y-3">
          {HIGHLIGHTS.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-ink-2">
              <span className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </section>

      {/* Form */}
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="lg:hidden flex flex-col items-center mb-6">
            <PresentingIllustration className="w-64" />
          </div>
          <div className="flex justify-center mb-5">
            <AppMark className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-center text-ink">
            Presentation Evaluations
          </h1>
          <p className="text-center text-ink-2 mt-2 mb-8">
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
              <Input id="email" type="email" autoComplete="email" value={email}
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

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-accent hover:underline text-sm"
              type="button"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
