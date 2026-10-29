import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
ArrowLeft,
ArrowRight,
CalendarDays,
Clock3,
MapPin,
Ticket,
XCircle,
RefreshCw,
Search,
CalendarCheck,
Building2,
CheckCircle2,
CircleDashed,
AlertCircle,
} from "lucide-react";

import { listMyBookings, cancelMyBooking } from "../../api/myBookings";
import LogoutButton from "../../components/LogoutButton";
import { formatBookingTime } from "../../utils/formatBookingTime";
import useCustomerBookingUpdates from "../../hooks/useCustomerBookingUpdates";

const STATUS_STYLES = {
pending: "bg-amber-50 text-amber-700 ring-amber-200",
confirmed: "bg-sky-50 text-sky-700 ring-sky-200",
checked_in: "bg-indigo-50 text-indigo-700 ring-indigo-200",
completed: "bg-green-50 text-green-700 ring-green-200",
cancelled: "bg-slate-100 text-slate-500 ring-slate-200",
no_show: "bg-red-50 text-red-700 ring-red-200",
waitlisted: "bg-purple-50 text-purple-700 ring-purple-200",
};

const STATUS_LABELS = {
pending: "Pending confirmation",
confirmed: "Confirmed",
checked_in: "Checked in",
completed: "Completed",
cancelled: "Cancelled",
no_show: "Missed appointment",
waitlisted: "On waitlist",
};

const CANCELLABLE_STATUSES = ["pending", "confirmed", "waitlisted"];

const FILTERS = [
{ label: "All bookings", value: "all" },
{ label: "Upcoming", value: "upcoming" },
{ label: "Completed", value: "completed" },
{ label: "Cancelled", value: "cancelled" },
];

function getBookingDate(booking) {
const date = new Date(booking.bookingDate);
return Number.isNaN(date.getTime()) ? null : date;
}

function isUpcoming(booking) {
if (!["pending", "confirmed", "waitlisted", "checked_in"].includes(booking.status)) {
return false;
}

const date = getBookingDate(booking);
if (!date) return false;

const today = new Date();
today.setHours(0, 0, 0, 0);
date.setHours(0, 0, 0, 0);

return date >= today;
}

function formatStatus(status) {
return (
STATUS_LABELS[status] ||
String(status || "Unknown").replaceAll("_", " ")
);
}

function BookingStatus({ status }) {
return (
<span
className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-200"
      }`}
>
{status === "confirmed" && <CheckCircle2 className="h-3.5 w-3.5" />}
{status === "pending" && <CircleDashed className="h-3.5 w-3.5" />}
{status === "waitlisted" && <Clock3 className="h-3.5 w-3.5" />}
{formatStatus(status)} </span>
);
}

function BookingCard({ booking, cancelingId, onCancel }) {
const ticket = booking.queueTickets?.[0];
const cancellable = CANCELLABLE_STATUSES.includes(booking.status);

return ( <article className="overflow-hidden rounded-2xl border border-warm-border bg-warm-card shadow-sm transition hover:shadow-md"> <div className="p-5 sm:p-6"> <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"> <div className="flex min-w-0 items-start gap-4"> <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-600/10 text-forest-700"> <Building2 className="h-6 w-6" /> </div>


        <div className="min-w-0">
          <h2 className="break-words font-display text-lg font-semibold text-warm-ink">
            {booking.organization?.name || "Business"}
          </h2>

          <p className="mt-1 text-sm text-warm-muted">
            {booking.service?.name || "Service"}
          </p>

          {booking.branch?.name && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-warm-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {booking.branch.name}
            </p>
          )}
        </div>
      </div>

      <div className="sm:shrink-0">
        <BookingStatus status={booking.status} />
      </div>
    </div>

    <div className="mt-5 grid gap-3 rounded-xl bg-warm-bg p-4 sm:grid-cols-2">
      <div className="flex items-start gap-3">
        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
        <div>
          <p className="text-xs text-warm-muted">Booking date</p>
          <p className="mt-1 text-sm font-semibold text-warm-ink">
            {getBookingDate(booking)
              ? getBookingDate(booking).toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Date unavailable"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-forest-600" />
        <div>
          <p className="text-xs text-warm-muted">Booking time</p>
          <p className="mt-1 text-sm font-semibold text-warm-ink">
            {formatBookingTime(booking.bookingTime)}
          </p>
        </div>
      </div>
    </div>

    {booking.status === "waitlisted" && (
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
        <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-purple-700" />
        <div>
          <p className="text-sm font-semibold text-purple-800">
            You’re on the waitlist
          </p>
          <p className="mt-1 text-sm leading-6 text-purple-700">
            This time was fully booked. If a place opens up, your booking
            may be confirmed automatically and you’ll be notified. You
            don’t need to do anything while you wait.
          </p>
        </div>
      </div>
    )}

    {booking.status === "confirmed" && (
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
        <div>
          <p className="text-sm font-semibold text-sky-800">
            Your booking is confirmed
          </p>
          <p className="mt-1 text-sm leading-6 text-sky-700">
            Keep your booking details handy when you visit the business.
          </p>
        </div>
      </div>
    )}

    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-warm-border pt-4">
      {ticket && (
        <Link
          to={`/track/${ticket.uuid}`}
          className="inline-flex items-center gap-2 rounded-xl bg-forest-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-700"
        >
          <Ticket className="h-4 w-4" />
          Track queue
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      {cancellable && (
        <button
          type="button"
          onClick={() => onCancel(booking)}
          disabled={cancelingId === booking.id}
          className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cancelingId === booking.id ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          {cancelingId === booking.id ? "Cancelling…" : "Cancel booking"}
        </button>
      )}

      {booking.status === "completed" && (
        <span className="inline-flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          Visit completed
        </span>
      )}
    </div>
  </div>
</article>


);
}

function MyBookingsPage() {
const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [cancelingId, setCancelingId] = useState(null);
const [activeFilter, setActiveFilter] = useState("all");

const loadBookings = useCallback(async () => {
setLoading(true);
setError(null);


try {
  const data = await listMyBookings();
  setBookings(Array.isArray(data) ? data : []);
} catch (err) {
  setError(err.response?.data?.error || "Couldn't load your bookings.");
} finally {
  setLoading(false);
}


}, []);

useEffect(() => {
loadBookings();
}, [loadBookings]);

useCustomerBookingUpdates(loadBookings);

async function handleCancel(booking) {
const confirmed = window.confirm(
`Are you sure you want to cancel your booking at ${
        booking.organization?.name || "this business"
      } on ${
        getBookingDate(booking)?.toLocaleDateString() || "the scheduled date"
      }?`
);


if (!confirmed) return;

setCancelingId(booking.id);
setError(null);

try {
  await cancelMyBooking(booking.id);
  await loadBookings();
} catch (err) {
  setError(err.response?.data?.error || "Couldn't cancel this booking.");
} finally {
  setCancelingId(null);
}


}

const filteredBookings = bookings.filter((booking) => {
if (activeFilter === "upcoming") return isUpcoming(booking);
if (activeFilter === "completed") return booking.status === "completed";
if (activeFilter === "cancelled") return booking.status === "cancelled";
return true;
});

const upcomingCount = bookings.filter(isUpcoming).length;
const completedCount = bookings.filter(
(booking) => booking.status === "completed"
).length;

return ( <div className="min-h-screen bg-warm-bg font-sans text-warm-ink"> <header className="border-b border-warm-border bg-warm-card"> <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6"> <Link
         to="/"
         className="inline-flex items-center gap-2 text-sm font-semibold text-warm-muted transition hover:text-forest-700"
       > <ArrowLeft className="h-4 w-4" />
Back to home </Link>


      <LogoutButton />
    </div>
  </header>

  <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
    <section className="relative overflow-hidden rounded-3xl bg-forest-900 px-6 py-8 text-white sm:px-9 sm:py-10">
      <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-gold-600/10 blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
            Your account
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            My bookings
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            All your appointments and queue bookings, together in one
            place. Review your details and keep track of what’s next.
          </p>
        </div>

        <Link
          to="/organizations"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gold-600 px-5 py-3 text-sm font-bold text-warm-ink transition hover:brightness-105"
        >
          Find a business <Search className="h-4 w-4" />
        </Link>
      </div>
    </section>

    <section
      aria-label="Booking summary"
      className="mt-6 grid gap-4 sm:grid-cols-3"
    >
      <div className="rounded-2xl border border-warm-border bg-warm-card p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-warm-muted">Total bookings</p>
          <CalendarCheck className="h-5 w-5 text-forest-600" />
        </div>
        <p className="mt-3 font-display text-3xl font-semibold text-warm-ink">
          {loading ? "—" : bookings.length}
        </p>
        <p className="mt-1 text-xs text-warm-muted">
          All your booking records
        </p>
      </div>

      <div className="rounded-2xl border border-warm-border bg-warm-card p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-warm-muted">Upcoming</p>
          <Clock3 className="h-5 w-5 text-sky-600" />
        </div>
        <p className="mt-3 font-display text-3xl font-semibold text-warm-ink">
          {loading ? "—" : upcomingCount}
        </p>
        <p className="mt-1 text-xs text-warm-muted">
          Visits to prepare for
        </p>
      </div>

      <div className="rounded-2xl border border-warm-border bg-warm-card p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-warm-muted">Completed</p>
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        </div>
        <p className="mt-3 font-display text-3xl font-semibold text-warm-ink">
          {loading ? "—" : completedCount}
        </p>
        <p className="mt-1 text-xs text-warm-muted">
          Visits you have completed
        </p>
      </div>
    </section>

    {error && (
      <div
        role="alert"
        className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1">{error}</p>
          <button
            type="button"
            onClick={loadBookings}
            className="mt-2 font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      </div>
    )}

    <section className="mt-9">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-warm-ink sm:text-2xl">
            Your booking history
          </h2>
          <p className="mt-1 text-sm text-warm-muted">
            Select a category to find the booking you need.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBookings}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-warm-border bg-warm-card px-4 py-2.5 text-sm font-semibold text-warm-ink transition hover:bg-white disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.value;

          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              aria-pressed={active}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "bg-forest-600 text-white"
                  : "border border-warm-border bg-warm-card text-warm-muted hover:border-forest-600/40 hover:text-forest-700"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="mt-5 space-y-4" aria-label="Loading bookings">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-2xl border border-warm-border bg-warm-card"
            />
          ))}
        </div>
      )}

      {!loading && !error && filteredBookings.length === 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-warm-border bg-warm-card px-5 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-600/10 text-forest-700">
            <CalendarDays className="h-7 w-7" />
          </div>

          <h3 className="mt-5 font-display text-xl font-semibold text-warm-ink">
            {bookings.length === 0
              ? "Your booking journey starts here"
              : "No bookings in this category"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-warm-muted">
            {bookings.length === 0
              ? "Find a business, explore its services, and make your first booking when you're ready."
              : "Try another filter to see more of your booking history."}
          </p>

          {bookings.length === 0 ? (
            <Link
              to="/organizations"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-700"
            >
              Find a business <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="mt-5 rounded-xl border border-warm-border px-5 py-3 text-sm font-semibold text-forest-700 transition hover:bg-warm-bg"
            >
              View all bookings
            </button>
          )}
        </div>
      )}

      {!loading && filteredBookings.length > 0 && (
        <div className="mt-5 space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              cancelingId={cancelingId}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </section>

    <div className="mt-10 flex flex-col items-center justify-between gap-3 rounded-2xl border border-warm-border bg-warm-card p-5 text-center sm:flex-row sm:text-left">
      <div>
        <p className="font-semibold text-warm-ink">
          Need to make another booking?
        </p>
        <p className="mt-1 text-sm text-warm-muted">
          Find a business and explore its available services.
        </p>
      </div>

      <Link
        to="/organizations"
        className="inline-flex shrink-0 items-center gap-2 font-semibold text-forest-700 transition hover:text-forest-600"
      >
        Browse businesses <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </main>

  <footer className="border-t border-warm-border bg-warm-card">
    <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-center text-xs text-warm-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
      <p>Manage your visits in one place.</p>
      <Link to="/" className="font-semibold text-forest-700 hover:underline">
        Universal Smart Queue & Booking
      </Link>
    </div>
  </footer>
</div>


);
}

export default MyBookingsPage;

