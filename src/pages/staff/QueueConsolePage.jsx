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
import apiClient from "../../api/client";
const STATUS_LABELS = {
  waiting: "Waiting",
  called: "Called",
  serving: "Serving"
};
const STATUS_ORDER = ["waiting", "called", "serving"];
function TicketCard({
  ticket,
  onStartServing,
  onComplete
}) {
  return <div className="bg-white rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-800">{ticket.ticketNumber}</p>
        {ticket.priority > 0 && <span className="text-xs font-medium text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">Priority</span>}
      </div>
      <p className="text-sm text-slate-600 mt-1">{ticket.customer?.name}</p>
      <p className="text-xs text-slate-400">{ticket.service?.name}</p>
      {ticket.status === "called" && <button onClick={() => onStartServing(ticket.id)} className="mt-2 w-full rounded-md bg-sky-600 text-white text-sm py-1.5 hover:bg-sky-500 transition-colors">
          Start Serving
        </button>}
      {ticket.status === "serving" && <button onClick={() => onComplete(ticket.id)} className="mt-2 w-full rounded-md bg-green-600 text-white text-sm py-1.5 hover:bg-green-500 transition-colors">
          Complete
        </button>}
    </div>;
}
const AWAITING_STATUSES = ["pending", "confirmed"];
function TodaysBookingsPanel({
  branchId,
  serviceIds,
  onCheckedIn
}) {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);
  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await listBookings(undefined, branchId);
      setBookings(data.filter(b => AWAITING_STATUSES.includes(b.status) && (!serviceIds || serviceIds.some(id => String(id) === String(b.serviceId)))));
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load bookings.");
    }
  }, [branchId, serviceIds]);
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
        bookingId: booking.id
      });
      setBookings(prev => prev.filter(b => b.id !== booking.id));
      onCheckedIn();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't check this booking in.");
    } finally {
      setCheckingInId(null);
    }
  }
  return <div className="bg-white rounded-lg border border-slate-200 p-5">
      <p className="text-sm font-medium text-slate-500 mb-3">Bookings Awaiting Arrival</p>

      {error && <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      {bookings === null && <p className="text-sm text-slate-400">Loading…</p>}
      {bookings?.length === 0 && <p className="text-sm text-slate-400">No bookings awaiting arrival.</p>}

      {bookings && bookings.length > 0 && <div className="space-y-2">
          {bookings.map(b => <div key={b.id} className="flex items-center justify-between border border-slate-100 rounded-md px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{b.customer?.name}</p>
                <p className="text-xs text-slate-500">
                  {b.customer?.phone} · {b.service?.name}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(b.bookingDate).toLocaleDateString()} at {formatBookingTime(b.bookingTime)}
                </p>
              </div>
              <button onClick={() => handleCheckIn(b)} disabled={checkingInId === b.id} className="rounded-md bg-sky-600 text-white text-xs font-medium px-3 py-1.5 hover:bg-sky-500 disabled:opacity-50 transition-colors shrink-0 ml-2">
                {checkingInId === b.id ? "Checking in…" : "Check In"}
              </button>
            </div>)}
        </div>}
    </div>;
}
function WalkInPanel({
  branchId,
  services,
  onCheckedIn
}) {
  const [open, setOpen] = useState(false);
  return <div className="bg-white rounded-lg border border-slate-200">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
        <span>Walk-in / Phone lookup</span>
        <span className="text-slate-400">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="border-t border-slate-100 px-5 pb-5 pt-3">
          <CheckInPanel branchId={branchId} services={services} onCheckedIn={() => {
        onCheckedIn();
        setOpen(false);
      }} />
        </div>}
    </div>;
}
function CheckInPanel({
  branchId,
  services,
  onCheckedIn
}) {
  const [phone, setPhone] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
      const allBookings = await listBookings(undefined, branchId).catch(() => []);
      const matches = allBookings.filter(b => String(b.customerId) === String(customer.id) && ["pending", "confirmed"].includes(b.status)).sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));
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
        customer = await quickRegisterCustomer({
          name,
          phone
        });
      }
      await checkIn({
        customerId: customer.id,
        serviceId,
        branchId,
        bookingId: matchedBooking ? matchedBooking.id : undefined
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
  const readyToCheckIn = (foundCustomer || notFound && name.trim()) && serviceId;
  return <div className="bg-white rounded-lg border border-slate-200 p-5">
      <p className="text-sm font-medium text-slate-500 mb-3">Check In a Customer</p>

      {error && <div className="mb-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={foundCustomer || notFound ? handleCheckIn : handleLookup} className="space-y-3">
        <div className="flex gap-2">
          <input type="tel" required placeholder="Customer phone number" value={phone} onChange={e => {
          setPhone(e.target.value);
          setFoundCustomer(null);
          setNotFound(false);
          setMatchedBooking(null);
        }} className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
          {!foundCustomer && !notFound && <button type="submit" className="rounded-md bg-slate-800 text-white px-3 py-2 text-sm hover:bg-slate-700">
              Look Up
            </button>}
        </div>

        {foundCustomer && <p className="text-sm text-green-700">Found: {foundCustomer.name}</p>}
        {matchedBooking && <p className="text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded-md px-2 py-1.5">
            Linked to their existing booking ({matchedBooking.service?.name}, {new Date(matchedBooking.bookingDate).toLocaleDateString()} at {formatBookingTime(matchedBooking.bookingTime)})
          </p>}

        {notFound && <div>
            <p className="text-sm text-slate-500 mb-1">No customer found — enter a name to register them:</p>
            <input type="text" required placeholder="Customer name" value={name} onChange={e => setName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
          </div>}

        {(foundCustomer || notFound) && <>
            <select required value={serviceId} onChange={e => setServiceId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
              <option value="">Select a service…</option>
              {services.map(s => <option key={s.id} value={s.id}>
                  {s.name}
                </option>)}
            </select>
            <button type="submit" disabled={!readyToCheckIn || submitting} className="w-full rounded-md bg-sky-600 text-white py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {submitting ? "Checking in…" : "Check In"}
            </button>
          </>}
      </form>
    </div>;
}
function QueueConsolePage() {
  const {
    profile
  } = useAuth();
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(profile?.branchId || null);
  const [board, setBoard] = useState([]);
  const [myCounter, setMyCounter] = useState(undefined);
  const isOrgAdmin = profile?.role === "ORG_ADMIN";
  const [counters, setCounters] = useState([]);
  const [selectedCounterId, setSelectedCounterId] = useState("");
  const [services, setServices] = useState([]);
  const [myServiceIds, setMyServiceIds] = useState(null);
  const myServiceIdsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const socketRef = useRef(null);
  useEffect(() => {
    if (profile?.branchId || branches.length) return;
    listBranches().then(setBranches).catch(() => {});
  }, [profile, branches.length]);
  const loadBoardAndCounters = useCallback(async currentBranchId => {
    setLoading(true);
    setError(null);
    try {
      const [boardData, servicesData, counterRes] = await Promise.all([getBoard(currentBranchId), listServices(), apiClient.get("/queue/my-counter").catch(() => ({
        data: {
          counter: null
        }
      }))]);
      setBoard(boardData);
      setServices(servicesData);
      setMyCounter(counterRes.data.counter);
      if (!isOrgAdmin) {
        const mine = await apiClient.get("/staff/my-services").then(r => r.data).catch(() => null);
        const ids = mine && !mine.handlesAllServices ? mine.serviceIds : null;
        setMyServiceIds(ids);
        myServiceIdsRef.current = ids;
      }
      if (isOrgAdmin) {
        const countersData = await listCounters(currentBranchId).catch(() => []);
        setCounters(countersData);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load the queue.");
    } finally {
      setLoading(false);
    }
  }, [isOrgAdmin]);
  useEffect(() => {
    if (!branchId) return;
    loadBoardAndCounters(branchId);
    const socket = createQueueSocket();
    socketRef.current = socket;
    socket.connect();
    socket.emit("join-branch-queue", branchId);
    socket.on("queue:update", updatedBoard => {
      const allowed = myServiceIdsRef.current;
      setBoard(allowed ? updatedBoard.filter(t => allowed.some(id => String(id) === String(t.serviceId))) : updatedBoard);
    });
    return () => {
      socket.emit("leave-branch-queue", branchId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [branchId, loadBoardAndCounters]);
  async function handleCallNext() {
    setActionError(null);
    try {
      await callNext(isOrgAdmin ? selectedCounterId : myCounter.id);
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
    return <div className="min-h-screen bg-warm-bg p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Staff Queue Console</h1>
          <LogoutButton />
        </div>
        <div className="mt-6 max-w-sm">
          <label className="block text-sm font-medium text-slate-700">Which branch?</label>
          <select onChange={e => setBranchId(e.target.value)} defaultValue="" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800">
            <option value="" disabled>
              Select a branch…
            </option>
            {branches.map(b => <option key={b.id} value={b.id}>
                {b.name}
              </option>)}
          </select>
        </div>
      </div>;
  }
  const ticketsByStatus = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = board.filter(t => t.status === status);
    return acc;
  }, {});
  return <div className="min-h-screen bg-warm-bg p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Staff Queue Console</h1>
        <div className="flex items-center gap-4">
          <Link to="/staff/customers" className="text-sm text-sky-600 hover:underline">
            Customers
          </Link>
          <Link to="/staff/support" className="text-sm text-sky-600 hover:underline">
            Support
          </Link>
          <LogoutButton />
        </div>
      </div>

      {error && <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-sm font-medium text-slate-500 mb-3">Call Next Customer</p>
            {actionError && <p className="mb-2 text-sm text-red-600">{actionError}</p>}
            {isOrgAdmin ? <>
                <select value={selectedCounterId} onChange={e => setSelectedCounterId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 mb-3">
                  <option value="">Which counter are you on?</option>
                  {counters.map(c => <option key={c.id} value={c.id}>
                      {c.name}
                    </option>)}
                </select>
                {counters.length === 0 && <p className="text-xs text-slate-400 mb-3">
                    No counters set up for this branch yet — add one from Branches.
                  </p>}
              </> : <>
                {myCounter === undefined && <p className="text-sm text-slate-400 mb-3">Loading your counter…</p>}

                {myCounter === null && <div className="mb-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                    <p className="text-sm text-amber-800 font-medium">No counter assigned to you</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Ask your Org Admin to assign you one before calling customers.
                    </p>
                  </div>}

                {myCounter && <div className="mb-3 rounded-md bg-slate-50 border border-slate-200 px-3 py-2">
                    <p className="text-xs text-slate-500">You are on</p>
                    <p className="text-lg font-semibold text-slate-800 leading-tight">{myCounter.name}</p>
                    {myCounter.branchName && <p className="text-xs text-slate-400">{myCounter.branchName}</p>}
                  </div>}
              </>}

            <button onClick={handleCallNext} disabled={isOrgAdmin ? !selectedCounterId : !myCounter} className="w-full rounded-md bg-slate-800 text-white py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Call Next
            </button>
          </div>

          <TodaysBookingsPanel branchId={branchId} serviceIds={myServiceIds} onCheckedIn={() => {}} />

          <WalkInPanel branchId={branchId} services={myServiceIds ? services.filter(s => myServiceIds.some(id => String(id) === String(s.id))) : services} onCheckedIn={() => {}} />
        </div>

        <div className="lg:col-span-2">
          {loading ? <p className="text-slate-400">Loading…</p> : <div className="grid sm:grid-cols-3 gap-4">
              {STATUS_ORDER.map(status => <div key={status}>
                  <p className="text-sm font-medium text-slate-500 mb-2">
                    {STATUS_LABELS[status]} ({ticketsByStatus[status].length})
                  </p>
                  <div className="space-y-2">
                    {ticketsByStatus[status].length === 0 && <p className="text-xs text-slate-300 italic">None</p>}
                    {ticketsByStatus[status].map(ticket => <TicketCard key={ticket.id} ticket={ticket} onStartServing={handleStartServing} onComplete={handleComplete} />)}
                  </div>
                </div>)}
            </div>}
        </div>
      </div>
    </div>;
}
export default QueueConsolePage;