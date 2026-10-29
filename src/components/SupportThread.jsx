import { useState } from "react";
import {
MessageCircle,
Send,
CheckCircle2,
Clock3,
AlertCircle,
LoaderCircle,
LifeBuoy,
ShieldCheck,
CalendarDays,
UserRound,
} from "lucide-react";
import { replyToTicket, resolveTicket } from "../api/support";

const STATUS_STYLES = {
open: {
label: "Open",
badge: "border-amber-200 bg-amber-50 text-amber-800",
icon: AlertCircle,
dot: "bg-amber-500",
},
in_progress: {
label: "In Progress",
badge: "border-sky-200 bg-sky-50 text-sky-800",
icon: Clock3,
dot: "bg-sky-500",
},
resolved: {
label: "Resolved",
badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
icon: CheckCircle2,
dot: "bg-emerald-500",
},
};

function formatDate(value) {
if (!value) return "Date unavailable";

const date = new Date(value);

if (Number.isNaN(date.getTime())) return "Date unavailable";

return date.toLocaleDateString(undefined, {
day: "numeric",
month: "short",
year: "numeric",
});
}

function formatTime(value) {
if (!value) return "";

const date = new Date(value);

if (Number.isNaN(date.getTime())) return "";

return date.toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit",
});
}

function SupportThread({
ticket,
currentSenderType,
canResolve,
onUpdated,
}) {
const [reply, setReply] = useState("");
const [sending, setSending] = useState(false);
const [resolving, setResolving] = useState(false);
const [error, setError] = useState(null);

const isResolved = ticket.status === "resolved";
const status = STATUS_STYLES[ticket.status] || {
label: ticket.status || "Unknown",
badge: "border-slate-200 bg-slate-100 text-slate-700",
icon: AlertCircle,
dot: "bg-slate-400",
};

const StatusIcon = status.icon;
const messages = ticket.messages || [];

async function handleReply(event) {
event.preventDefault();


const trimmedReply = reply.trim();

if (!trimmedReply || sending || isResolved) return;

setSending(true);
setError(null);

try {
  await replyToTicket(ticket.id, trimmedReply);
  setReply("");
  await onUpdated?.();
} catch (err) {
  setError(
    err.response?.data?.error || "Couldn't send your reply. Please try again."
  );
} finally {
  setSending(false);
}


}

async function handleResolve() {
if (resolving || isResolved) return;


const confirmed = window.confirm(
  "Mark this ticket as resolved? The conversation will be closed."
);

if (!confirmed) return;

setResolving(true);
setError(null);

try {
  await resolveTicket(ticket.id);
  await onUpdated?.();
} catch (err) {
  setError(
    err.response?.data?.error || "Couldn't resolve this ticket. Please try again."
  );
} finally {
  setResolving(false);
}


}

return ( <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
{/* Ticket header */} <header className="border-b border-slate-200 bg-gradient-to-r from-white to-emerald-50/50 px-5 py-5 sm:px-6"> <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"> <div className="flex min-w-0 items-start gap-3"> <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"> <LifeBuoy className="h-5 w-5" aria-hidden="true" /> </div>


        <div className="min-w-0">
          <h2 className="break-words text-base font-bold leading-6 text-slate-900 sm:text-lg">
            {ticket.subject || "Support request"}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Ticket #{ticket.id}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(ticket.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.badge}`}
        >
          <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {status.label}
        </span>

        {canResolve && !isResolved && (
          <button
            type="button"
            onClick={handleResolve}
            disabled={resolving}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resolving ? (
              <LoaderCircle
                className="h-3.5 w-3.5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}

            {resolving ? "Resolving..." : "Resolve ticket"}
          </button>
        )}
      </div>
    </div>
  </header>

  {/* Conversation */}
  <div
    className="max-h-[28rem] space-y-5 overflow-y-auto bg-slate-50/70 px-4 py-6 sm:px-6"
    aria-label="Support conversation"
    aria-live="polite"
  >
    {messages.length > 0 ? (
      messages.map((message) => {
        const isOwn = message.senderType === currentSenderType;

        return (
          <div
            key={message.id}
            className={`flex items-end gap-2.5 ${
              isOwn ? "justify-end" : "justify-start"
            }`}
          >
            {!isOwn && (
              <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </div>
            )}

            <div
              className={`flex max-w-[85%] flex-col sm:max-w-[75%] ${
                isOwn ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`mb-1.5 flex flex-wrap items-center gap-2 px-1 text-xs ${
                  isOwn
                    ? "justify-end text-slate-500"
                    : "text-slate-500"
                }`}
              >
                <span className="font-semibold">
                  {message.senderName || (isOwn ? "You" : "Support")}
                </span>

                {isOwn && (
                  <ShieldCheck
                    className="h-3.5 w-3.5 text-emerald-600"
                    aria-label="Your message"
                  />
                )}
              </div>

              <div
                className={`rounded-2xl px-4 py-3 shadow-sm ${
                  isOwn
                    ? "rounded-br-md bg-emerald-700 text-white"
                    : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-6">
                  {message.message}
                </p>
              </div>

              <time
                dateTime={message.createdAt || undefined}
                className={`mt-1.5 px-1 text-[11px] ${
                  isOwn ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {formatTime(message.createdAt)}
              </time>
            </div>

            {isOwn && (
              <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </div>
            )}
          </div>
        );
      })
    ) : (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-slate-800">
          No messages yet
        </h3>

        <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
          Your conversation will appear here when the first message is sent.
        </p>
      </div>
    )}
  </div>

  {/* Error message */}
  {error && (
    <div
      role="alert"
      className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:mx-6"
    >
      <AlertCircle
        className="mt-0.5 h-4 w-4 shrink-0"
        aria-hidden="true"
      />
      <p>{error}</p>
    </div>
  )}

  {/* Reply form or resolved state */}
  {isResolved ? (
    <footer className="border-t border-emerald-100 bg-emerald-50/70 px-5 py-5 sm:px-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </div>

        <div>
          <p className="text-sm font-semibold text-emerald-950">
            This ticket has been resolved
          </p>
          <p className="mt-1 text-sm leading-6 text-emerald-800">
            The conversation is closed. If further assistance is needed,
            create a new support ticket.
          </p>
        </div>
      </div>
    </footer>
  ) : (
    <footer className="border-t border-slate-200 bg-white p-4 sm:p-5 sm:px-6">
      <form onSubmit={handleReply}>
        <label
          htmlFor={`support-reply-${ticket.id}`}
          className="mb-2 block text-sm font-semibold text-slate-800"
        >
          Write a reply
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <textarea
              id={`support-reply-${ticket.id}`}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Describe your response..."
              rows={2}
              maxLength={5000}
              disabled={sending}
              className="block w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-1.5 text-right text-xs text-slate-400">
              {reply.length}/5000 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={!reply.trim() || sending}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <>
                <LoaderCircle
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                Send reply
              </>
            )}
          </button>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Please avoid sharing passwords or other sensitive account
          information in support messages.
        </p>
      </form>
    </footer>
  )}
</section>


);
}

export default SupportThread;
