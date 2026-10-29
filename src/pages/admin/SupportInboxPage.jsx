import { useEffect, useState, useCallback } from "react";
import {
Inbox,
MessageSquare,
AlertTriangle,
ArrowLeft,
RefreshCw,
Send,
X,
Ticket,
Clock3,
CheckCircle2,
CircleDot,
LoaderCircle,
ChevronRight,
} from "lucide-react";

import {
listInboxTickets,
listMyTickets,
getTicket,
createTicket,
} from "../../api/support";

import useDocumentTitle from "../../hooks/useDocumentTitle";
import SupportThread from "../../components/SupportThread";

const STATUS_FILTERS = ["", "open", "in_progress", "resolved"];

const STATUS_LABELS = {
"": "All Tickets",
open: "Open",
in_progress: "In Progress",
resolved: "Resolved",
};

const STATUS_STYLES = {
open: "bg-amber-50 text-amber-700 ring-amber-600/20",
in_progress: "bg-sky-50 text-sky-700 ring-sky-600/20",
resolved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

const STATUS_ICONS = {
open: CircleDot,
in_progress: Clock3,
resolved: CheckCircle2,
};

function formatDate(dateValue) {
if (!dateValue) return "Date unavailable";

const date = new Date(dateValue);

if (Number.isNaN(date.getTime())) {
return "Date unavailable";
}

return date.toLocaleDateString(undefined, {
day: "numeric",
month: "short",
year: "numeric",
});
}

function formatStatus(status) {
if (!status) return "Unknown";

return status
.split("_")
.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
.join(" ");
}

function TicketStatus({ status }) {
const Icon = STATUS_ICONS[status] || CircleDot;

return (
<span
className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[status] ||
        "bg-slate-50 text-slate-600 ring-slate-500/20"
      }`}
> <Icon size={12} aria-hidden="true" />
{formatStatus(status)} </span>
);
}

function TicketList({ tickets, loading, onOpen, onRefresh }) {
if (loading) {
return ( <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-14 text-center"> <LoaderCircle
       size={30}
       className="animate-spin text-sky-600"
       aria-hidden="true"
     /> <p className="mt-3 text-sm font-medium text-slate-700">
Loading support tickets </p> <p className="mt-1 text-sm text-slate-500">
Please wait while we retrieve your tickets. </p> </div>
);
}

if (tickets.length === 0) {
return ( <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"> <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100"> <Inbox size={26} className="text-slate-500" aria-hidden="true" /> </div>


    <h3 className="mt-4 text-base font-semibold text-slate-800">
      No tickets found
    </h3>

    <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
      There are no tickets matching this selection. Try another status
      filter or refresh the list.
    </p>

    <button
      type="button"
      onClick={onRefresh}
      className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
    >
      <RefreshCw size={15} aria-hidden="true" />
      Refresh tickets
    </button>
  </div>
);


}

return ( <div className="mt-4 space-y-3">
{tickets.map((ticket) => {
const messageCount = Array.isArray(ticket.messages)
? ticket.messages.length
: 0;


    return (
      <button
        key={ticket.id}
        type="button"
        onClick={() => onOpen(ticket.id)}
        className="group w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:border-sky-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 sm:flex">
            <Ticket size={21} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="break-words font-semibold text-slate-800 transition-colors group-hover:text-sky-700">
                {ticket.subject || "Untitled ticket"}
              </h3>

              <TicketStatus status={ticket.status} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              {ticket.fromType && (
                <span className="inline-flex items-center gap-1.5">
                  <Inbox size={13} aria-hidden="true" />
                  {formatStatus(ticket.fromType)}
                </span>
              )}

              <span className="inline-flex items-center gap-1.5">
                <MessageSquare size={13} aria-hidden="true" />
                {messageCount} {messageCount === 1 ? "message" : "messages"}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={13} aria-hidden="true" />
                Updated {formatDate(ticket.updatedAt)}
              </span>
            </div>
          </div>

          <ChevronRight
            size={19}
            className="mt-1 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-600"
            aria-hidden="true"
          />
        </div>
      </button>
    );
  })}
</div>


);
}

function SupportInboxPage({
senderType,
canResolve,
pageTitle,
showEscalate,
orgId,
}) {
useDocumentTitle(pageTitle || "Support Inbox");

const [view, setView] = useState("inbox");
const [inboxTickets, setInboxTickets] = useState([]);
const [myTickets, setMyTickets] = useState([]);
const [activeTicket, setActiveTicket] = useState(null);

const [statusFilter, setStatusFilter] = useState("open");
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState(null);

const [showEscalateForm, setShowEscalateForm] = useState(false);
const [escalateForm, setEscalateForm] = useState({
subject: "",
message: "",
});
const [escalating, setEscalating] = useState(false);

const loadInbox = useCallback(
async ({ silent = false } = {}) => {
if (silent) {
setRefreshing(true);
} else {
setLoading(true);
}


  try {
    const data = await listInboxTickets(statusFilter || undefined);
    setInboxTickets(Array.isArray(data) ? data : []);
    setError(null);
  } catch {
    setError("Couldn't load support tickets. Please try again.");
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
},
[statusFilter]


);

const loadMyTickets = useCallback(async () => {
if (senderType !== "org_admin") return;


try {
  const data = await listMyTickets();
  setMyTickets(Array.isArray(data) ? data : []);
} catch {
  setError("Couldn't load your escalated tickets. Please try again.");
}


}, [senderType]);

useEffect(() => {
loadInbox();
}, [loadInbox]);

useEffect(() => {
loadMyTickets();
}, [loadMyTickets]);

async function openTicket(id) {
setError(null);


try {
  const ticket = await getTicket(id);
  setActiveTicket(ticket);
} catch {
  setError("Couldn't load this ticket. Please try again.");
}


}

async function refreshCurrentView() {
if (view === "inbox") {
await loadInbox({ silent: true });
} else {
await loadMyTickets();
}
}

async function handleEscalate(event) {
event.preventDefault();


const subject = escalateForm.subject.trim();
const message = escalateForm.message.trim();

if (!subject || !message) {
  setError("Please provide both a subject and a description.");
  return;
}

setEscalating(true);
setError(null);

try {
  await createTicket({ subject, message });

  setShowEscalateForm(false);
  setEscalateForm({ subject: "", message: "" });

  await loadMyTickets();
  setView("mine");
  setActiveTicket(null);
} catch (err) {
  setError(
    err.response?.data?.error || "Couldn't escalate ticket. Please try again."
  );
} finally {
  setEscalating(false);
}


}

function changeView(nextView) {
setView(nextView);
setActiveTicket(null);
setError(null);
}

const currentTickets = view === "inbox" ? inboxTickets : myTickets;
const currentLoading = view === "inbox" ? loading : false;

const openCount = inboxTickets.filter(
(ticket) => ticket.status === "open"
).length;

const inProgressCount = inboxTickets.filter(
(ticket) => ticket.status === "in_progress"
).length;

const resolvedCount = inboxTickets.filter(
(ticket) => ticket.status === "resolved"
).length;

return ( <div className="min-h-full bg-slate-50/70 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"> <div className="mx-auto max-w-5xl"> <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <div className="flex items-center gap-2 text-sm font-medium text-sky-700"> <MessageSquare size={16} aria-hidden="true" />
Support Centre </div>


        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {pageTitle || "Support Inbox"}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
          View support requests, follow conversations, and keep track of
          issues until they are resolved.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={refreshCurrentView}
          disabled={refreshing || escalating}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
            aria-hidden="true"
          />
          Refresh
        </button>

        {showEscalate && (
          <button
            type="button"
            onClick={() => {
              setShowEscalateForm((previous) => !previous);
              setError(null);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            {showEscalateForm ? (
              <X size={16} aria-hidden="true" />
            ) : (
              <AlertTriangle size={16} aria-hidden="true" />
            )}
            {showEscalateForm ? "Close Form" : "Escalate Issue"}
          </button>
        )}
      </div>
    </header>

    {error && (
      <div
        role="alert"
        className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
      >
        <AlertTriangle
          size={18}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />

        <div className="flex-1 leading-6">{error}</div>

        <button
          type="button"
          onClick={() => setError(null)}
          aria-label="Dismiss error"
          className="rounded p-1 text-red-500 transition hover:bg-red-100 hover:text-red-700"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    )}

    {showEscalateForm && showEscalate && (
      <section className="mb-7 overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
        <div className="border-b border-amber-100 bg-amber-50/70 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle size={20} aria-hidden="true" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Escalate to Super Admin
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-600">
                Describe the issue clearly so the platform support team
                can investigate it.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleEscalate} className="space-y-5 p-5 sm:p-6">
          <div>
            <label
              htmlFor="escalation-subject"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Subject <span className="text-red-500">*</span>
            </label>

            <input
              id="escalation-subject"
              type="text"
              required
              maxLength={200}
              placeholder="Briefly describe the issue"
              value={escalateForm.subject}
              onChange={(event) =>
                setEscalateForm((form) => ({
                  ...form,
                  subject: event.target.value,
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="escalation-message"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description <span className="text-red-500">*</span>
            </label>

            <textarea
              id="escalation-message"
              required
              maxLength={10000}
              placeholder="Explain what happened, what you expected, and any steps you've already tried."
              value={escalateForm.message}
              onChange={(event) =>
                setEscalateForm((form) => ({
                  ...form,
                  message: event.target.value,
                }))
              }
              rows={5}
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Please avoid including passwords or other sensitive
              credentials.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={escalating}
              onClick={() => {
                setShowEscalateForm(false);
                setError(null);
              }}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                escalating ||
                !escalateForm.subject.trim() ||
                !escalateForm.message.trim()
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              {escalating ? (
                <>
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} aria-hidden="true" />
                  Send to Super Admin
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    )}

    {showEscalate && (
      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        <button
          type="button"
          onClick={() => changeView("inbox")}
          aria-pressed={view === "inbox"}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
            view === "inbox"
              ? "bg-slate-900 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Inbox size={16} aria-hidden="true" />
          Inbox
          {inboxTickets.length > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                view === "inbox"
                  ? "bg-white/15 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {inboxTickets.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => changeView("mine")}
          aria-pressed={view === "mine"}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 ${
            view === "mine"
              ? "bg-slate-900 text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Ticket size={16} aria-hidden="true" />
          My Escalated Tickets

          {myTickets.length > 0 && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                view === "mine"
                  ? "bg-white/15 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {myTickets.length}
            </span>
          )}
        </button>
      </div>
    )}

    {!activeTicket && view === "inbox" && (
      <section className="mb-6">
        <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Open
              </p>
              <CircleDot
                size={17}
                className="text-amber-600"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {openCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                In Progress
              </p>
              <Clock3
                size={17}
                className="text-sky-600"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {inProgressCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Resolved
              </p>
              <CheckCircle2
                size={17}
                className="text-emerald-600"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {resolvedCount}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Support Tickets
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a ticket to view its conversation.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Filter tickets by status">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status || "all"}
                type="button"
                onClick={() => {
                  setStatusFilter(status);
                  setActiveTicket(null);
                }}
                aria-pressed={statusFilter === status}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 sm:text-sm ${
                  statusFilter === status
                    ? "bg-sky-700 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      </section>
    )}

    {activeTicket ? (
      <section>
        <button
          type="button"
          onClick={() => {
            setActiveTicket(null);
            setError(null);
          }}
          className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-50 hover:text-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to {view === "inbox" ? "Inbox" : "My Tickets"}
        </button>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SupportThread
            ticket={activeTicket}
            currentSenderType={senderType}
            canResolve={view === "inbox" ? canResolve : false}
            onUpdated={async () => {
              try {
                const ticket = await getTicket(activeTicket.id);
                setActiveTicket(ticket);

                await Promise.all([
                  loadInbox({ silent: true }),
                  loadMyTickets(),
                ]);
              } catch {
                setError(
                  "The ticket was updated, but its latest details couldn't be refreshed."
                );
              }
            }}
          />
        </div>
      </section>
    ) : (
      <TicketList
        tickets={currentTickets}
        loading={currentLoading}
        onOpen={openTicket}
        onRefresh={refreshCurrentView}
      />
    )}

    <div className="mt-6 flex items-start gap-2 rounded-lg border border-slate-200/80 bg-white/70 px-4 py-3 text-xs leading-5 text-slate-500">
      <MessageSquare
        size={15}
        className="mt-0.5 shrink-0 text-slate-400"
        aria-hidden="true"
      />
      <p>
        Keep ticket conversations professional and include enough detail
        to help the support team understand and resolve each issue.
      </p>
    </div>
  </div>
</div>


);
}

export default SupportInboxPage;
