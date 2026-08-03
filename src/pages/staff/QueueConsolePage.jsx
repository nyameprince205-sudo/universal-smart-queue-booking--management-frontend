import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import { getBoard, listCounters, checkIn, callNext, markServing, completeTicket } from "../../api/queue";
import { lookupCustomerByPhone, quickRegisterCustomer } from "../../api/customers";
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

  async function handleLookup(e) {
    e.preventDefault();
    setError(null);
    setFoundCustomer(null);
    setNotFound(false);
    try {
      const customer = await lookupCustomerByPhone(phone);
      setFoundCustomer(customer);
    } catch (err) {
      if (err.response?.status === 404) {
        // Not an error state — this is the normal "new walk-in" path, so
        // show the quick-register name field instead of a red error banner.
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
      await checkIn({ customerId: customer.id, serviceId, branchId });
      // Reset the whole form for the next walk-in rather than leaving stale
      // values a busy front-desk worker might not notice and re-submit.
      setPhone("");
      setFoundCustomer(null);
      setNotFound(false);
      setName("");
      setServiceId("");
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

  // A STAFF account is branch-scoped already (profile.branchId is set at
  // login) — no picker needed. An ORG_ADMIN's token isn't branch-scoped
  // (see queue.controller.js's callNext comment), so they have to choose
  // WHICH branch's board they're looking at.
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
    // Only an ORG_ADMIN (no fixed branchId) ever needs this list.
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

  // Fetch initial state AND connect the live socket whenever the active
  // branch changes (including the very first time it's known).
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
      // No manual board refresh needed here — the backend broadcasts
      // "queue:update" after every mutation, and the socket listener above
      // already updates `board` when that arrives.
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

  // ORG_ADMIN hasn't picked a branch yet — nothing else on this page makes
  // sense until they do.
  if (!branchId) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Staff Queue Console</h1>
        <LogoutButton />
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Call Next */}
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

          <CheckInPanel branchId={branchId} services={services} onCheckedIn={() => {}} />
        </div>

        {/* Live board */}
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
