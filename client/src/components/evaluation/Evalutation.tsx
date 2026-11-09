import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPresentation, submitEvaluation } from "../../api";

export function Evaluation() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const presentationId = Number(id);

  const [presentation, setPresentation] = useState<{ title: string; presenter: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [clarity, setClarity] = useState("");
  const [organization, setOrganization] = useState("");
  const [delivery, setDelivery] = useState("");
  const [overallScore, setOverallScore] = useState("");
  const [comments, setComments] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPresentation();
  }, [presentationId]);

  async function loadPresentation() {
    try {
      const data = await getPresentation(presentationId);
      if (data.id) {
        setPresentation({ title: data.title, presenter: data.presenter });
      }
    } catch (err) {
      console.error("Failed to load presentation", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!clarity || !organization || !delivery || !overallScore) {
      setError("Please score all categories before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitEvaluation(presentationId, {
        clarity_score: Number(clarity),
        organization_score: Number(organization),
        delivery_score: Number(delivery),
        overall_score: Number(overallScore),
        comments: comments || undefined,
      });

      if (result.errors) {
        setError(result.errors.join(", "));
      } else {
        setSuccess("Thank you! Your evaluation has been recorded.");
        setClarity("");
        setOrganization("");
        setDelivery("");
        setOverallScore("");
        setComments("");
      }
    } catch (err) {
      setError("Failed to submit evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function ScoreSelect(props: {
    label: string;
    value: string;
    onChange: (value: string) => void;
  }) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {props.label} <span className="text-red-500">*</span>
        </label>
        <select
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Select a score (1-5)</option>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>
      </div>
    );
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
        <div className="mb-4">
          <p
            className="text-xs text-blue-600 uppercase tracking-wide mb-1 cursor-pointer"
            onClick={() => navigate("/events")}
          >
            Back to events
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Submit Evaluation
          </h1>
          <p className="text-gray-600 mt-2">
            Event: <span className="font-semibold">{presentation?.title || "Unknown"}</span>
            <br />
            Presenter: <span className="font-semibold">{presentation?.presenter || "TBD"}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <ScoreSelect
            label="Clarity of explanation"
            value={clarity}
            onChange={setClarity}
          />

          <ScoreSelect
            label="Organization of presentation"
            value={organization}
            onChange={setOrganization}
          />

          <ScoreSelect
            label="Delivery & engagement"
            value={delivery}
            onChange={setDelivery}
          />

          <ScoreSelect
            label="Overall quality"
            value={overallScore}
            onChange={setOverallScore}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comments for the presenter (optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
              placeholder="What did they do well? What could be improved?"
            />
            <p className="text-xs text-gray-500 mt-1">
              These comments may be shared with the presenter to help them improve.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/events")}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Evaluation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
