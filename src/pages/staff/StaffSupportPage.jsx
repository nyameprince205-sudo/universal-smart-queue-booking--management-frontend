import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
ArrowLeft,
ArrowRight,
LifeBuoy,
Plus,
MessageSquare,
Clock3,
CheckCircle2,
AlertCircle,
LoaderCircle,
Send,
X,
RefreshCw,
Inbox,
} from "lucide-react";

import LogoutButton from "../../components/LogoutButton";
import SupportThread from "../../components/SupportThread";
import {
createTicket,
listMyTickets,
getTicket,
} from "../../api/support";

const statusStyles = {
open: "bg-amber-50 text-amber-700 ring-amber-200",
in_progress: "bg-sky-50 text-sky-700 ring-sky-200",
resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
closed: "bg-slate-100 text-slate-600 ring-slate-200",
};

function formatDate(date) {
if (!date) return "Date unavailable";

const parsedDate = new Date(date);

if (Number.isNaN(parsedDate.getTime())) {
return "Date unavailable";
}

return parsedDate.toLocaleDateString(undefined, {
day: "numeric",
month: "short",
year: "numeric",
});
}

function formatStatus(status) {
if (!status) return "Unknown";

return status
.replaceAll("_", " ")
.replace(/\b\w/g, (character) => character.toUpperCase());
}

function StaffSupportPage() {
const [tickets, setTickets] = useState([]);
const [activeTicket, setActiveTicket] = useState(null);
const [loading, setLoading] = useState(true);
const [showNew, setShowNew] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [openingTicketId, setOpeningTicketId] = useState(null);
const [error, setError] = useState(null);

const [form, setForm] = useState({
subject: "",
message: "",
});

const loadTickets = useCallback(async () => {
setError(null);


try {
  const data = await listMyTickets();
  setTickets(Array.isArray(data) ? data : []);
} catch {
  setError("Couldn't load your support tickets. Please try again.");
} finally {
  setLoading(false);
}


}, []);

useEffect(() => {
loadTickets();
}, [loadTickets]);

const openTicket = async (id) => {
setOpeningTicketId(id);
setError(null);


try {
  const ticket = await getTicket(id);
  setActiveTicket(ticket);
} catch {
  setError("Couldn't open this ticket. Please try again.");
} finally {
  setOpeningTicketId(null);
}


};

const handleCreate = async (event) => {
event.preventDefault();


const subject = form.subject.trim();
const message = form.message.trim();

if (!subject || !message) {
  setError("Please enter both a subject and a description.");
  return;
}

setSubmitting(true);
setError(null);

try {
  await createTicket({ subject, message });

  setForm({ subject: "", message: "" });
  setShowNew(false);
  setLoading(true);

  await loadTickets();
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Couldn't create your support ticket. Please try again."
  );
} finally {
  setSubmitting(false);
}


};

const handleTicketUpdated = async () => {
if (!activeTicket?.id) return;


try {
  const updatedTicket = await getTicket(activeTicket.id);
  setActiveTicket(updatedTicket);
  await loadTickets();
} catch {
  setError("Your ticket may have been updated, but we couldn't refresh it.");
}


};

const openTickets = tickets.filter(
(ticket) =>
ticket.status === "open" || ticket.status === "in_progress"
).length;

const resolvedTickets = tickets.filter(
(ticket) =>
ticket.status === "resolved" || ticket.status === "closed"
).length;

return ( <div className="surface-texture-subtle min-h-screen bg-warm-bg font-sans text-warm-ink"> <header className="sticky top-0 z-20 border-b border-warm-border bg-white/90 backdrop-blur-xl"> <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"> <div className="flex min-w-0 items-center gap-3"> <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100"> <LifeBuoy size={23} /> </div>


        <div className="min-w-0">
          <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
            Support Centre
          </h1>
          <p className="mt-0.5 text-xs text-warm-muted sm:text-sm">
            Get help from your organisation's administrator
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => {
            setShowNew((current) => !current);
            setError(null);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 sm:px-4"
        >
          {showNew ? <X size={17} /> : <Plus size={17} />}
          <span className="hidden sm:inline">
            {showNew ? "Cancel" : "New ticket"}
          </span>
          <span className="sm:hidden">
            {showNew ? "Cancel" : "New"}
          </span>
        </button>

        <LogoutButton />
      </div>
    </div>
  </header>

  <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
    <Link
      to="/staff/queue"
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-warm-muted transition hover:text-sky-700"
    >
      <ArrowLeft size={16} />
      Back to Queue Console
    </Link>

    {!activeTicket && (
      <>
        <section className="mb-8">
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
              Staff assistance
            </p>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              How can we help?
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-warm-muted sm:text-base">
              Create a support ticket to report a problem, ask a question,
              or follow up on an issue affecting your work.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              icon={MessageSquare}
              label="Total tickets"
              value={tickets.length}
              iconClass="bg-sky-50 text-sky-700"
            />

            <SummaryCard
              icon={Clock3}
              label="Awaiting resolution"
              value={openTickets}
              iconClass="bg-amber-50 text-amber-700"
            />

            <SummaryCard
              icon={CheckCircle2}
              label="Resolved or closed"
              value={resolvedTickets}
              iconClass="bg-emerald-50 text-emerald-700"
            />
          </div>
        </section>

        {showNew && (
          <section className="mb-8 overflow-hidden rounded-2xl border border-warm-border bg-white shadow-sm">
            <div className="border-b border-warm-border bg-slate-50/70 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                  <Send size={19} />
                </div>

                <div>
                  <h3 className="font-bold">Create a support ticket</h3>
                  <p className="mt-1 text-xs text-warm-muted sm:text-sm">
                    Explain the issue so your administrator can assist you.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="ticket-subject"
                  className="mb-2 block text-sm font-semibold"
                >
                  Subject <span className="text-red-500">*</span>
                </label>

                <input
                  id="ticket-subject"
                  type="text"
                  required
                  maxLength={150}
                  placeholder="e.g. Unable to check in a booking"
                  value={form.subject}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-warm-border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />

                <p className="mt-1.5 text-right text-xs text-warm-muted">
                  {form.subject.length}/150
                </p>
              </div>

              <div>
                <label
                  htmlFor="ticket-message"
                  className="mb-2 block text-sm font-semibold"
                >
                  Describe the issue{" "}
                  <span className="text-red-500">*</span>
                </label>

                <textarea
                  id="ticket-message"
                  required
                  minLength={5}
                  maxLength={5000}
                  rows={5}
                  placeholder="Tell us what happened, what you expected, and any steps that caused the problem..."
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  className="w-full resize-y rounded-xl border border-warm-border bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />

                <p className="mt-1.5 text-xs text-warm-muted">
                  Avoid including passwords or other sensitive information.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-warm-border pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setShowNew(false);
                    setForm({ subject: "", message: "" });
                    setError(null);
                  }}
                  className="rounded-xl border border-warm-border px-5 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !form.subject.trim() ||
                    form.message.trim().length < 5
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={17} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="flex-1 leading-6">{error}</p>

            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="rounded-lg p-1 transition hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-warm-border bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-warm-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h3 className="text-lg font-bold">Your tickets</h3>
              <p className="mt-1 text-sm text-warm-muted">
                Review your requests and continue conversations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                loadTickets();
              }}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-warm-border px-3.5 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                size={15}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <LoaderCircle
                size={30}
                className="animate-spin text-sky-600"
              />
              <p className="mt-4 text-sm font-medium">
                Loading your tickets...
              </p>
              <p className="mt-1 text-xs text-warm-muted">
                Please wait a moment.
              </p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
                <Inbox size={30} />
              </div>

              <h4 className="mt-5 text-base font-bold">
                No support tickets yet
              </h4>

              <p className="mt-2 max-w-sm text-sm leading-6 text-warm-muted">
                If you encounter a problem while using the queue system,
                create a ticket and your administrator can follow up.
              </p>

              <button
                type="button"
                onClick={() => setShowNew(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
              >
                <Plus size={17} />
                Create your first ticket
              </button>
            </div>
          ) : (
            <div className="divide-y divide-warm-border">
              {tickets.map((ticket) => {
                const statusClass =
                  statusStyles[ticket.status] ||
                  "bg-slate-100 text-slate-600 ring-slate-200";

                return (
                  <button
                    type="button"
                    key={ticket.id}
                    onClick={() => openTicket(ticket.id)}
                    disabled={openingTicketId !== null}
                    className="group flex w-full items-start gap-4 px-5 py-5 text-left transition hover:bg-slate-50/80 disabled:cursor-wait disabled:opacity-70 sm:px-6"
                  >
                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100 sm:flex">
                      {openingTicketId === ticket.id ? (
                        <LoaderCircle
                          size={20}
                          className="animate-spin"
                        />
                      ) : (
                        <MessageSquare size={20} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="break-words font-semibold text-warm-ink transition group-hover:text-sky-700">
                          {ticket.subject}
                        </h4>

                        <span
                          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusClass}`}
                        >
                          {formatStatus(ticket.status)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-warm-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <MessageSquare size={13} />
                          {ticket.messages?.length || 0} messages
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={13} />
                          Updated {formatDate(ticket.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <ArrowRight
                      size={18}
                      className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-600"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </>
    )}

    {activeTicket && (
      <section>
        <button
          type="button"
          onClick={() => {
            setActiveTicket(null);
            setError(null);
          }}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-warm-border bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          All tickets
        </button>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-warm-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <LifeBuoy size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-warm-muted">
                Support ticket
              </p>

              <h2 className="mt-1 break-words text-xl font-bold">
                {activeTicket.subject}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    statusStyles[activeTicket.status] ||
                    "bg-slate-100 text-slate-600 ring-slate-200"
                  }`}
                >
                  {formatStatus(activeTicket.status)}
                </span>

                <span className="text-xs text-warm-muted">
                  Last updated {formatDate(activeTicket.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <SupportThread
          ticket={activeTicket}
          currentSenderType="staff"
          canResolve={false}
          onUpdated={handleTicketUpdated}
        />
      </section>
    )}
  </main>
</div>


);
}

function SummaryCard({ icon: Icon, label, value, iconClass }) {
return ( <div className="rounded-2xl border border-warm-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"> <div className="flex items-center justify-between gap-3"> <div> <p className="text-sm font-medium text-warm-muted">{label}</p> <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p> </div>


    <div
      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
    >
      <Icon size={23} />
    </div>
  </div>
</div>


);
}

export default StaffSupportPage;
