import { useEffect, useState, useCallback } from "react";
import { listInboxTickets, listMyTickets, getTicket, createTicket } from "../../api/support";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import SupportThread from "../../components/SupportThread";
const STATUS_FILTERS = ["", "open", "in_progress", "resolved"];
const STATUS_LABELS = {
  "": "All",
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved"
};
function TicketList({
  tickets,
  loading,
  onOpen
}) {
  if (loading) return <p className="text-slate-400 mt-6">Loading…</p>;
  if (tickets.length === 0) return <p className="text-slate-400 mt-6">No tickets here.</p>;
  return <div className="mt-4 space-y-3">
      {tickets.map(t => <div key={t.id} onClick={() => onOpen(t.id)} className="bg-white rounded-lg border border-slate-200 p-4 cursor-pointer hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">{t.subject}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.fromType?.replace("_", " ")} · {t.messages?.length || 0} messages · {new Date(t.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ml-3 ${t.status === "open" ? "bg-amber-100 text-amber-700" : t.status === "in_progress" ? "bg-sky-100 text-sky-700" : "bg-green-100 text-green-700"}`}>
              {t.status?.replace("_", " ")}
            </span>
          </div>
        </div>)}
    </div>;
}
function SupportInboxPage({
  senderType,
  canResolve,
  pageTitle,
  showEscalate,
  orgId
}) {
  useDocumentTitle(pageTitle || "Support Inbox");
  const [view, setView] = useState("inbox");
  const [inboxTickets, setInboxTickets] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEscalateForm, setShowEscalateForm] = useState(false);
  const [escalateForm, setEscalateForm] = useState({
    subject: "",
    message: ""
  });
  const [escalating, setEscalating] = useState(false);
  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listInboxTickets(statusFilter || undefined);
      setInboxTickets(data);
    } catch {
      setError("Couldn't load support tickets.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);
  const loadMyTickets = useCallback(async () => {
    if (senderType !== "org_admin") return;
    try {
      const data = await listMyTickets();
      setMyTickets(data);
    } catch {}
  }, [senderType]);
  useEffect(() => {
    loadInbox();
    loadMyTickets();
  }, [loadInbox, loadMyTickets]);
  async function openTicket(id) {
    try {
      const t = await getTicket(id);
      setActiveTicket(t);
    } catch {
      setError("Couldn't load ticket.");
    }
  }
  async function handleEscalate(e) {
    e.preventDefault();
    setEscalating(true);
    setError(null);
    try {
      await createTicket({
        ...escalateForm
      });
      setShowEscalateForm(false);
      setEscalateForm({
        subject: "",
        message: ""
      });
      await loadMyTickets();
      setView("mine");
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't escalate ticket.");
    } finally {
      setEscalating(false);
    }
  }
  const currentTickets = view === "inbox" ? inboxTickets : myTickets;
  return <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">{pageTitle || "Support Inbox"}</h1>
        {showEscalate && <button onClick={() => setShowEscalateForm(true)} className="rounded-md bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700 transition-colors">
            Escalate to Platform
          </button>}
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {showEscalateForm && <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
          <p className="font-medium text-slate-800 mb-4">Escalate issue to Super Admin</p>
          <form onSubmit={handleEscalate} className="space-y-3">
            <input type="text" required placeholder="Subject" value={escalateForm.subject} onChange={e => setEscalateForm(f => ({
          ...f,
          subject: e.target.value
        }))} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
            <textarea required placeholder="Describe the issue…" value={escalateForm.message} onChange={e => setEscalateForm(f => ({
          ...f,
          message: e.target.value
        }))} rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 resize-none" />
            <div className="flex gap-2">
              <button type="submit" disabled={escalating} className="rounded-md bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition-colors">
                {escalating ? "Sending…" : "Send to Super Admin"}
              </button>
              <button type="button" onClick={() => setShowEscalateForm(false)} className="rounded-md border border-slate-200 text-slate-600 px-4 py-2 text-sm hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>}

      {showEscalate && <div className="flex gap-2 mb-4">
          <button onClick={() => {
        setView("inbox");
        setActiveTicket(null);
      }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === "inbox" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
            Inbox
          </button>
          <button onClick={() => {
        setView("mine");
        setActiveTicket(null);
      }} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === "mine" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
            My Escalated Tickets {myTickets.length > 0 && `(${myTickets.length})`}
          </button>
        </div>}

      {view === "inbox" && <div className="flex gap-2 mb-4">
          {STATUS_FILTERS.map(s => <button key={s || "all"} onClick={() => {
        setStatusFilter(s);
        setActiveTicket(null);
      }} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${statusFilter === s ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
              {STATUS_LABELS[s]}
            </button>)}
        </div>}

      {activeTicket ? <div>
          <button onClick={() => setActiveTicket(null)} className="text-sm text-sky-600 hover:underline mb-3">← All tickets</button>
          <SupportThread ticket={activeTicket} currentSenderType={view === "mine" ? senderType : senderType} canResolve={view === "inbox" ? canResolve : false} onUpdated={async () => {
        const t = await getTicket(activeTicket.id);
        setActiveTicket(t);
        loadInbox();
        loadMyTickets();
      }} />
        </div> : <TicketList tickets={currentTickets} loading={loading} onOpen={openTicket} />}
    </div>;
}
export default SupportInboxPage;