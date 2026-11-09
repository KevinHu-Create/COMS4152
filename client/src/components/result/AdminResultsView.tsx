import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPresentationStats } from "../../api";

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
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
          <p className="text-red-600 font-semibold mb-2">{error || "Event not found."}</p>
          <p className="text-gray-600 text-sm mb-4">
            Please check the URL or go back to the events list.
          </p>
          <button
            type="button"
            onClick={() => navigate("/events")}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const { presentation, evaluations, stats } = data;

  function formatAvg(value: number | null) {
    return value?.toFixed(1) || "-";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="text-xs text-blue-600 hover:text-blue-700 mb-2"
            >
              Back to events
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Results - {presentation.title}
            </h1>
            <p className="text-gray-600 mt-1">
              Presenter: <span className="font-semibold">{presentation.presenter || "TBD"}</span>
              <br />
              Date: <span className="font-medium">{presentation.date}</span>
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Total evaluations</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalEvaluations}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-700 uppercase mb-1">
              Clarity
            </p>
            <p className="text-2xl font-bold text-blue-900">
              {formatAvg(stats.avgClarity)}
            </p>
            <p className="text-xs text-blue-700 mt-1">Average (1-5)</p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-700 uppercase mb-1">
              Organization
            </p>
            <p className="text-2xl font-bold text-indigo-900">
              {formatAvg(stats.avgOrganization)}
            </p>
            <p className="text-xs text-indigo-700 mt-1">Average (1-5)</p>
          </div>

          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-teal-700 uppercase mb-1">
              Delivery
            </p>
            <p className="text-2xl font-bold text-teal-900">
              {formatAvg(stats.avgDelivery)}
            </p>
            <p className="text-xs text-teal-700 mt-1">Average (1-5)</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase mb-1">
              Overall
            </p>
            <p className="text-2xl font-bold text-amber-900">
              {formatAvg(stats.avgOverall)}
            </p>
            <p className="text-xs text-amber-700 mt-1">Average (1-5)</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Individual Evaluations
        </h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Evaluator
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">
                  Clarity
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">
                  Organization
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">
                  Delivery
                </th>
                <th className="px-4 py-2 text-center font-medium text-gray-600">
                  Overall
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600">
                  Comments
                </th>
                <th className="px-4 py-2 text-right font-medium text-gray-600">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {evaluations.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-800">
                    {e.evaluatorName}
                  </td>
                  <td className="px-4 py-2 text-center">{e.clarity}</td>
                  <td className="px-4 py-2 text-center">{e.organization}</td>
                  <td className="px-4 py-2 text-center">{e.delivery}</td>
                  <td className="px-4 py-2 text-center font-semibold">
                    {e.overall}
                  </td>
                  <td className="px-4 py-2 max-w-xs">
                    <p className="text-gray-700 text-xs sm:text-sm">
                      {e.comments || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-2 text-right text-xs text-gray-500 whitespace-nowrap">
                    {e.submittedAt}
                  </td>
                </tr>
              ))}

              {evaluations.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    No evaluations submitted yet for this event.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
