import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPresentations } from "../../api";

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
};

export function PresenterFeedback() {
  const navigate = useNavigate();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
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
              My Presentation Feedback
            </h1>
            <p className="text-gray-600 mt-1 text-sm">
              These comments and scores were submitted by your audience. Evaluator
              names are hidden to keep feedback honest and constructive.
            </p>
          </div>
        </div>

        {presentations.length === 0 && (
          <p className="text-gray-500 text-sm">
            You don't have any feedback yet. Once you present, your feedback will
            appear here.
          </p>
        )}

        <div className="space-y-5 mt-3">
          {presentations.map((p) => (
            <div
              key={p.id}
              className="border border-gray-200 rounded-xl p-4 bg-gray-50/60"
            >
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {p.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {p.course} - {p.date}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white rounded-lg px-3 py-2 border border-blue-100">
                    <p className="text-[11px] font-semibold text-blue-700 uppercase">
                      Clarity
                    </p>
                    <p className="text-base font-bold text-blue-900">
                      {p.avgClarity?.toFixed(1) ?? "-"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 border border-indigo-100">
                    <p className="text-[11px] font-semibold text-indigo-700 uppercase">
                      Organization
                    </p>
                    <p className="text-base font-bold text-indigo-900">
                      {p.avgOrganization?.toFixed(1) ?? "-"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 border border-teal-100">
                    <p className="text-[11px] font-semibold text-teal-700 uppercase">
                      Delivery
                    </p>
                    <p className="text-base font-bold text-teal-900">
                      {p.avgDelivery?.toFixed(1) ?? "-"}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 border border-amber-100">
                    <p className="text-[11px] font-semibold text-amber-700 uppercase">
                      Overall
                    </p>
                    <p className="text-base font-bold text-amber-900">
                      {p.avgOverall?.toFixed(1) ?? "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Anonymous comments from your audience
                </h3>

                {p.comments.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No written comments for this presentation yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {p.comments.map((comment, index) => (
                      <li
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800"
                      >
                        <span className="block text-[11px] text-gray-400 mb-1">
                          Comment #{index + 1}
                        </span>
                        <span>{comment}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
