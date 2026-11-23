import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPresentation, submitEvaluation } from "../../api";
import { Alert, AppShell, BackLink, Button, Card, EmptyState, LoadingScreen, Textarea } from "../ui/ui";
import { cx, formatDate } from "../ui/format";
import { AllDoneIllustration, EmptyCalendarIllustration, LockedIllustration, SentIllustration } from "../ui/illustrations";
import { ClockIcon, PersonIcon, PinIcon } from "../ui/icons";

const SCORE_WORDS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

const CATEGORIES = [
  { key: "clarity", label: "Clarity of explanation", hint: "Were the ideas easy to follow?" },
  { key: "organization", label: "Organization of presentation", hint: "Did it have a clear structure and flow?" },
  { key: "delivery", label: "Delivery & engagement", hint: "Voice, pace, eye contact and energy." },
  { key: "overall", label: "Overall quality", hint: "Your overall impression of the talk." },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

/** A 1-5 segmented control built from radio buttons (keyboard and screen-reader friendly). */
function ScorePicker({ name, label, hint, value, onChange }: {
  name: string; label: string; hint: string; value: string; onChange: (value: string) => void;
}) {
  return (
    <fieldset className="py-5 first:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <legend className="font-medium text-ink">
            {label} <span className="text-danger" aria-hidden="true">*</span>
          </legend>
          <p className="text-sm text-ink-3 mt-0.5">{hint}</p>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-1.5">
          <div className="grid grid-cols-5 gap-1 rounded-lg bg-canvas border border-hair p-1 w-full sm:w-auto">
            {[1, 2, 3, 4, 5].map((n) => {
              const id = `${name}-${n}`;
              const checked = value === String(n);
              return (
                <div key={n}>
                  <input type="radio" id={id} name={name} value={n} checked={checked} required
                         onChange={() => onChange(String(n))} className="peer sr-only" />
                  <label htmlFor={id} title={SCORE_WORDS[n - 1]}
                         className={cx(
                           "flex items-center justify-center h-9 sm:w-11 rounded-md text-sm font-medium cursor-pointer select-none transition-all",
                           "peer-focus-visible:ring-4 peer-focus-visible:ring-accent/25",
                           checked ? "bg-accent text-white shadow-sm animate-pop" : "text-ink-2 hover:text-ink hover:bg-white",
                         )}>
                    {n}
                  </label>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-ink-2 h-4 text-right" aria-live="polite">{value ? SCORE_WORDS[Number(value) - 1] : ""}</p>
        </div>
      </div>
    </fieldset>
  );
}

export function Evaluation() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const presentationId = Number(id);

  const [presentation, setPresentation] = useState<{
    title: string;
    presenter: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    description: string | null;
    isMine: boolean;
    evaluatedByMe: boolean;
    upcoming: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [scores, setScores] = useState<Record<CategoryKey, string>>({ clarity: "", organization: "", delivery: "", overall: "" });
  const [comments, setComments] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadPresentation() {
      try {
        const data = await getPresentation(presentationId);
        if (data.id) {
          setPresentation({
            title: data.title,
            presenter: data.presenter,
            date: data.date,
            startTime: data.startTime,
            endTime: data.endTime,
            location: data.location,
            description: data.description,
            isMine: !!data.isMine,
            evaluatedByMe: !!data.evaluatedByMe,
            upcoming: !!data.upcoming,
          });
        } else {
          setLoadError(data.error || "Presentation not found.");
        }
      } catch (err) {
        console.error("Failed to load presentation", err);
      } finally {
        setLoading(false);
      }
    }
    loadPresentation();
  }, [presentationId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (CATEGORIES.some(({ key }) => !scores[key])) {
      setError("Please score all categories before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitEvaluation(presentationId, {
        clarity_score: Number(scores.clarity),
        organization_score: Number(scores.organization),
        delivery_score: Number(scores.delivery),
        overall_score: Number(scores.overall),
        comments: comments || undefined,
      });

      if (result.errors || result.error) {
        setError(result.errors?.join(", ") || result.error);
      } else {
        setSuccess("Thank you! Your evaluation has been recorded.");
      }
    } catch {
      setError("Failed to submit evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingScreen />;

  if (loadError) {
    return (
      <AppShell width="max-w-3xl">
        <BackLink />
        <Card>
          <EmptyState illustration={<LockedIllustration />} title={loadError}
                      action={<Button onClick={() => navigate("/events")}>Back to Events</Button>} />
        </Card>
      </AppShell>
    );
  }

  // Why this user cannot evaluate, if they cannot (checked again by the API).
  const blocked = presentation?.isMine
    ? { text: "This is your presentation, so you cannot evaluate it.", art: <LockedIllustration /> }
    : presentation?.evaluatedByMe
      ? { text: "You have already evaluated this presentation. Thank you!", art: <AllDoneIllustration /> }
      : presentation?.upcoming
        ? { text: "This presentation has not happened yet. You can evaluate it on or after its date.", art: <EmptyCalendarIllustration /> }
        : null;

  const time = presentation?.startTime && presentation?.endTime
    ? `${presentation.startTime} – ${presentation.endTime}` : presentation?.startTime;

  return (
    <AppShell width="max-w-3xl">
      <BackLink />

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Submit Evaluation</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{presentation?.title || "Unknown"}</h1>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-2">
          <li className="flex items-center gap-1.5">
            <PersonIcon className="w-4 h-4 text-ink-3" />
            {presentation?.presenter ? `Presented by ${presentation.presenter}` : "Presenter to be announced"}
          </li>
          {presentation?.date && (
            <li className="flex items-center gap-1.5">
              <ClockIcon className="w-4 h-4 text-ink-3" />
              {formatDate(presentation.date)}{time && ` · ${time}`}
            </li>
          )}
          {presentation?.location && (
            <li className="flex items-center gap-1.5">
              <PinIcon className="w-4 h-4 text-ink-3" />
              {presentation.location}
            </li>
          )}
        </ul>
        {presentation?.description && <p className="mt-3 text-ink-2 max-w-2xl">{presentation.description}</p>}
      </div>

      {success ? (
        <Card>
          <EmptyState illustration={<SentIllustration />} title={success}
                      action={<Button onClick={() => navigate("/events")}>Back to Events</Button>}>
            <p>The presenter will see your scores and comment without your name.</p>
          </EmptyState>
        </Card>
      ) : blocked ? (
        <Card>
          <EmptyState illustration={blocked.art}
                      action={<Button onClick={() => navigate("/events")}>Back to Events</Button>}>
            <p className="text-ink font-medium">{blocked.text}</p>
          </EmptyState>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8">
          {error && <Alert>{error}</Alert>}

          <p className="text-sm text-ink-2 mb-6">
            Rate each part from <span className="font-medium text-ink">1 (Poor)</span> to{" "}
            <span className="font-medium text-ink">5 (Excellent)</span>.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="divide-y divide-hair">
              {CATEGORIES.map((c) => (
                <ScorePicker key={c.key} name={c.key} label={c.label} hint={c.hint} value={scores[c.key]}
                             onChange={(v) => setScores((s) => ({ ...s, [c.key]: v }))} />
              ))}
            </div>

            <div className="pt-5 mt-1 border-t border-hair">
              <label htmlFor="comments" className="block font-medium text-ink mb-1.5">
                Comments for the presenter <span className="text-ink-3 font-normal">(optional)</span>
              </label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="What did they do well? What could be improved?"
              />
              <p className="text-xs text-ink-3 mt-1.5">
                Shared with the presenter anonymously. Your instructor can see who wrote it.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-6">
              <Button variant="secondary" onClick={() => navigate("/events")}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Evaluation"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </AppShell>
  );
}
