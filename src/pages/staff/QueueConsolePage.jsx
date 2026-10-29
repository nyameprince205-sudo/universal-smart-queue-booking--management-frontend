import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
Activity,
ArrowRight,
CalendarClock,
Check,
CheckCircle2,
ChevronDown,
ChevronUp,
Clock3,
LoaderCircle,
LogIn,
Phone,
RefreshCw,
Search,
ShieldCheck,
Ticket,
Users,
UserRoundPlus,
X,
Zap,
Headphones,
Building2,
Monitor,
CircleAlert,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import {
getBoard,
listCounters,
checkIn,
callNext,
markServing,
completeTicket,
} from "../../api/queue";
import {
lookupCustomerByPhone,
quickRegisterCustomer,
} from "../../api/customers";
import { listBookings } from "../../api/adminBookings";
import { formatBookingTime } from "../../utils/formatBookingTime";
import { listBranches } from "../../api/branches";
import { listServices } from "../../api/services";
import { createQueueSocket } from "../../api/socket";
import apiClient from "../../api/client";

const STATUS_LABELS = {
waiting: "Waiting",
called: "Called",
serving: "Serving",
};

const STATUS_ORDER = ["waiting", "called", "serving"];

const STATUS_STYLES = {
waiting: {
dot: "bg-amber-500",
badge: "bg-amber-50 text-amber-700 ring-amber-200",
column: "border-amber-200",
icon: Clock3,
},
called: {
dot: "bg-sky-500",
badge: "bg-sky-50 text-sky-700 ring-sky-200",
column: "border-sky-200",
icon: Activity,
},
serving: {
dot: "bg-emerald-500",
badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
column: "border-emerald-200",
icon: CheckCircle2,
},
};

const AWAITING_STATUSES = ["pending", "confirmed"];

function getErrorMessage(err, fallback) {
return (
err?.response?.data?.error ||
err?.response?.data?.message ||
fallback
);
}

function sameId(a, b) {
return String(a) === String(b);
}

function formatDate(date) {
if (!date) return "Date unavailable";

const parsed = new Date(date);

if (Number.isNaN(parsed.getTime())) {
return "Date unavailable";
}

return parsed.toLocaleDateString(undefined, {
day: "numeric",
month: "short",
year: "numeric",
});
}

function IconBadge({ children, className = "" }) {
return (
<span
className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${className}`}
>
{children} </span>
);
}

function PanelHeading({
icon: Icon,
title,
description,
action,
}) {
return ( <div className="mb-5 flex items-start justify-between gap-3"> <div className="flex min-w-0 items-start gap-3">
{Icon && ( <IconBadge className="bg-sky-50 text-sky-700"> <Icon size={19} /> </IconBadge>
)}


    <div className="min-w-0">
      <h2 className="font-semibold text-slate-900">{title}</h2>

      {description && (
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  </div>

  {action}
</div>


);
}

function InlineAlert({ children, type = "error", onDismiss }) {
const styles =
type === "success"
? "border-emerald-200 bg-emerald-50 text-emerald-800"
: type === "warning"
? "border-amber-200 bg-amber-50 text-amber-800"
: "border-red-200 bg-red-50 text-red-700";

return (
<div
role={type === "error" ? "alert" : "status"}
className={`flex items-start gap-2 rounded-xl border px-3 py-3 text-sm ${styles}`}
> <CircleAlert size={17} className="mt-0.5 shrink-0" />


  <div className="min-w-0 flex-1">{children}</div>

  {onDismiss && (
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss message"
      className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100"
    >
      <X size={16} />
    </button>
  )}
</div>


);
}

function PrimaryButton({
children,
loading = false,
disabled = false,
className = "",
...props
}) {
return (
<button
{...props}
disabled={disabled || loading}
className={`inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
>
{loading && <LoaderCircle size={16} className="animate-spin" />}
{children} </button>
);
}

function EmptyState({ icon: Icon = Ticket, title, description }) {
return ( <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center"> <Icon size={26} className="mb-3 text-slate-300" />


  <p className="text-sm font-semibold text-slate-700">{title}</p>

  {description && (
    <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
      {description}
    </p>
  )}
</div>


);
}

function TicketCard({ ticket, onStartServing, onComplete }) {
const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.waiting;
const isCalled = ticket.status === "called";
const isServing = ticket.status === "serving";

return ( <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"> <div className="flex items-start justify-between gap-2"> <div className="min-w-0"> <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
Ticket number </p>


      <h3 className="mt-1 break-words text-xl font-bold tracking-tight text-slate-900">
        {ticket.ticketNumber || "—"}
      </h3>
    </div>

    {ticket.priority > 0 && (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
        <Zap size={12} />
        Priority
      </span>
    )}
  </div>

  <div className="my-4 border-t border-dashed border-slate-200" />

  <div className="flex items-start gap-3">
    <IconBadge className="h-9 w-9 rounded-lg bg-slate-100 text-slate-600">
      <Users size={17} />
    </IconBadge>

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-slate-800">
        {ticket.customer?.name || "Customer"}
      </p>

      <p className="mt-1 truncate text-xs text-slate-500">
        {ticket.service?.name || "Service not specified"}
      </p>
    </div>
  </div>

  <div className="mt-4">
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyle.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
      {STATUS_LABELS[ticket.status] || ticket.status}
    </span>
  </div>

  {isCalled && (
    <button
      type="button"
      onClick={() => onStartServing(ticket.id)}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
    >
      <Activity size={16} />
      Start serving
    </button>
  )}

  {isServing && (
    <button
      type="button"
      onClick={() => onComplete(ticket.id)}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
    >
      <Check size={16} />
      Complete ticket
    </button>
  )}
</article>


);
}

function TodaysBookingsPanel({ branchId, serviceIds, onCheckedIn }) {
const [bookings, setBookings] = useState(null);
const [error, setError] = useState(null);
const [checkingInId, setCheckingInId] = useState(null);
const [refreshing, setRefreshing] = useState(false);

const load = useCallback(async () => {
setError(null);
setRefreshing(true);


try {
  const data = await listBookings(undefined, branchId);

  const filtered = data.filter(
    (booking) =>
      AWAITING_STATUSES.includes(booking.status) &&
      (!serviceIds ||
        serviceIds.some((id) => sameId(id, booking.serviceId)))
  );

  setBookings(filtered);
} catch (err) {
  setError(getErrorMessage(err, "Couldn't load bookings."));
} finally {
  setRefreshing(false);
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
    bookingId: booking.id,
  });

  setBookings((previous) =>
    previous?.filter((item) => item.id !== booking.id) ?? []
  );

  onCheckedIn();
} catch (err) {
  setError(
    getErrorMessage(err, "Couldn't check this booking in.")
  );
} finally {
  setCheckingInId(null);
}


}

return ( <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
<PanelHeading
icon={CalendarClock}
title="Today's bookings"
description="Check in customers who have arrived for their appointments."
action={ <button
         type="button"
         onClick={load}
         disabled={refreshing}
         aria-label="Refresh bookings"
         className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
       >
<RefreshCw
size={16}
className={refreshing ? "animate-spin" : ""}
/> </button>
}
/>


  {error && (
    <div className="mb-4">
      <InlineAlert>{error}</InlineAlert>
    </div>
  )}

  {bookings === null ? (
    <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
      <LoaderCircle size={17} className="animate-spin" />
      Loading bookings…
    </div>
  ) : bookings.length === 0 ? (
    <EmptyState
      icon={CalendarClock}
      title="No pending bookings"
      description="Bookings awaiting arrival will appear here."
    />
  ) : (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <article
          key={booking.id}
          className="rounded-xl border border-slate-200 p-3 transition hover:border-sky-200 hover:bg-sky-50/30"
        >
          <div className="flex items-start gap-3">
            <IconBadge className="h-9 w-9 rounded-lg bg-sky-50 text-sky-700">
              <CalendarClock size={17} />
            </IconBadge>

            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-semibold text-slate-800">
                {booking.customer?.name || "Customer"}
              </p>

              <p className="mt-1 flex items-center gap-1.5 break-all text-xs text-slate-500">
                <Phone size={12} className="shrink-0" />
                {booking.customer?.phone || "No phone number"}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {booking.service?.name || "Service"}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                {formatDate(booking.bookingDate)} ·{" "}
                {formatBookingTime(booking.bookingTime)}
              </p>

              <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium capitalize text-amber-700">
                {booking.status}
              </span>
            </div>
          </div>

          <PrimaryButton
            type="button"
            loading={checkingInId === booking.id}
            disabled={checkingInId !== null}
            onClick={() => handleCheckIn(booking)}
            className="mt-3 w-full"
          >
            <LogIn size={16} />
            {checkingInId === booking.id ? "Checking in…" : "Check in"}
          </PrimaryButton>
        </article>
      ))}
    </div>
  )}
</section>


);
}

function WalkInPanel({ branchId, services, onCheckedIn }) {
const [open, setOpen] = useState(false);

return ( <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
<button
type="button"
onClick={() => setOpen((current) => !current)}
aria-expanded={open}
className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50"
> <IconBadge className="bg-violet-50 text-violet-700"> <UserRoundPlus size={19} /> </IconBadge>


    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-slate-800">
        Walk-in check-in
      </span>

      <span className="mt-1 block text-xs leading-5 text-slate-500">
        Find an existing customer or register a new one.
      </span>
    </span>

    {open ? (
      <ChevronUp size={18} className="shrink-0 text-slate-400" />
    ) : (
      <ChevronDown size={18} className="shrink-0 text-slate-400" />
    )}
  </button>

  {open && (
    <div className="border-t border-slate-100 p-4">
      <CheckInPanel
        branchId={branchId}
        services={services}
        onCheckedIn={() => {
          onCheckedIn();
          setOpen(false);
        }}
      />
    </div>
  )}
</section>


);
}

function CheckInPanel({ branchId, services, onCheckedIn }) {
const [phone, setPhone] = useState("");
const [foundCustomer, setFoundCustomer] = useState(null);
const [notFound, setNotFound] = useState(false);
const [name, setName] = useState("");
const [serviceId, setServiceId] = useState("");
const [error, setError] = useState(null);
const [submitting, setSubmitting] = useState(false);
const [lookingUp, setLookingUp] = useState(false);
const [matchedBooking, setMatchedBooking] = useState(null);

async function handleLookup(event) {
event.preventDefault();


const normalizedPhone = phone.trim();

if (!normalizedPhone) {
  setError("Enter a customer phone number.");
  return;
}

setError(null);
setFoundCustomer(null);
setNotFound(false);
setMatchedBooking(null);
setLookingUp(true);

try {
  const customer = await lookupCustomerByPhone(normalizedPhone);

  setFoundCustomer(customer);

  const allBookings = await listBookings(undefined, branchId).catch(
    () => []
  );

  const matches = allBookings
    .filter(
      (booking) =>
        sameId(booking.customerId, customer.id) &&
        AWAITING_STATUSES.includes(booking.status)
    )
    .sort(
      (a, b) =>
        new Date(a.bookingDate).getTime() -
        new Date(b.bookingDate).getTime()
    );

  const match = matches[0] || null;

  if (match) {
    setMatchedBooking(match);
    setServiceId(String(match.serviceId));
  } else {
    setServiceId("");
  }
} catch (err) {
  if (err.response?.status === 404) {
    setNotFound(true);
  } else {
    setError(
      getErrorMessage(err, "Couldn't look up that phone number.")
    );
  }
} finally {
  setLookingUp(false);
}


}

async function handleCheckIn(event) {
event.preventDefault();


if (!foundCustomer && (!notFound || !name.trim())) {
  setError("Enter the customer's name.");
  return;
}

if (!serviceId) {
  setError("Select a service before checking in.");
  return;
}

setError(null);
setSubmitting(true);

try {
  let customer = foundCustomer;

  if (!customer) {
    customer = await quickRegisterCustomer({
      name: name.trim(),
      phone: phone.trim(),
    });
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
  setError(
    getErrorMessage(err, "Couldn't check this customer in.")
  );
} finally {
  setSubmitting(false);
}


}

const readyToCheckIn =
Boolean(foundCustomer || (notFound && name.trim())) &&
Boolean(serviceId);

const serviceOptions = services.filter(
(service) => service.active !== false
);

return ( <div> <div className="mb-5"> <p className="text-sm font-semibold text-slate-800">
Find a customer </p>


    <p className="mt-1 text-xs leading-5 text-slate-500">
      Enter their phone number to retrieve their details and any
      pending booking.
    </p>
  </div>

  {error && (
    <div className="mb-4">
      <InlineAlert onDismiss={() => setError(null)}>
        {error}
      </InlineAlert>
    </div>
  )}

  <form onSubmit={foundCustomer || notFound ? handleCheckIn : handleLookup}>
    <label
      htmlFor="walkin-phone"
      className="mb-1.5 block text-sm font-medium text-slate-700"
    >
      Phone number
    </label>

    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Phone
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          id="walkin-phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setFoundCustomer(null);
            setNotFound(false);
            setMatchedBooking(null);
            setName("");
            setServiceId("");
            setError(null);
          }}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        />
      </div>

      {!foundCustomer && !notFound && (
        <PrimaryButton
          type="submit"
          loading={lookingUp}
          className="sm:shrink-0"
        >
          <Search size={16} />
          Look up
        </PrimaryButton>
      )}
    </div>

    {foundCustomer && (
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <IconBadge className="h-9 w-9 rounded-lg bg-white text-emerald-600">
          <CheckCircle2 size={18} />
        </IconBadge>

        <div className="min-w-0">
          <p className="text-xs font-medium text-emerald-700">
            Customer found
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-emerald-900">
            {foundCustomer.name}
          </p>

          <p className="mt-1 break-all text-xs text-emerald-700">
            {foundCustomer.phone || phone}
          </p>
        </div>
      </div>
    )}

    {matchedBooking && (
      <div className="mt-3 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">
        <CalendarClock size={17} className="mt-0.5 shrink-0" />

        <div>
          <p className="font-semibold">Existing booking found</p>

          <p className="mt-1 text-xs leading-5">
            {matchedBooking.service?.name || "Service"} ·{" "}
            {formatDate(matchedBooking.bookingDate)} at{" "}
            {formatBookingTime(matchedBooking.bookingTime)}
          </p>
        </div>
      </div>
    )}

    {notFound && (
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
        <p className="text-sm font-semibold text-amber-900">
          New customer
        </p>

        <p className="mt-1 text-xs leading-5 text-amber-800">
          No customer was found with that number. Enter their name
          to register them.
        </p>

        <label
          htmlFor="walkin-name"
          className="mb-1.5 mt-3 block text-sm font-medium text-slate-700"
        >
          Customer name
        </label>

        <input
          id="walkin-name"
          type="text"
          required
          autoComplete="name"
          placeholder="Enter full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        />
      </div>
    )}

    {(foundCustomer || notFound) && (
      <div className="mt-4">
        <label
          htmlFor="walkin-service"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Service
        </label>

        <select
          id="walkin-service"
          required
          value={serviceId}
          onChange={(event) => setServiceId(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
        >
          <option value="">Choose a service…</option>

          {serviceOptions.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>

        {serviceOptions.length === 0 && (
          <p className="mt-2 text-xs text-amber-700">
            No active services are available for this selection.
          </p>
        )}

        <PrimaryButton
          type="submit"
          loading={submitting}
          disabled={!readyToCheckIn}
          className="mt-4 w-full"
        >
          <LogIn size={16} />
          {submitting ? "Checking in…" : "Confirm check-in"}
        </PrimaryButton>
      </div>
    )}
  </form>
</div>


);
}

function QueueConsolePage() {
const { profile } = useAuth();

const [branches, setBranches] = useState([]);
const [branchId, setBranchId] = useState(
profile?.branchId ? String(profile.branchId) : ""
);
const [board, setBoard] = useState([]);
const [myCounter, setMyCounter] = useState(undefined);
const [counters, setCounters] = useState([]);
const [selectedCounterId, setSelectedCounterId] = useState("");
const [services, setServices] = useState([]);
const [myServiceIds, setMyServiceIds] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [actionError, setActionError] = useState(null);
const [actionLoading, setActionLoading] = useState(false);

const isOrgAdmin = profile?.role === "ORG_ADMIN";
const socketRef = useRef(null);
const myServiceIdsRef = useRef(null);
const requestVersionRef = useRef(0);

useEffect(() => {
if (profile?.branchId || branches.length > 0) return;


let active = true;

listBranches()
  .then((data) => {
    if (active) setBranches(data);
  })
  .catch(() => {
    if (active) setBranches([]);
  });

return () => {
  active = false;
};


}, [profile?.branchId, branches.length]);

const loadBoardAndCounters = useCallback(
async (currentBranchId) => {
const requestVersion = ++requestVersionRef.current;


  setLoading(true);
  setError(null);

  try {
    const [boardData, servicesData, counterRes] = await Promise.all([
      getBoard(currentBranchId),
      listServices(),
      apiClient
        .get("/queue/my-counter")
        .catch(() => ({ data: { counter: null } })),
    ]);

    let serviceIds = null;

    if (!isOrgAdmin) {
      const mine = await apiClient
        .get("/staff/my-services")
        .then((response) => response.data)
        .catch(() => null);

      serviceIds =
        mine && !mine.handlesAllServices ? mine.serviceIds : null;
    }

    const countersData = isOrgAdmin
      ? await listCounters(currentBranchId).catch(() => [])
      : [];

    if (requestVersion !== requestVersionRef.current) return;

    myServiceIdsRef.current = serviceIds;

    setMyServiceIds(serviceIds);
    setBoard(
      serviceIds
        ? boardData.filter((ticket) =>
            serviceIds.some((id) => sameId(id, ticket.serviceId))
          )
        : boardData
    );
    setServices(servicesData);
    setMyCounter(counterRes.data.counter);
    setCounters(countersData);
  } catch (err) {
    if (requestVersion === requestVersionRef.current) {
      setError(getErrorMessage(err, "Couldn't load the queue."));
    }
  } finally {
    if (requestVersion === requestVersionRef.current) {
      setLoading(false);
    }
  }
},
[isOrgAdmin]


);

useEffect(() => {
if (!branchId) {
setLoading(false);
return;
}


loadBoardAndCounters(branchId);

const socket = createQueueSocket();
socketRef.current = socket;

socket.connect();
socket.emit("join-branch-queue", branchId);

const handleQueueUpdate = (updatedBoard) => {
  const allowed = myServiceIdsRef.current;

  setBoard(
    allowed
      ? updatedBoard.filter((ticket) =>
          allowed.some((id) => sameId(id, ticket.serviceId))
        )
      : updatedBoard
  );
};

socket.on("queue:update", handleQueueUpdate);

return () => {
  socket.emit("leave-branch-queue", branchId);
  socket.off("queue:update", handleQueueUpdate);
  socket.disconnect();

  if (socketRef.current === socket) {
    socketRef.current = null;
  }
};


}, [branchId, loadBoardAndCounters]);

async function handleCallNext() {
if (actionLoading) return;


const counterId = isOrgAdmin ? selectedCounterId : myCounter?.id;

if (!counterId) {
  setActionError("Select an available counter before calling a customer.");
  return;
}

setActionError(null);
setActionLoading(true);

try {
  await callNext(counterId);
} catch (err) {
  setActionError(
    getErrorMessage(err, "Couldn't call the next customer.")
  );
} finally {
  setActionLoading(false);
}


}

async function handleStartServing(ticketId) {
setActionError(null);


try {
  await markServing(ticketId);
} catch (err) {
  setActionError(
    getErrorMessage(err, "Couldn't update this ticket.")
  );
}


}

async function handleComplete(ticketId) {
setActionError(null);


try {
  await completeTicket(ticketId);
} catch (err) {
  setActionError(
    getErrorMessage(err, "Couldn't complete this ticket.")
  );
}


}

const ticketsByStatus = STATUS_ORDER.reduce((result, status) => {
result[status] = board.filter((ticket) => ticket.status === status);
return result;
}, {});

const totalTickets = board.length;
const waitingCount = ticketsByStatus.waiting?.length || 0;
const calledCount = ticketsByStatus.called?.length || 0;
const servingCount = ticketsByStatus.serving?.length || 0;

const visibleServices = myServiceIds
? services.filter((service) =>
myServiceIds.some((id) => sameId(id, service.id))
)
: services;

if (!branchId) {
return ( <main className="min-h-screen bg-warm-bg px-4 py-6 sm:px-6 lg:px-8"> <div className="mx-auto max-w-5xl"> <header className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6"> <div className="flex items-center gap-3"> <IconBadge className="bg-sky-600 text-white"> <Monitor size={21} /> </IconBadge>


          <div>
            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
              Staff Queue Console
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Select a branch to manage its queue.
            </p>
          </div>
        </div>

        <LogoutButton />
      </header>

      <section className="mt-8 max-w-lg rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <IconBadge className="mb-4 bg-sky-50 text-sky-700">
          <Building2 size={21} />
        </IconBadge>

        <h2 className="text-xl font-bold text-slate-900">
          Choose your branch
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Select the branch you want to manage before viewing the queue
          and checking in customers.
        </p>

        {branches.length === 0 ? (
          <div className="mt-5">
            <InlineAlert type="warning">
              No branches are available to select. Ask your organization
              administrator to check your branch setup.
            </InlineAlert>
          </div>
        ) : (
          <div className="mt-5">
            <label
              htmlFor="branch-select"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Branch
            </label>

            <select
              id="branch-select"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
            >
              <option value="">Select a branch…</option>

              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>
    </div>
  </main>
);


}

return ( <main className="min-h-screen bg-warm-bg px-4 py-5 sm:px-6 sm:py-7 lg:px-8"> <div className="mx-auto max-w-[1600px]"> <header className="flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between"> <div className="flex items-start gap-3"> <IconBadge className="bg-sky-600 text-white"> <Monitor size={22} /> </IconBadge>


        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Queue Console
            </h1>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live queue
            </span>
          </div>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            Manage customer arrivals, call tickets, and monitor service
            progress.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Link
          to="/staff/customers"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
        >
          <Users size={16} />
          Customers
        </Link>

        <Link
          to="/staff/support"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
        >
          <Headphones size={16} />
          Support
        </Link>

        <LogoutButton />
      </div>
    </header>

    {error && (
      <div className="mt-5">
        <InlineAlert onDismiss={() => setError(null)}>
          {error}
        </InlineAlert>
      </div>
    )}

    <section className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            Total tickets
          </p>

          <IconBadge className="h-9 w-9 rounded-lg bg-slate-100 text-slate-600">
            <Ticket size={17} />
          </IconBadge>
        </div>

        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {loading ? "—" : totalTickets}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Current queue
        </p>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            Waiting
          </p>

          <IconBadge className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600">
            <Clock3 size={17} />
          </IconBadge>
        </div>

        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {loading ? "—" : waitingCount}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Awaiting their turn
        </p>
      </div>

      <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            Called
          </p>

          <IconBadge className="h-9 w-9 rounded-lg bg-sky-50 text-sky-600">
            <Activity size={17} />
          </IconBadge>
        </div>

        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {loading ? "—" : calledCount}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Ready to be served
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-500 sm:text-sm">
            Serving
          </p>

          <IconBadge className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={17} />
          </IconBadge>
        </div>

        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {loading ? "—" : servingCount}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Currently in service
        </p>
      </div>
    </section>

    <div className="mt-6 grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-5">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <PanelHeading
            icon={Zap}
            title="Call next customer"
            description="Assign the next eligible ticket to a service counter."
          />

          {actionError && (
            <div className="mb-4">
              <InlineAlert onDismiss={() => setActionError(null)}>
                {actionError}
              </InlineAlert>
            </div>
          )}

          {isOrgAdmin ? (
            <div className="mb-4">
              <label
                htmlFor="counter-select"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Select a counter
              </label>

              <select
                id="counter-select"
                value={selectedCounterId}
                onChange={(event) =>
                  setSelectedCounterId(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
              >
                <option value="">Choose a counter…</option>

                {counters.map((counter) => (
                  <option key={counter.id} value={counter.id}>
                    {counter.name}
                  </option>
                ))}
              </select>

              {counters.length === 0 && !loading && (
                <p className="mt-2 text-xs leading-5 text-amber-700">
                  No counters are set up for this branch yet. Add a
                  counter in your branch settings.
                </p>
              )}
            </div>
          ) : (
            <div className="mb-4">
              {myCounter === undefined ? (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                  Loading your counter…
                </div>
              ) : myCounter === null ? (
                <InlineAlert type="warning">
                  <p className="font-semibold">
                    No counter assigned
                  </p>

                  <p className="mt-1 text-xs leading-5">
                    Ask your organization administrator to assign you
                    a counter before calling customers.
                  </p>
                </InlineAlert>
              ) : (
                <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
                  <p className="text-xs font-medium text-sky-700">
                    Your assigned counter
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {myCounter.name}
                  </p>

                  {myCounter.branchName && (
                    <p className="mt-1 text-xs text-slate-500">
                      {myCounter.branchName}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
                    <ShieldCheck size={14} />
                    Counter assigned
                  </div>
                </div>
              )}
            </div>
          )}

          <PrimaryButton
            type="button"
            loading={actionLoading}
            disabled={
              loading ||
              (isOrgAdmin ? !selectedCounterId : !myCounter)
            }
            onClick={handleCallNext}
            className="w-full py-3"
          >
            <Zap size={17} />
            Call next
            <ArrowRight size={16} />
          </PrimaryButton>

          <p className="mt-3 text-center text-xs leading-5 text-slate-400">
            The next eligible customer will be called by the queue
            system.
          </p>
        </section>

        <TodaysBookingsPanel
          branchId={branchId}
          serviceIds={myServiceIds}
          onCheckedIn={() => {}}
        />

        <WalkInPanel
          branchId={branchId}
          services={visibleServices}
          onCheckedIn={() => {}}
        />
      </aside>

      <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-sky-600" />

              <h2 className="text-lg font-bold text-slate-900">
                Live queue board
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Track each customer's progress through the service
              process.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Real-time updates
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 text-center">
            <LoaderCircle
              size={30}
              className="animate-spin text-sky-600"
            />

            <p className="mt-4 text-sm font-semibold text-slate-700">
              Loading queue
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Retrieving the latest tickets for this branch.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {STATUS_ORDER.map((status) => {
              const style = STATUS_STYLES[status];
              const StatusIcon = style.icon;
              const tickets = ticketsByStatus[status];

              return (
                <section
                  key={status}
                  className={`min-w-0 rounded-2xl border bg-slate-50/60 p-3 sm:p-4 ${style.column}`}
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <IconBadge className="h-9 w-9 rounded-lg bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
                        <StatusIcon size={17} />
                      </IconBadge>

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-800">
                          {STATUS_LABELS[status]}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {status === "waiting"
                            ? "Waiting for a call"
                            : status === "called"
                              ? "Called to the counter"
                              : "Service in progress"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg px-2 text-sm font-bold ring-1 ring-inset ${style.badge}`}
                    >
                      {tickets.length}
                    </span>
                  </div>

                  {tickets.length === 0 ? (
                    <EmptyState
                      icon={Ticket}
                      title="No tickets here"
                      description={`Tickets marked "${STATUS_LABELS[status].toLowerCase()}" will appear in this column.`}
                    />
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((ticket) => (
                        <TicketCard
                          key={ticket.id}
                          ticket={ticket}
                          onStartServing={handleStartServing}
                          onComplete={handleComplete}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Queue totals reflect the tickets currently visible to you.
          </p>

          <button
            type="button"
            onClick={() => loadBoardAndCounters(branchId)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 self-start rounded-lg px-2 py-1.5 font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin" : ""}
            />
            Refresh queue
          </button>
        </div>
      </section>
    </div>

    <footer className="mt-8 flex flex-col items-center justify-between gap-2 pb-4 text-xs text-slate-400 sm:flex-row">
      <p>Universal Smart Queue &amp; Booking Management System</p>

      <p>Staff operations console</p>
    </footer>
  </div>
</main>


);
}

export default QueueConsolePage;
