import { useEffect, useState, useCallback } from "react";
import { listContactSubmissions, markContactSubmissionRead } from "../../api/contact";
function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingId, setMarkingId] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listContactSubmissions(unreadOnly);
      setSubmissions(data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load messages.");
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);
  useEffect(() => {
    load();
  }, [load]);
  async function handleMarkRead(id) {
    setMarkingId(id);
    try {
      await markContactSubmissionRead(id);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't update this message.");
    } finally {
      setMarkingId(null);
    }
  }
  return <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-800">Contact Messages</h1>

      <div className="mt-4 flex gap-2">
        <button onClick={() => setUnreadOnly(false)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!unreadOnly ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"}`}>
          All
        </button>
        <button onClick={() => setUnreadOnly(true)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${unreadOnly ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"}`}>
          Unread
        </button>
      </div>

      {error && <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <p className="mt-8 text-slate-400">Loading…</p>}
      {!loading && submissions.length === 0 && !error && <p className="mt-8 text-slate-400">No messages here.</p>}

      <div className="mt-6 space-y-3">
        {submissions.map(s => <div key={s.id} className={`rounded-lg border p-5 ${s.isRead ? "bg-white border-slate-200" : "bg-sky-50 border-sky-200"}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">{s.name} {!s.isRead && <span className="ml-2 rounded-full bg-sky-600 text-white text-xs px-2 py-0.5">New</span>}</p>
                <p className="text-sm text-slate-500">{s.email}{s.phone ? ` · ${s.phone}` : ""}</p>
                {s.subject && <p className="text-sm font-medium text-slate-700 mt-1">{s.subject}</p>}
              </div>
              <p className="text-xs text-slate-400 shrink-0 ml-3">{new Date(s.createdAt).toLocaleDateString()}</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">{s.message}</p>
            {!s.isRead && <button onClick={() => handleMarkRead(s.id)} disabled={markingId === s.id} className="mt-3 text-sm text-sky-600 hover:underline disabled:opacity-50">
                {markingId === s.id ? "Marking…" : "Mark as read"}
              </button>}
          </div>)}
      </div>
    </div>;
}
export default ContactSubmissionsPage;