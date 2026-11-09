import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPresentations, createPresentation, getUser, logout, getCourseMembers } from "../../api";

interface EventItem {
  id: number;
  title: string;
  date: string;
  presenter: string;
}

interface Member {
  id: number;
  name: string;
  role: string;
}

export function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [selectedPresenters, setSelectedPresenters] = useState<number[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const user = getUser();
  const isAdmin = user?.role === 'instructor' || user?.role === 'ta' || user?.role === 'admin';

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadEvents();
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const data = await getCourseMembers(1);
      if (Array.isArray(data)) {
        setMembers(data.filter((m: Member) => m.role === 'student'));
      }
    } catch (err) {
      console.error("Failed to load members", err);
    }
  }

  async function loadEvents() {
    try {
      const data = await getPresentations(1);
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent() {
    if (!newTitle.trim() || !newDate.trim()) return;

    try {
      const result = await createPresentation(1, {
        title: newTitle,
        presentation_date: newDate,
        presenter_ids: selectedPresenters,
      });

      if (result.id) {
        loadEvents();
        setNewTitle("");
        setNewDate("");
        setSelectedPresenters([]);
        setShowForm(false);
      }
    } catch (err) {
      console.error("Failed to create event", err);
    }
  }

  function togglePresenter(id: number) {
    if (selectedPresenters.includes(id)) {
      setSelectedPresenters(selectedPresenters.filter(p => p !== id));
    } else {
      setSelectedPresenters([...selectedPresenters, id]);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
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
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Presentation Events
            </h1>
            <p className="text-gray-600">
              Welcome, {user?.name} ({user?.role})
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/feedback")}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              My Feedback
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Select a presentation to submit an evaluation or view details.
        </p>

        {isAdmin && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Create Event
            </button>
          </div>
        )}

        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No presentations yet.</p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="border p-4 rounded-lg shadow-sm hover:shadow transition cursor-pointer bg-white"
                onClick={() => navigate(`/evaluation/${event.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{event.title}</h2>
                    <p className="text-gray-600 mt-1">Date: {event.date}</p>
                    <p className="text-gray-600">Presenter: {event.presenter || "TBD"}</p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/results/${event.id}`);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View Results
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Create New Event</h3>

              <label className="block mb-2 text-sm font-medium">Event Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border rounded-lg p-2 mb-3"
              />

              <label className="block mb-2 text-sm font-medium">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full border rounded-lg p-2 mb-3"
              />

              <label className="block mb-2 text-sm font-medium">Select Presenters</label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 mb-4">
                {members.length === 0 ? (
                  <p className="text-gray-500 text-sm">No students available</p>
                ) : (
                  members.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPresenters.includes(member.id)}
                        onChange={() => togglePresenter(member.id)}
                        className="w-4 h-4"
                      />
                      <span>{member.name}</span>
                    </label>
                  ))
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleCreateEvent}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
