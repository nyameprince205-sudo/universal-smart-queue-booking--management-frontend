import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
CalendarDays,
Clock3,
Users,
Plus,
Search,
RefreshCw,
AlertCircle,
CheckCircle2,
UserRound,
Building2,
ClipboardList,
Phone,
X,
ChevronDown,
CalendarCheck,
FileText,
} from "lucide-react";

import { listBookings, createBooking } from "../../api/adminBookings";
import {
lookupCustomerByPhone,
quickRegisterCustomer,
} from "../../api/customers";
import { listBranches } from "../../api/branches";
import { listServices } from "../../api/services";
import Modal from "../../components/Modal";
import { formatBookingTime } from "../../utils/formatBookingTime";

const STATUS_STYLES = {
pending: "bg-amber-50 text-amber-800 ring-amber-200",
confirmed: "bg-sky-50 text-sky-800 ring-sky-200",
checked_in: "bg-indigo-50 text-indigo-800 ring-indigo-200",
completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
no_show: "bg-red-50 text-red-800 ring-red-200",
waitlisted: "bg-purple-50 text-purple-800 ring-purple-200",
};

const STATUS_LABELS = {
pending: "Pending",
confirmed: "Confirmed",
checked_in: "Checked In",
completed: "Completed",
cancelled: "Cancelled",
no_show: "No Show",
waitlisted: "Waitlisted",
};

const INPUT_CLASS =
"w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:bg-slate-50";

const LABEL_CLASS =
"mb-1.5 block text-sm font-semibold text-slate-700";

function getErrorMessage(err, fallback) {
return err.response?.data?.error || fallback;
}

function getStatusStyle(status) {
return (
STATUS_STYLES[status] ||
"bg-slate-100 text-slate-600 ring-slate-200"
);
}

function formatBookingDate(date) {
if (!date) return "Date unavailable";

const parsed = new Date(date);

if (Number.isNaN(parsed.getTime())) {
return "Date unavailable";
}

return parsed.toLocaleDateString("en-GH", {
day: "numeric",
month: "short",
year: "numeric",
});
}

function formatStatus(status) {
return (
STATUS_LABELS[status] ||
String(status || "Unknown").replaceAll("_", " ")
);
}

function getInitials(name) {
if (!name) return "CU";

return name
.trim()
.split(/\s+/)
.slice(0, 2)
.map((part) => part.charAt(0).toUpperCase())
.join("");
}

function StatusBadge({ status }) {
return (
<span
className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(
        status
      )}`}
> <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
{formatStatus(status)} </span>
);
}

function FormField({ label, htmlFor, children, hint }) {
return ( <div className="min-w-0"> <label htmlFor={htmlFor} className={LABEL_CLASS}>
{label} </label>
{children}
{hint && ( <p className="mt-1.5 text-xs leading-5 text-slate-500">{hint}</p>
)} </div>
);
}

function FormError({ children }) {
if (!children) return null;

return ( <div
   role="alert"
   className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
 > <AlertCircle
     className="mt-0.5 h-4 w-4 shrink-0"
     aria-hidden="true"
   /> <p>{children}</p> </div>
);
}

function CreateBookingForm({ branches, services, onSubmit }) {
const [phone, setPhone] = useState("");
const [foundCustomer, setFoundCustomer] = useState(null);
const [notFound, setNotFound] = useState(false);
const [name, setName] = useState("");
const [branchId, setBranchId] = useState("");
const [serviceId, setServiceId] = useState("");
const [bookingDate, setBookingDate] = useState("");
const [bookingTime, setBookingTime] = useState("");
const [partySize, setPartySize] = useState("1");
const [notes, setNotes] = useState("");
const [error, setError] = useState(null);
const [submitting, setSubmitting] = useState(false);
const [lookingUp, setLookingUp] = useState(false);

const availableServices = services.filter(
(service) => !service.branchId || service.branchId === branchId
);

const hasCustomer = Boolean(foundCustomer || notFound);

const ready = Boolean(
(foundCustomer || (notFound && name.trim())) &&
branchId &&
serviceId &&
bookingDate &&
bookingTime &&
Number(partySize) >= 1
);

async function handleLookup(e) {
e.preventDefault();


if (!phone.trim()) {
  setError("Enter the customer's phone number.");
  return;
}

setError(null);
setFoundCustomer(null);
setNotFound(false);
setLookingUp(true);

try {
  const customer = await lookupCustomerByPhone(phone.trim());
  setFoundCustomer(customer);
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

async function handleSubmit(e) {
e.preventDefault();


if (!ready || submitting) return;

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

  await onSubmit({
    customerId: customer.id,
    branchId,
    serviceId,
    bookingDate,
    bookingTime,
    partySize: Number(partySize),
    notes: notes.trim() || undefined,
  });
} catch (err) {
  setError(
    getErrorMessage(err, "Couldn't create this booking.")
  );
} finally {
  setSubmitting(false);
}


}

function resetCustomerLookup() {
setFoundCustomer(null);
setNotFound(false);
setName("");
setError(null);
}

return (
<form
onSubmit={hasCustomer ? handleSubmit : handleLookup}
className="space-y-6"
> <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"> <div className="flex items-start gap-3"> <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm"> <UserRound className="h-5 w-5" aria-hidden="true" /> </div>

```
      <div>
        <h3 className="text-sm font-bold text-slate-900">
          Customer information
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Search by phone number to find an existing customer or register
          a new one.
        </p>
      </div>
    </div>
  </div>

  <FormError>{error}</FormError>

  <div>
    <FormField
      label="Customer phone number"
      htmlFor="booking-customer-phone"
      hint="Use the phone number the customer can be reached on."
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Phone
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="booking-customer-phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="e.g. 024 123 4567"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              resetCustomerLookup();
            }}
            className={`${INPUT_CLASS} pl-10`}
          />
        </div>

        {!hasCustomer && (
          <button
            type="submit"
            disabled={lookingUp || !phone.trim()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {lookingUp ? (
              <RefreshCw
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Search className="h-4 w-4" aria-hidden="true" />
            )}
            {lookingUp ? "Searching..." : "Look up"}
          </button>
        )}
      </div>
    </FormField>
  </div>

  {foundCustomer && (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
        {getInitials(foundCustomer.name)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          Existing customer found
        </div>
        <p className="mt-1 truncate text-sm font-bold text-slate-900">
          {foundCustomer.name}
        </p>
        <p className="mt-0.5 text-xs text-slate-600">
          {foundCustomer.phone || phone}
        </p>
      </div>

      <button
        type="button"
        onClick={resetCustomerLookup}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-800"
        aria-label="Change customer"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )}

  {notFound && (
    <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700">
          <UserRound className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-950">
            New customer
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-800">
            No customer was found with this number. Enter their name to
            register them.
          </p>
        </div>
      </div>

      <FormField label="Customer name" htmlFor="booking-customer-name">
        <input
          id="booking-customer-name"
          type="text"
          required
          autoComplete="name"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={INPUT_CLASS}
        />
      </FormField>
    </div>
  )}

  {hasCustomer && (
    <>
      <div className="border-t border-slate-100 pt-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Booking details
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Select where and when the customer should be served.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <FormField label="Branch" htmlFor="booking-branch">
            <div className="relative">
              <Building2
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <select
                id="booking-branch"
                required
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setServiceId("");
                }}
                className={`${INPUT_CLASS} appearance-none pl-10 pr-10`}
              >
                <option value="">Select a branch...</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
          </FormField>

          <FormField label="Service" htmlFor="booking-service">
            <div className="relative">
              <ClipboardList
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <select
                id="booking-service"
                required
                disabled={!branchId}
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className={`${INPUT_CLASS} appearance-none pl-10 pr-10`}
              >
                <option value="">
                  {branchId
                    ? availableServices.length
                      ? "Select a service..."
                      : "No services available for this branch"
                    : "Select a branch first"}
                </option>
                {availableServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Booking date" htmlFor="booking-date">
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="booking-date"
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className={`${INPUT_CLASS} pl-10`}
                />
              </div>
            </FormField>

            <FormField label="Booking time" htmlFor="booking-time">
              <div className="relative">
                <Clock3
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="booking-time"
                  type="time"
                  required
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className={`${INPUT_CLASS} pl-10`}
                />
              </div>
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Number of people"
              htmlFor="booking-party-size"
              hint="Enter at least one person."
            >
              <div className="relative">
                <Users
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="booking-party-size"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                  className={`${INPUT_CLASS} pl-10`}
                />
              </div>
            </FormField>

            <FormField
              label="Notes (optional)"
              htmlFor="booking-notes"
              hint="Add any relevant customer requests."
            >
              <div className="relative">
                <FileText
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="booking-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special requests..."
                  className={`${INPUT_CLASS} pl-10`}
                />
              </div>
            </FormField>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-slate-500">
          Review the details before creating the booking.
        </p>

        <button
          type="submit"
          disabled={!ready || submitting}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <RefreshCw
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
              Creating booking...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create booking
            </>
          )}
        </button>
      </div>
    </>
  )}
</form>


);
}

function BookingRow({ booking }) {
return ( <tr className="transition-colors hover:bg-emerald-50/30"> <td className="px-5 py-4"> <div className="flex items-center gap-3"> <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-800">
{getInitials(booking.customer?.name)} </div> <div className="min-w-0"> <p className="truncate font-semibold text-slate-900">
{booking.customer?.name || "Unknown customer"} </p> <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"> <Phone className="h-3 w-3" aria-hidden="true" />
{booking.customer?.phone || "No phone number"} </p> </div> </div> </td>


  <td className="px-5 py-4">
    <p className="font-medium text-slate-800">
      {booking.service?.name || "Service unavailable"}
    </p>
  </td>

  <td className="px-5 py-4">
    <p className="whitespace-nowrap text-sm font-medium text-slate-800">
      {formatBookingDate(booking.bookingDate)}
    </p>
    <p className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-xs text-slate-500">
      <Clock3 className="h-3 w-3" aria-hidden="true" />
      {formatBookingTime(booking.bookingTime)}
    </p>
  </td>

  <td className="px-5 py-4">
    <StatusBadge status={booking.status} />
  </td>
</tr>


);
}

function BookingMobileCard({ booking }) {
return ( <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200"> <div className="flex items-start gap-3"> <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-800">
{getInitials(booking.customer?.name)} </div>


    <div className="min-w-0 flex-1">
      <p className="truncate font-bold text-slate-900">
        {booking.customer?.name || "Unknown customer"}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
        <Phone className="h-3 w-3" aria-hidden="true" />
        {booking.customer?.phone || "No phone number"}
      </p>
    </div>

    <StatusBadge status={booking.status} />
  </div>

  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
    <div className="min-w-0">
      <p className="text-xs text-slate-500">Service</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-800">
        {booking.service?.name || "Service unavailable"}
      </p>
    </div>

    <div>
      <p className="text-xs text-slate-500">Date and time</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">
        {formatBookingDate(booking.bookingDate)}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {formatBookingTime(booking.bookingTime)}
      </p>
    </div>
  </div>
</article>


);
}

function BookingSkeleton() {
return ( <div className="space-y-3">
{[1, 2, 3, 4].map((item) => ( <div
       key={item}
       className="flex animate-pulse items-center gap-4 rounded-xl border border-slate-200 bg-white p-5"
     > <div className="h-10 w-10 rounded-xl bg-slate-100" /> <div className="flex-1 space-y-2"> <div className="h-3 w-1/3 rounded bg-slate-100" /> <div className="h-3 w-1/4 rounded bg-slate-100" /> </div> <div className="h-6 w-20 rounded-full bg-slate-100" /> </div>
))} </div>
);
}

function BookingsPage() {
const [bookings, setBookings] = useState([]);
const [branches, setBranches] = useState([]);
const [services, setServices] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState(null);
const [showAddModal, setShowAddModal] = useState(false);
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");

const loadAll = useCallback(async ({ silent = false } = {}) => {
if (silent) {
setRefreshing(true);
} else {
setLoading(true);
}


setError(null);

try {
  const [bookingsData, branchesData, servicesData] = await Promise.all([
    listBookings(),
    listBranches(),
    listServices(),
  ]);

  setBookings(bookingsData);
  setBranches(branchesData);
  setServices(servicesData);
} catch (err) {
  setError(getErrorMessage(err, "Couldn't load bookings."));
} finally {
  setLoading(false);
  setRefreshing(false);
}


}, []);

useEffect(() => {
loadAll();
}, [loadAll]);

async function handleCreate(payload) {
await createBooking(payload);
setShowAddModal(false);
await loadAll({ silent: true });
}

const filteredBookings = bookings.filter((booking) => {
const query = search.trim().toLowerCase();


const matchesSearch =
  !query ||
  booking.customer?.name?.toLowerCase().includes(query) ||
  booking.customer?.phone?.toLowerCase().includes(query) ||
  booking.service?.name?.toLowerCase().includes(query) ||
  String(booking.id).toLowerCase().includes(query);

const matchesStatus =
  statusFilter === "all" || booking.status === statusFilter;

return matchesSearch && matchesStatus;


});

const statusCounts = bookings.reduce(
(counts, booking) => {
counts.total += 1;
counts[booking.status] = (counts[booking.status] || 0) + 1;
return counts;
},
{ total: 0 }
);

return ( <main className="min-h-full bg-slate-50/70 p-4 sm:p-6 lg:p-8"> <div className="mx-auto max-w-screen-2xl">
{/* Page heading */} <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"> <div> <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700"> <span className="h-2 w-2 rounded-full bg-emerald-600" />
Booking management </div>


        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Bookings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage customer appointments, review booking statuses and create
          reservations for your branches.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => loadAll({ silent: true })}
          disabled={loading || refreshing}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50/50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Refresh
        </button>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create booking
        </button>
      </div>
    </div>

    {/* Summary cards */}
    <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <SummaryCard
        label="All bookings"
        value={statusCounts.total}
        icon={ClipboardList}
        accent="emerald"
      />
      <SummaryCard
        label="Pending"
        value={statusCounts.pending || 0}
        icon={Clock3}
        accent="amber"
      />
      <SummaryCard
        label="Confirmed"
        value={statusCounts.confirmed || 0}
        icon={CalendarCheck}
        accent="sky"
      />
      <SummaryCard
        label="Completed"
        value={statusCounts.completed || 0}
        icon={CheckCircle2}
        accent="green"
      />
    </div>

    {error && (
      <div
        role="alert"
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold text-red-900">
              Unable to load bookings
            </p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadAll()}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
      </div>
    )}

    {/* Search and filtering */}
    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex-1">
          <label
            htmlFor="booking-search"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
          >
            Find a booking
          </label>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="booking-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, phone, service or booking ID..."
              className={`${INPUT_CLASS} pl-10`}
            />
          </div>
        </div>

        <div className="w-full lg:w-56">
          <label
            htmlFor="booking-status-filter"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500"
          >
            Booking status
          </label>

          <div className="relative">
            <select
              id="booking-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${INPUT_CLASS} appearance-none pr-10`}
            >
              <option value="all">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {loading ? "—" : filteredBookings.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {loading ? "—" : bookings.length}
          </span>{" "}
          bookings
        </p>

        {(search || statusFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>
    </section>

    {/* Booking list */}
    <section className="mt-5">
      {loading ? (
        <BookingSkeleton />
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            {bookings.length === 0 ? (
              <CalendarDays className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Search className="h-6 w-6" aria-hidden="true" />
            )}
          </div>

          <h2 className="mt-4 text-base font-bold text-slate-900">
            {bookings.length === 0
              ? "No bookings yet"
              : "No matching bookings"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            {bookings.length === 0
              ? "Create a booking for a customer to start managing appointments from this dashboard."
              : "Try a different search term or status filter to find the booking you're looking for."}
          </p>

          {bookings.length === 0 ? (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-900"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create your first booking
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {filteredBookings.map((booking) => (
              <BookingMobileCard key={booking.id} booking={booking} />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Booking records
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Customer appointments and current statuses
                </p>
              </div>

              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                {filteredBookings.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3.5 font-semibold">
                      Customer
                    </th>
                    <th className="px-5 py-3.5 font-semibold">Service</th>
                    <th className="px-5 py-3.5 font-semibold">
                      Date and time
                    </th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => (
                    <BookingRow key={booking.id} booking={booking} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>

    <div className="mt-6 flex items-start gap-2 border-t border-slate-200 py-5 text-xs leading-5 text-slate-500">
      <CalendarDays
        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
        aria-hidden="true"
      />
      <p>
        Booking records and status counts reflect the data returned by
        your system. Confirmed bookings and completed bookings represent
        different stages of the customer journey.
      </p>
    </div>
  </div>

  {showAddModal && (
    <Modal
      title="Create a booking"
      onClose={() => setShowAddModal(false)}
    >
      <CreateBookingForm
        branches={branches}
        services={services}
        onSubmit={handleCreate}
      />
    </Modal>
  )}
</main>


);
}

function SummaryCard({ label, value, icon: Icon, accent }) {
const accents = {
emerald: {
icon: "bg-emerald-50 text-emerald-700",
border: "border-t-emerald-600",
},
amber: {
icon: "bg-amber-50 text-amber-700",
border: "border-t-amber-500",
},
sky: {
icon: "bg-sky-50 text-sky-700",
border: "border-t-sky-600",
},
green: {
icon: "bg-green-50 text-green-700",
border: "border-t-green-600",
},
};

const style = accents[accent] || accents.emerald;

return (
<div
className={`rounded-2xl border border-slate-200 border-t-4 ${style.border} bg-white p-4 shadow-sm sm:p-5`}
> <div className="flex items-start justify-between gap-2"> <p className="text-xs font-semibold leading-5 text-slate-500 sm:text-sm">
{label} </p>
<div
className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
> <Icon className="h-4 w-4" aria-hidden="true" /> </div> </div>


  <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
    {value}
  </p>
</div>


);
}

export default BookingsPage;
