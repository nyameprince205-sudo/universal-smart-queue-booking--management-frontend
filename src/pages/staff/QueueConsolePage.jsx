import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import { getBoard, listCounters, checkIn, callNext, markServing, completeTicket } from "../../api/queue";
import { lookupCustomerByPhone, quickRegisterCustomer } from "../../api/customers";
import { listBookings } from "../../api/adminBookings";
import { formatBookingTime } from "../../utils/formatBookingTime";
import { listBranches } from "../../api/branches";
import { listServices } from "../../api/services";
import { createQueueSocket } from "../../api/socket";

const STATUS_LABELS = { waiting: "Waiting", called: "Called", serving: "Serving" };
const STATUS_ORDER = ["waiting", "called", "serving"];

function TicketCard({ ticket, onStartServing, onComplete }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-800">{ticket.ticketNumber}</p>
        {ticket.priority > 0 && (
          <span className="text-xs font-medium text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">Priority</span>
        )}
      </div>
      <p className="text-sm text-slate-600 mt-1">{ticket.customer?.name}</p>
      <p className="text-xs text-slate-400">{ticket.service?.name}</p>
      {ticket.status === "called" && (
        <button
          onClick={() => onStartServing(ticket.id)}
          className="mt-2 w-full rounded-md bg-sky-600 text-white text-sm py-1.5 hover:bg-sky-500 transition-colors"
        >
          Start Serving
        </button>
      )}
      {ticket.status === "serving" && (
        <button
          onClick={() => onComplete(ticket.id)}
          className="mt-2 w-full rounded-md bg-green-600 text-white text-sm py-1.5 hover:bg-green-500 transition-colors"
        >
          Complete
        </button>
      )}
    </div>
  );
}

// NEW — answers a real gap: a customer who ALREADY booked (their phone was
// captured at booking time) had no way to be checked in without staff
// asking for their phone number all over again via CheckInPanel's lookup
// below — even though it's already sitting right there on their booking
// record. This shows today's bookings still awaiting arrival, with
// name/phone/service already visible, and checks them in with one click
// using the SAME checkIn() call CheckInPanel uses — just with the
// customer/service/bookingId already known instead of looked up.
const AWAITING_STATUSES = ["pending", "confirmed"];

function TodaysBookingsPanel({ branchId, onCheckedIn }) {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const todayIso = new Date().toISOString().slice(0, 10);
      const data = await listBookings(todayIso, branchId);
      setBookings(data.filter((b) => AWAITING_STATUSES.includes(b.status)));
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load today's bookings.");
    }
  }, [branchId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCheckIn(booking) {
    setCheckingInId(booking.id);
    setError(null);
    try {
      await checkIn({
        customerId: booking.customerId,
        serviceId: booking.serviceId,
        branchId,
        bookingId: booking.id,
      });
      setBookings((prev) => prev.filter((b) => b.id !== booking.id));
      onCheckedIn();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't check this booking in.");
    } finally {
      setCheckingInId(null);
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <p className="text-sm font-medium text-slate-500 mb-3">Today's Bookings</p>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      {bookings === null && <p className="text-sm text-slate-400">Loading…</p>}
      {bookings?.length === 0 && <p className="text-sm text-slate-400">No bookings awaiting arrival today.</p>}

      {bookings && bookings.length > 0 && (
        <div className="space-y-2">
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between border border-slate-100 rounded-md px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{b.customer?.name}</p>
                <p className="text-xs text-slate-500">
                  {b.customer?.phone} · {b.service?.name} · {formatBookingTime(b.bookingTime)}
                </p>
              </div>
              <button
                onClick={() => handleCheckIn(b)}
                disabled={checkingInId === b.id}
                className="rounded-md bg-sky-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-sky-500 disabled:opacity-50 transition-colors shrink-0 ml-2"
              >
                {checkingInId === b.id ? "Checking in…" : "Check In"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Separate component so its own form state (phone/name/etc) doesn't need
// to live in the parent and doesn't get wiped by every board update.
function CheckInPanel({ branchId, services, onCheckedIn }) {
  const [phone, setPhone] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Real bug fix: this panel used to check a customer in WITHOUT ever
  // telling the backend which booking (if any) it belonged to — so even
  // a customer who'd already booked, and got found here by phone, would
  // have their booking's status silently never update past whatever it
  // was before. TodaysBookingsPanel above never had this problem (it
  // always knows the bookingId already); this repairs the same gap here,
  // by searching today's bookings for a match once a customer is found.
  const [matchedBooking, setMatchedBooking] = useState(null);

  async function handleLookup(e) {
    e.preventDefault();
    setError(null);
    setFoundCustomer(null);
    setNotFound(false);
    setMatchedBooking(null);
    try {
      const customer = await lookupCustomerByPhone(phone);
      setFoundCustomer(customer);

      // Deliberately NOT date-filtered — a customer's booking could be for
      // today, a future date they're arriving early for, or a date that
      // was simply entered wrong when it was made. Searching only "today"
      // meant a booking dated even one day off from today could never be
      // found or linked here, no matter what actually happened with the
      // customer. If more than one match exists, the soonest one wins —
      // simple, predictable, and right in the overwhelmingly common case
      // of a customer having at most one outstanding booking at a time.
      const allBookings = await listBookings(undefined, branchId).catch(() => []);
      const matches = allBookings
        .filter((b) => b.customerId === customer.id && ["pending", "confirmed"].includes(b.status))
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
      const match = matches[0] || null;
      if (match) {
        setMatchedBooking(match);
        setServiceId(match.serviceId);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(err.response?.data?.error || "Couldn't look up that number.");
      }
    }
  }

  async function handleCheckIn(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      let customer = foundCustomer;
      if (!customer) {
        customer = await quickRegisterCustomer({ name, phone });
      }
      await checkIn({
        customerId: customer.id,
        serviceId,
        branchId,
        bookingId: matchedBooking ? matchedBooking.id : undefined,
      });
      setPhone("");
      setFoundCustomer(null);
      setNotFound(false);
      setName("");
      setServiceId("");
      setMatchedBooking(null);
      onCheckedIn();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't check this customer in.");
    } finally {
      setSubmitting(false);
    }
  }

  const readyToCheckIn = (foundCustomer || (notFound && name.trim())) && serviceId;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <p className="text-sm font-medium text-slate-500 mb-3">Check In a Customer</p>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={foundCustomer || notFound ? handleCheckIn : handleLookup} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="tel"
            required
            placeholder="Customer phone number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setFoundCustomer(null);
              setNotFound(false);
              setMatchedBooking(null);
            }}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          {!foundCustomer && !notFound && (
            <button type="submit" className="rounded-md bg-slate-800 text-white px-3 py-2 text-sm hover:bg-slate-700">
              Look Up
            </button>
          )}
        </div>

        {foundCustomer && <p className="text-sm text-green-700">Found: {foundCustomer.name}</p>}
        {matchedBooking && (
          <p className="text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded-md px-2 py-1.5">
            Linked to their existing booking ({matchedBooking.service?.name}, {new Date(matchedBooking.bookingDate).toLocaleDateString()} at {formatBookingTime(matchedBooking.bookingTime)})
          </p>
        )}

        {notFound && (
          <div>
            <p className="text-sm text-slate-500 mb-1">No customer found — enter a name to register them:</p>
            <input
              type="text"
              required
              placeholder="Customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        )}

        {(foundCustomer || notFound) && (
          <>
            <select
              required
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select a service…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!readyToCheckIn || submitting}
              className="w-full rounded-md bg-sky-600 text-white py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "Checking in…" : "Check In"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}

function QueueConsolePage() {
  const { profile } = useAuth();

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(profile?.branchId || null);

  const [board, setBoard] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedCounterId, setSelectedCounterId] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const socketRef = useRef(null);

  useEffect(() => {
    if (profile?.branchId || branches.length) return;
    listBranches().then(setBranches).catch(() => {});
  }, [profile, branches.length]);

  const loadBoardAndCounters = useCallback(async (currentBranchId) => {
    setLoading(true);
    setError(null);
    try {
      const [boardData, countersData, servicesData] = await Promise.all([
        getBoard(currentBranchId),
        listCounters(currentBranchId),
        listServices(),
      ]);
      setBoard(boardData);
      setCounters(countersData);
      setServices(servicesData);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load the queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!branchId) return;

    loadBoardAndCounters(branchId);

    const socket = createQueueSocket();
    socketRef.current = socket;
    socket.connect();
    socket.emit("join-branch-queue", branchId);
    socket.on("queue:update", (updatedBoard) => setBoard(updatedBoard));

    return () => {
      socket.emit("leave-branch-queue", branchId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [branchId, loadBoardAndCounters]);

  async function handleCallNext() {
    setActionError(null);
    try {
      await callNext(selectedCounterId);
    } catch (err) {
      setActionError(err.response?.data?.error || "Couldn't call the next customer.");
    }
  }

  async function handleStartServing(ticketId) {
    setActionError(null);
    try {
      await markServing(ticketId);
    } catch (err) {
      setActionError(err.response?.data?.error || "Couldn't update this ticket.");
    }
  }

  async function handleComplete(ticketId) {
    setActionError(null);
    try {
      await completeTicket(ticketId);
    } catch (err) {
      setActionError(err.response?.data?.error || "Couldn't complete this ticket.");
    }
  }

  if (!branchId) {
    return (
      <div className="min-h-screen bg-warm-bg p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Staff Queue Console</h1>
          <LogoutButton />
        </div>
        <div className="mt-6 max-w-sm">
          <label className="block text-sm font-medium text-slate-700">Which branch?</label>
          <select
            onChange={(e) => setBranchId(e.target.value)}
            defaultValue=""
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
          >
            <option value="" disabled>
              Select a branch…
            </option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  const ticketsByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = board.filter((t) => t.status === status);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-warm-bg p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Staff Queue Console</h1>
        <div className="flex items-center gap-4">
          <Link to="/staff/customers" className="text-sm text-sky-600 hover:underline">
            Customers
          </Link>
          <LogoutButton />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-500 mb-3">Call Next Customer</p>
            {actionError && <p className="mb-2 text-sm text-red-600">{actionError}</p>}
            <select
              value={selectedCounterId}
              onChange={(e) => setSelectedCounterId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 mb-3"
            >
              <option value="">Select your counter…</option>
              {counters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {counters.length === 0 && (
              <p className="text-xs text-slate-400 mb-3">
                No counters set up for this branch yet — ask your Org Admin to add one.
              </p>
            )}
            <button
              onClick={handleCallNext}
              disabled={!selectedCounterId}
              className="w-full rounded-md bg-slate-800 text-white py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Call Next
            </button>
          </div>

          <TodaysBookingsPanel branchId={branchId} onCheckedIn={() => {}} />

          <CheckInPanel branchId={branchId} services={services} onCheckedIn={() => {}} />
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <p className="text-slate-400">Loading…</p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-4">
              {STATUS_ORDER.map((status) => (
                <div key={status}>
                  <p className="text-sm font-medium text-slate-500 mb-2">
                    {STATUS_LABELS[status]} ({ticketsByStatus[status].length})
                  </p>
                  <div className="space-y-2">
                    {ticketsByStatus[status].length === 0 && (
                      <p className="text-xs text-slate-300 italic">None</p>
                    )}
                    {ticketsByStatus[status].map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onStartServing={handleStartServing}
                        onComplete={handleComplete}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QueueConsolePage;
