import { useState } from "react";
import { replyToTicket, resolveTicket } from "../api/support";
const STATUS_STYLES = {
  open: "bg-amber-100 text-amber-700",
  in_progress: "bg-sky-100 text-sky-700",
  resolved: "bg-green-100 text-green-700"
};
const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved"
};
function SupportThread({
  ticket,
  currentSenderType,
  canResolve,
  onUpdated
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState(null);
  async function handleReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    setError(null);
    try {
      await replyToTicket(ticket.id, reply.trim());
      setReply("");
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't send reply.");
    } finally {
      setSending(false);
    }
  }
  async function handleResolve() {
    if (!window.confirm("Mark this ticket as resolved? The conversation will be closed.")) return;
    setResolving(true);
    setError(null);
    try {
      await resolveTicket(ticket.id);
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't resolve ticket.");
    } finally {
      setResolving(false);
    }
  }
  const isResolved = ticket.status === "resolved";
  return <div className="bg-warm-card rounded-lg border border-warm-border overflow-hidden">
      <div className="px-4 py-3 border-b border-warm-border flex items-center justify-between">
        <div>
          <p className="font-medium text-warm-ink">{ticket.subject}</p>
          <p className="text-xs text-warm-muted mt-0.5">
            Ticket #{ticket.id} · {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[ticket.status] || "bg-slate-100 text-slate-500"}`}>
            {STATUS_LABELS[ticket.status] || ticket.status}
          </span>
          {canResolve && !isResolved && <button onClick={handleResolve} disabled={resolving} className="rounded-md border border-warm-border text-warm-muted-2 text-xs px-3 py-1 hover:bg-warm-bg disabled:opacity-50 transition-colors">
              {resolving ? "Closing…" : "Mark Resolved"}
            </button>}
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {ticket.messages?.map(m => {
        const isOwn = m.senderType === currentSenderType;
        return <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs sm:max-w-sm rounded-lg px-3 py-2 ${isOwn ? "bg-forest-600 text-white" : "bg-warm-bg border border-warm-border text-warm-ink"}`}>
                <p className={`text-xs font-medium mb-1 ${isOwn ? "text-green-100" : "text-warm-muted"}`}>
                  {m.senderName}
                </p>
                <p className="text-sm leading-relaxed">{m.message}</p>
                <p className={`text-xs mt-1 ${isOwn ? "text-green-200" : "text-warm-muted"}`}>
                  {new Date(m.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
                </p>
              </div>
            </div>;
      })}
        {ticket.messages?.length === 0 && <p className="text-sm text-warm-muted text-center py-4">No messages yet.</p>}
      </div>

      {!isResolved && <div className="border-t border-warm-border p-4">
          {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
          <form onSubmit={handleReply} className="flex gap-2">
            <input type="text" value={reply} onChange={e => setReply(e.target.value)} placeholder="Write a reply…" className="flex-1 rounded-md border border-warm-border px-3 py-2 text-sm text-warm-ink bg-warm-card focus:outline-none focus:ring-2 focus:ring-forest-400" />
            <button type="submit" disabled={!reply.trim() || sending} className="rounded-md bg-forest-600 text-white px-4 py-2 text-sm font-medium hover:bg-forest-700 disabled:opacity-50 transition-colors">
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
        </div>}
      {isResolved && <div className="border-t border-warm-border px-4 py-3 text-center text-sm text-warm-muted">
          This ticket has been resolved.
        </div>}
    </div>;
}
export default SupportThread;