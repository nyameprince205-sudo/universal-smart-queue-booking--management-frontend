import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { listMyBookings, cancelMyBooking } from "../../api/myBookings";
import LogoutButton from "../../components/LogoutButton";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  checked_in: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
  no_show: "bg-red-100 text-red-700",
};

// Only these statuses can still be cancelled (see booking.controller.js's
// ALLOWED_TRANSITIONS) — shown here purely so the Cancel button doesn't
// appear on a booking where it would just fail. The backend remains the
// real source of truth for what's actually allowed; this is a UX nicety,
// not a duplicate of the state machine.
const CANCELLABLE_STATUSES = ["pending", "confirmed"];

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMyBookings();
      setBookings(data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load your bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  async function handleCancel(booking) {
    if (!window.confirm(`Cancel your booking on ${new Date(booking.bookingDate).toLocaleDateString()}?`)) return;
    setCancelingId(booking.id);
    try {
      await cancelMyBooking(booking.id);
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't cancel this booking.");
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800">My Bookings</h1>
        <LogoutButton />
      </div>

      <div className="max-w-2xl mx-auto mt-6">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && <p className="text-slate-400">Loading…</p>}

        {!loading && bookings.length === 0 && !error && (
          <p className="text-slate-400">
            No bookings yet.{" "}
            <Link to="/organizations" className="text-sky-600 hover:underline">
              Find a business
            </Link>{" "}
            to book your first one.
          </p>
        )}

        <div className="space-y-3">
          {bookings.map((booking) => {
            // Phase 16 addition: a checked-in booking has a real live queue
            // ticket behind it (see booking.controller.js's listMyBookings) —
            // this is the ONLY place in the app a logged-in customer can
            // reach their live tracking page from, other than the SMS link
            // sent at check-in time, which is easy to lose.
            const ticket = booking.queueTickets?.[0];
            return (
              <div key={booking.id} className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{booking.organization?.name}</p>
                    <p className="text-sm text-slate-500">
                      {booking.service?.name} · {booking.branch?.name}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${
                      STATUS_STYLES[booking.status] || "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {booking.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-4">
                  {ticket && (
                    <Link to={`/track/${ticket.uuid}`} className="text-sm text-sky-600 hover:underline">
                      Track live status ({ticket.ticketNumber})
                    </Link>
                  )}
                  {CANCELLABLE_STATUSES.includes(booking.status) && (
                    <button
                      onClick={() => handleCancel(booking)}
                      disabled={cancelingId === booking.id}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {cancelingId === booking.id ? "Cancelling…" : "Cancel booking"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyBookingsPage;
