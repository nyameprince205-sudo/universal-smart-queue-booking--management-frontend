import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";
import SupportThread from "../../components/SupportThread";
import { createTicket, listMyTickets, getTicket } from "../../api/support";
function StaffSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const loadTickets = useCallback(async () => {
    try {
      const data = await listMyTickets();
      setTickets(data);
    } catch {
      setError("Couldn't load your tickets.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);
  async function openTicket(id) {
    try {
      setActiveTicket(await getTicket(id));
    } catch {
      setError("Couldn't load ticket.");
    }
  }
  async function handleCreate(e) {
    e.preventDefault();
    if (!form.subject || !form.message) return;
    setSubmitting(true);
    setError(null);
    try {
      await createTicket(form);
      setShowNew(false);
      setForm({
        subject: "",
        message: ""
      });
      await loadTickets();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't create ticket.");
    } finally {
      setSubmitting(false);
    }
  }
  return <div className="min-h-screen bg-warm-bg p-8 font-sans">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-semibold text-warm-ink">Support</h1>
          <p className="text-sm text-warm-muted mt-0.5">
            <Link to="/staff/queue" className="text-forest-600 hover:underline">← Queue Console</Link>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowNew(true)} className="rounded-md bg-forest-600 text-white px-4 py-2 text-sm font-medium hover:bg-forest-700 transition-colors">
            New Ticket
          </button>
          <LogoutButton />
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-6">
        {error && <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

        {showNew && <div className="bg-warm-card rounded-lg border border-warm-border p-5 mb-6">
            <p className="font-medium text-warm-ink mb-4">Report an issue to your Org Admin</p>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" required placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({
            ...f,
            subject: e.target.value
          }))} className="w-full rounded-md border border-warm-border px-3 py-2 text-sm text-warm-ink" />
              <textarea required placeholder="Describe the issue…" value={form.message} onChange={e => setForm(f => ({
            ...f,
            message: e.target.value
          }))} rows={4} className="w-full rounded-md border border-warm-border px-3 py-2 text-sm text-warm-ink resize-none" />
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="rounded-md bg-forest-600 text-white px-4 py-2 text-sm font-medium hover:bg-forest-700 disabled:opacity-50 transition-colors">
                  {submitting ? "Submitting…" : "Submit"}
                </button>
                <button type="button" onClick={() => setShowNew(false)} className="rounded-md border border-warm-border text-warm-ink px-4 py-2 text-sm hover:bg-warm-bg transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>}

        {activeTicket && <div>
            <button onClick={() => setActiveTicket(null)} className="text-sm text-forest-600 hover:underline mb-3">← All tickets</button>
            <SupportThread ticket={activeTicket} currentSenderType="staff" canResolve={false} onUpdated={async () => {
          setActiveTicket(await getTicket(activeTicket.id));
          loadTickets();
        }} />
          </div>}

        {!activeTicket && <div>
            {loading && <p className="text-warm-muted">Loading…</p>}
            {!loading && tickets.length === 0 && <p className="text-warm-muted">No support tickets yet.</p>}
            {tickets.map(t => <div key={t.id} onClick={() => openTicket(t.id)} className="bg-warm-card rounded-lg border border-warm-border p-4 mb-3 cursor-pointer hover:border-forest-400 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-warm-ink">{t.subject}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.status === "open" ? "bg-amber-100 text-amber-700" : t.status === "in_progress" ? "bg-sky-100 text-sky-700" : "bg-green-100 text-green-700"}`}>{t.status.replace("_", " ")}</span>
                </div>
                <p className="text-xs text-warm-muted mt-1">{t.messages?.length || 0} messages · {new Date(t.updatedAt).toLocaleDateString()}</p>
              </div>)}
          </div>}
      </div>
    </div>;
}
export default StaffSupportPage;