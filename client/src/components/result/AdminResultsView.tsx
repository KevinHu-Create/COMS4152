import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPresentationStats } from "../../api";
import { AppShell, Avatar, BackLink, Button, Card, EmptyState, LoadingScreen, PageHeader, StatTile } from "../ui/ui";
import { formatDate } from "../ui/format";
import { LockedIllustration } from "../ui/illustrations";

type Evaluation = {
  id: number;
  evaluatorName: string;
  clarity: number;
  organization: number;
  delivery: number;
  overall: number;
  comments: string;
  submittedAt: string;
};

type StatsData = {
  presentation: {
    id: number;
    title: string;
    date: string;
    presenter: string;
  };
  evaluations: Evaluation[];
  stats: {
    avgClarity: number | null;
    avgOrganization: number | null;
    avgDelivery: number | null;
    avgOverall: number | null;
    totalEvaluations: number;
  };
};

function formatSubmitted(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function AdminEventResults() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const presentationId = Number(id);

  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
  }, [presentationId]);

  async function loadStats() {
    try {
      const result = await getPresentationStats(presentationId);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingScreen />;

  if (error || !data) {
    return (
      <AppShell width="max-w-3xl">
        <BackLink />
        <Card>
          <EmptyState illustration={<LockedIllustration />} title={error || "Event not found."}
                      action={<Button onClick={() => navigate("/events")}>Back to Events</Button>}>
            <p>Results are only available to the course's instructors and TAs.</p>
          </EmptyState>
        </Card>
      </AppShell>
    );
  }

  const { presentation, evaluations, stats } = data;

  return (
    <AppShell>
      <BackLink />
      <PageHeader
        eyebrow="Results"
        title={presentation.title}
        subtitle={<>{presentation.presenter ? `Presented by ${presentation.presenter}` : "Presenter to be announced"} · {formatDate(presentation.date)}</>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
        <div className="col-span-2 lg:col-span-1">
          <StatTile elevated label="Total evaluations" value={stats.totalEvaluations} max={null} />
        </div>
        <StatTile elevated label="Clarity" value={stats.avgClarity} />
        <StatTile elevated label="Organization" value={stats.avgOrganization} accent="#5e5ce6" />
        <StatTile elevated label="Delivery" value={stats.avgDelivery} accent="#30b0c7" />
        <StatTile elevated label="Overall" value={stats.avgOverall} accent="#ff9f0a" />
      </div>

      <h2 className="text-lg font-semibold tracking-tight mb-4">Individual Evaluations</h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-ink-3 bg-canvas border-b border-hair">
                <th className="px-5 py-3 font-medium">Evaluator</th>
                <th className="px-3 py-3 font-medium text-center">Clarity</th>
                <th className="px-3 py-3 font-medium text-center">Organization</th>
                <th className="px-3 py-3 font-medium text-center">Delivery</th>
                <th className="px-3 py-3 font-medium text-center">Overall</th>
                <th className="px-5 py-3 font-medium">Comments</th>
                <th className="px-5 py-3 font-medium text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hair">
              {evaluations.map((e) => (
                <tr key={e.id} className="hover:bg-canvas/60">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="flex items-center gap-2.5 font-medium text-ink">
                      <Avatar name={e.evaluatorName} size="sm" />
                      {e.evaluatorName}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-center">{e.clarity}</td>
                  <td className="px-3 py-3.5 text-center">{e.organization}</td>
                  <td className="px-3 py-3.5 text-center">{e.delivery}</td>
                  <td className="px-3 py-3.5 text-center font-semibold">{e.overall}</td>
                  <td className="px-5 py-3.5 min-w-[14rem] max-w-sm text-ink-2">{e.comments || "-"}</td>
                  <td className="px-5 py-3.5 text-right text-ink-3 whitespace-nowrap">{formatSubmitted(e.submittedAt)}</td>
                </tr>
              ))}

              {evaluations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-ink-3">
                    No evaluations submitted yet for this event.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
