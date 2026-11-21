import { useState, useEffect } from "react";
import { getMyPresentations } from "../../api";
import { AppShell, Card, EmptyState, LoadingScreen, PageHeader, StatTile } from "../ui/ui";
import { formatDate } from "../ui/format";
import { FeedbackIllustration } from "../ui/illustrations";
import { QuoteIcon } from "../ui/icons";

type PresentationFeedback = {
  id: number;
  title: string;
  date: string;
  course: string;
  avgClarity: number | null;
  avgOrganization: number | null;
  avgDelivery: number | null;
  avgOverall: number | null;
  comments: string[];
  evaluationCount: number;
};

export function PresenterFeedback() {
  const [presentations, setPresentations] = useState<PresentationFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPresentations();
  }, []);

  async function loadPresentations() {
    try {
      const data = await getMyPresentations();
      if (Array.isArray(data)) {
        setPresentations(data);
      }
    } catch (err) {
      console.error("Failed to load presentations", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <AppShell>
      <PageHeader
        eyebrow="My Feedback"
        title="My Presentation Feedback"
        subtitle="These scores and comments come from your audience. Names are hidden so feedback stays honest and constructive."
      />

      {presentations.length === 0 ? (
        <Card>
          <EmptyState illustration={<FeedbackIllustration />} title="No feedback yet">
            <p>You don't have any feedback yet. Once you present, your feedback will appear here.</p>
          </EmptyState>
        </Card>
      ) : (
        <div className="space-y-6">
          {presentations.map((p) => (
            <Card key={p.id} as="article" className="p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">{p.title}</h2>
                  <p className="text-ink-2 mt-1">{p.course} · {formatDate(p.date)}</p>
                </div>
                <p className="text-sm text-ink-3">
                  {p.evaluationCount} {p.evaluationCount === 1 ? "evaluation" : "evaluations"}
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatTile label="Clarity" value={p.avgClarity} />
                <StatTile label="Organization" value={p.avgOrganization} accent="#5e5ce6" />
                <StatTile label="Delivery" value={p.avgDelivery} accent="#30b0c7" />
                <StatTile label="Overall" value={p.avgOverall} accent="#ff9f0a" />
              </div>

              <h3 className="font-semibold mt-8 mb-3">Anonymous comments from your audience</h3>
              {p.comments.length === 0 ? (
                <p className="text-sm text-ink-3">No written comments for this presentation yet.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {p.comments.map((comment, index) => (
                    <li key={index} className="rounded-2xl bg-canvas px-4 py-3.5 flex gap-3">
                      <QuoteIcon className="w-5 h-5 text-ink-3 shrink-0 mt-0.5" />
                      <span className="text-ink leading-relaxed">{comment}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
