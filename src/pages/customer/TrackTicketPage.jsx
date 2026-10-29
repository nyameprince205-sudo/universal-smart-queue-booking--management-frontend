import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
ArrowLeft,
ArrowRight,
Clock3,
Users,
CheckCircle2,
XCircle,
AlertCircle,
Building2,
MapPin,
Ticket,
RefreshCw,
Radio,
PartyPopper,
Hourglass,
} from "lucide-react";

import { trackTicket } from "../../api/queue";
import { createQueueSocket } from "../../api/socket";
import { formatDuration } from "../../utils/formatDuration";

const STATUS_COPY = {
waiting: {
label: "Waiting in queue",
color: "bg-amber-50 text-amber-700 ring-amber-200",
icon: Hourglass,
},
called: {
label: "You're being called!",
color: "bg-sky-50 text-sky-700 ring-sky-200",
icon: Radio,
},
serving: {
label: "Now being served",
color: "bg-indigo-50 text-indigo-700 ring-indigo-200",
icon: Users,
},
completed: {
label: "Completed",
color: "bg-green-50 text-green-700 ring-green-200",
icon: CheckCircle2,
},
cancelled: {
label: "Cancelled",
color: "bg-slate-100 text-slate-600 ring-slate-200",
icon: XCircle,
},
missed: {
label: "Missed",
color: "bg-red-50 text-red-700 ring-red-200",
icon: AlertCircle,
},
};

const TERMINAL_MESSAGES = {
completed: "You've been served. Thank you for visiting!",
cancelled: "This ticket was cancelled.",
missed:
"This ticket was marked as missed. If you still need service, please check in again.",
};

function formatTime(value) {
if (!value) return null;

const date = new Date(value);

if (Number.isNaN(date.getTime())) return null;

return date.toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit",
});
}

function MetricCard({ icon: Icon, label, value, detail }) {
return ( <div className="rounded-2xl border border-warm-border bg-warm-card p-4 sm:p-5"> <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-600/10 text-forest-700"> <Icon className="h-5 w-5" /> </div>


  <p className="mt-4 text-xs font-medium text-warm-muted sm:text-sm">
    {label}
  </p>

  <p className="mt-1 break-words font-display text-2xl font-semibold text-warm-ink sm:text-3xl">
    {value}
  </p>

  {detail && (
    <p className="mt-1 text-xs leading-5 text-warm-muted">{detail}</p>
  )}
</div>


);
}

function TrackTicketPage() {
const { uuid } = useParams();

const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [notFound, setNotFound] = useState(false);
const [error, setError] = useState(false);
const [lastUpdated, setLastUpdated] = useState(null);

const socketRef = useRef(null);

const load = useCallback(async () => {
try {
const result = await trackTicket(uuid);


  setData(result);
  setNotFound(false);
  setError(false);
  setLastUpdated(new Date());
} catch (err) {
  if (err.response?.status === 404) {
    setNotFound(true);
  } else {
    setError(true);
  }
} finally {
  setLoading(false);
}


}, [uuid]);

useEffect(() => {
setLoading(true);
setData(null);
setNotFound(false);
setError(false);
load();
}, [load]);

useEffect(() => {
if (!data?.branchId) return;


const socket = createQueueSocket();

socketRef.current = socket;
socket.connect();
socket.emit("join-branch-queue", data.branchId);
socket.on("queue:update", load);

return () => {
  socket.emit("leave-branch-queue", data.branchId);
  socket.off("queue:update", load);
  socket.disconnect();
  socketRef.current = null;
};


}, [data?.branchId, load]);

if (loading) {
return ( <div className="flex min-h-screen items-center justify-center bg-warm-bg px-4"> <div className="text-center"> <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-600/10 text-forest-700"> <RefreshCw className="h-6 w-6 animate-spin" /> </div> <p className="mt-4 font-display text-lg font-semibold text-warm-ink">
Loading your ticket </p> <p className="mt-1 text-sm text-warm-muted">
Getting your latest queue information… </p> </div> </div>
);
}

if (notFound) {
return ( <div className="flex min-h-screen items-center justify-center bg-warm-bg px-4"> <div className="w-full max-w-md rounded-3xl border border-warm-border bg-warm-card p-8 text-center shadow-sm"> <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600"> <Ticket className="h-8 w-8" /> </div>


      <h1 className="mt-5 font-display text-2xl font-semibold text-warm-ink">
        Ticket not found
      </h1>

      <p className="mt-3 text-sm leading-7 text-warm-muted">
        This tracking link may be invalid or expired. Please check the link
        you received and try again.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back home
      </Link>
    </div>
  </div>
);


}

if (!data) {
return ( <div className="flex min-h-screen items-center justify-center bg-warm-bg px-4"> <div className="w-full max-w-md rounded-3xl border border-warm-border bg-warm-card p-8 text-center"> <AlertCircle className="mx-auto h-10 w-10 text-amber-600" />


      <h1 className="mt-4 font-display text-xl font-semibold text-warm-ink">
        Unable to load your ticket
      </h1>

      <p className="mt-2 text-sm leading-6 text-warm-muted">
        There was a problem retrieving your queue information.
      </p>

      <button
        type="button"
        onClick={() => {
          setLoading(true);
          load();
        }}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-700"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  </div>
);


}

const isTerminal = ["completed", "cancelled", "missed"].includes(
data.status
);

const statusInfo = STATUS_COPY[data.status] || {
label: String(data.status || "Unknown").replaceAll("_", " "),
color: "bg-slate-100 text-slate-600 ring-slate-200",
icon: Ticket,
};

const StatusIcon = statusInfo.icon;
const estimatedArrival = formatTime(data.estimatedArrivalTime);

return ( <div className="min-h-screen bg-warm-bg font-sans text-warm-ink">
{/* HEADER */} <header className="border-b border-warm-border bg-warm-card"> <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6"> <Link
         to="/"
         className="inline-flex items-center gap-2 text-sm font-semibold text-warm-muted transition hover:text-forest-700"
       > <ArrowLeft className="h-4 w-4" />
Back home </Link>


      <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
        </span>
        Live queue tracking
      </div>
    </div>
  </header>

  <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
    {/* BUSINESS INFORMATION */}
    <div className="mb-7 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-600/10 text-forest-700">
        <Building2 className="h-7 w-7" />
      </div>

      <h1 className="mt-4 font-display text-2xl font-semibold text-warm-ink sm:text-3xl">
        {data.organizationName || "Your queue"}
      </h1>

      {data.branchName && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-warm-muted">
          <MapPin className="h-4 w-4" />
          {data.branchName}
        </p>
      )}

      <p className="mt-2 text-sm text-warm-muted">
        Follow your ticket and see the latest available queue information.
      </p>
    </div>

    {/* MAIN TICKET */}
    <section className="overflow-hidden rounded-3xl border border-warm-border bg-warm-card shadow-sm">
      <div className="bg-forest-900 px-6 py-8 text-center text-white sm:px-10 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-600">
          Your ticket number
        </p>

        <div className="mt-4">
          <p className="font-display text-5xl font-bold tracking-tight sm:text-7xl">
            {data.ticketNumber}
          </p>
        </div>

        <div className="mt-5 flex justify-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset ${statusInfo.color}`}
          >
            <StatusIcon className="h-4 w-4" />
            {statusInfo.label}
          </span>
        </div>

        <p className="mt-4 text-sm text-white/75">
          Service: {data.serviceName || "General service"}
        </p>
      </div>

      <div className="p-5 sm:p-8">
        {error && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">
                We couldn't refresh your ticket
              </p>
              <p className="mt-1 leading-6">
                The information below may be out of date. Try refreshing
                the ticket information.
              </p>
              <button
                type="button"
                onClick={load}
                className="mt-2 font-semibold underline underline-offset-2"
              >
                Refresh ticket
              </button>
            </div>
          </div>
        )}

        {isTerminal ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-forest-600/10 text-forest-700">
              {data.status === "completed" ? (
                <PartyPopper className="h-8 w-8" />
              ) : (
                <StatusIcon className="h-8 w-8" />
              )}
            </div>

            <h2 className="mt-5 font-display text-xl font-semibold text-warm-ink">
              {data.status === "completed"
                ? "Thank you for visiting!"
                : data.status === "cancelled"
                  ? "Ticket cancelled"
                  : "Ticket marked as missed"}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-warm-muted">
              {TERMINAL_MESSAGES[data.status]}
            </p>

            <Link
              to="/organizations"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-700"
            >
              Find another business
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard
                icon={Users}
                label="Customers ahead"
                value={data.customersAhead ?? "—"}
                detail="People ahead of you in the queue"
              />

              <MetricCard
                icon={Clock3}
                label="Estimated waiting time"
                value={
                  data.estimatedWaitSeconds != null
                    ? formatDuration(data.estimatedWaitSeconds)
                    : "Not available"
                }
                detail="An estimate that may change as the queue moves"
              />
            </div>

            {estimatedArrival && (
              <div className="mt-4 flex items-center gap-4 rounded-2xl border border-gold-600/30 bg-gold-600/10 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-600 text-warm-ink">
                  <Clock3 className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-sm text-warm-muted">
                    Estimated turn
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold text-warm-ink">
                    {estimatedArrival}
                  </p>
                </div>
              </div>
            )}

            {data.status === "called" && (
              <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <div className="flex items-start gap-3">
                  <Radio className="mt-0.5 h-6 w-6 shrink-0 text-sky-700" />
                  <div>
                    <h2 className="font-display text-lg font-semibold text-sky-900">
                      It's your turn!
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-sky-800">
                      Your ticket is being called. Please follow the
                      business's instructions and proceed when directed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.status === "serving" && (
              <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-indigo-700" />
                  <div>
                    <h2 className="font-display text-lg font-semibold text-indigo-900">
                      You are being served
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-indigo-800">
                      Please follow the staff's instructions while your
                      service is in progress.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>

    {/* QUEUE OVERVIEW */}
    <section className="mt-5 grid gap-4 sm:grid-cols-2">
      <MetricCard
        icon={Ticket}
        label="Now serving"
        value={data.nowServingTicketNumber || "—"}
        detail="Current ticket being served"
      />

      <MetricCard
        icon={CheckCircle2}
        label="Completed today"
        value={data.customersCompletedToday ?? 0}
        detail="Customers served at this branch today"
      />
    </section>

    {/* LIVE UPDATE INFORMATION */}
    <div className="mt-6 rounded-2xl border border-warm-border bg-warm-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <Radio className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-warm-ink">
            Your queue information updates automatically
          </p>
          <p className="mt-1 text-xs leading-6 text-warm-muted">
            Keep this page open to follow changes. Waiting times and
            estimated turns can change as customers are served.
          </p>

          {lastUpdated && (
            <p className="mt-2 text-xs text-warm-muted">
              Last updated at{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={load}
          aria-label="Refresh ticket information"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-warm-border text-warm-muted transition hover:bg-warm-bg hover:text-forest-700"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>

    <p className="mt-6 text-center text-xs leading-6 text-warm-muted">
      Please keep your ticket number available when visiting the service
      desk.
    </p>
  </main>

  <footer className="border-t border-warm-border bg-warm-card">
    <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-xs text-warm-muted sm:flex-row sm:px-6 sm:text-left">
      <p>Less waiting. More living.</p>
      <Link
        to="/"
        className="font-semibold text-forest-700 transition hover:text-forest-600"
      >
        Universal Smart Queue & Booking
      </Link>
    </div>
  </footer>
</div>


);
}

export default TrackTicketPage;


