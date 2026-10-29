import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
ArrowLeft,
Users,
Search,
Phone,
UserRound,
UserCheck,
CalendarCheck,
Clock3,
LoaderCircle,
RefreshCw,
CircleAlert,
UserRoundSearch,
CheckCircle2,
X,
} from "lucide-react";

import LogoutButton from "../../components/LogoutButton";
import { listMyCustomers } from "../../api/customers";

const STATUS_STYLES = {
active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
blacklisted: "bg-red-50 text-red-700 ring-red-200",
};

function formatDate(date) {
if (!date) return "—";

const parsed = new Date(date);

if (Number.isNaN(parsed.getTime())) return "—";

return parsed.toLocaleDateString(undefined, {
day: "numeric",
month: "short",
year: "numeric",
});
}

function SummaryCard({ icon: Icon, label, value, description, iconClass }) {
return ( <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"> <div className="flex items-center justify-between gap-3"> <p className="text-sm font-medium text-slate-500">{label}</p>


    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
    >
      <Icon size={20} />
    </span>
  </div>

  <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
    {value}
  </p>

  <p className="mt-1 text-xs text-slate-400">{description}</p>
</div>


);
}

function StatusBadge({ status }) {
const normalizedStatus = status?.toLowerCase();

const label = status
? status.charAt(0).toUpperCase() + status.slice(1)
: "Unknown";

return (
<span
className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${
        STATUS_STYLES[normalizedStatus] ||
        "bg-slate-50 text-slate-600 ring-slate-200"
      }`}
>
<span
className={`h-1.5 w-1.5 rounded-full ${
          normalizedStatus === "active"
            ? "bg-emerald-500"
            : normalizedStatus === "blacklisted"
              ? "bg-red-500"
              : "bg-slate-400"
        }`}
/>


  {label}
</span>


);
}

function AccountBadge({ hasAccount }) {
return (
<span
className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        hasAccount
          ? "bg-sky-50 text-sky-700 ring-sky-200"
          : "bg-slate-50 text-slate-600 ring-slate-200"
      }`}
>
{hasAccount ? ( <UserCheck size={13} />
) : ( <UserRound size={13} />
)}


  {hasAccount ? "Registered" : "Guest"}
</span>


);
}

function EmptyState({ searching }) {
return ( <div className="flex flex-col items-center justify-center px-5 py-16 text-center"> <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"> <UserRoundSearch size={30} /> </span>


  <h3 className="mt-5 text-base font-semibold text-slate-800">
    {searching ? "No matching customers" : "No customers yet"}
  </h3>

  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
    {searching
      ? "Try a different name or phone number to find the customer you're looking for."
      : "Customers associated with your organization will appear here when available."}
  </p>
</div>


);
}

function StaffCustomersPage() {
const [customers, setCustomers] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [search, setSearch] = useState("");
const [refreshing, setRefreshing] = useState(false);

async function loadCustomers(isRefresh = false) {
setError(null);


if (isRefresh) {
  setRefreshing(true);
} else {
  setLoading(true);
}

try {
  const data = await listMyCustomers();
  setCustomers(Array.isArray(data) ? data : []);
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Couldn't load customers. Please try again."
  );
} finally {
  setLoading(false);
  setRefreshing(false);
}


}

useEffect(() => {
loadCustomers();
}, []);

const filtered = useMemo(() => {
const term = search.trim().toLowerCase();
const normalizedPhone = term.replace(/\s/g, "");


if (!term) return customers;

return customers.filter((customer) => {
  const name = customer.name?.toLowerCase() || "";
  const phone = customer.phone?.replace(/\s/g, "") || "";

  return (
    name.includes(term) ||
    phone.includes(normalizedPhone)
  );
});


}, [customers, search]);

const registeredCount = customers.filter(
(customer) => customer.hasAccount
).length;

const guestCount = customers.length - registeredCount;

const totalBookings = customers.reduce(
(total, customer) =>
total + (Number(customer.totalBookings) || 0),
0
);

return ( <main className="min-h-screen bg-warm-bg px-4 py-5 sm:px-6 sm:py-7 lg:px-8"> <div className="mx-auto max-w-7xl">
{/* Page header */} <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 md:flex-row md:items-center md:justify-between"> <div className="flex items-start gap-3"> <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-600/20"> <Users size={23} /> </span>


        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Customer Directory
            </h1>

            {!loading && (
              <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
                {customers.length}{" "}
                {customers.length === 1 ? "customer" : "customers"}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm leading-5 text-slate-500">
            View and search customers associated with your organization.
          </p>

          <Link
            to="/staff/queue"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-sky-700 transition hover:text-sky-800"
          >
            <ArrowLeft size={15} />
            Back to Queue Console
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => loadCustomers(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />

          Refresh
        </button>

        <LogoutButton />
      </div>
    </header>

    {/* Error state */}
    {error && (
      <div
        role="alert"
        className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        <CircleAlert size={19} className="mt-0.5 shrink-0" />

        <div className="min-w-0 flex-1">
          <p className="font-semibold">Unable to load customers</p>
          <p className="mt-1 leading-5">{error}</p>
        </div>

        <button
          type="button"
          onClick={() => setError(null)}
          aria-label="Dismiss error"
          className="rounded-md p-1 transition hover:bg-red-100"
        >
          <X size={16} />
        </button>
      </div>
    )}

    {/* Summary cards */}
    <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        icon={Users}
        label="Total customers"
        value={loading ? "—" : customers.length}
        description="Customers in your directory"
        iconClass="bg-sky-50 text-sky-700"
      />

      <SummaryCard
        icon={UserCheck}
        label="Registered accounts"
        value={loading ? "—" : registeredCount}
        description="Customers with an account"
        iconClass="bg-emerald-50 text-emerald-700"
      />

      <SummaryCard
        icon={UserRound}
        label="Guest customers"
        value={loading ? "—" : guestCount}
        description="Customers without an account"
        iconClass="bg-violet-50 text-violet-700"
      />

      <SummaryCard
        icon={CalendarCheck}
        label="Total bookings"
        value={loading ? "—" : totalBookings}
        description="Bookings recorded for these customers"
        iconClass="bg-amber-50 text-amber-700"
      />
    </section>

    {/* Customer directory */}
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            All customers
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Search customer names and phone numbers.
          </p>
        </div>

        <div className="relative w-full lg:max-w-sm">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            aria-label="Search customers by name or phone number"
            placeholder="Search by name or phone…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-4 text-center">
          <LoaderCircle
            size={30}
            className="animate-spin text-sky-600"
          />

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Loading customer directory
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Please wait while we retrieve your customers.
          </p>
        </div>
      ) : error ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-slate-500">
            Customer records could not be displayed.
          </p>

          <button
            type="button"
            onClick={() => loadCustomers()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
          >
            <RefreshCw size={15} />
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState searching={Boolean(search.trim())} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">
                    Customer
                  </th>

                  <th scope="col" className="px-5 py-4 font-semibold">
                    Phone number
                  </th>

                  <th scope="col" className="px-5 py-4 font-semibold">
                    Account
                  </th>

                  <th scope="col" className="px-5 py-4 font-semibold">
                    Bookings
                  </th>

                  <th scope="col" className="px-5 py-4 font-semibold">
                    Last interaction
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((customer) => (
                  <tr
                    key={customer.customerId}
                    className="transition hover:bg-sky-50/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sm font-bold text-sky-700">
                          {customer.name?.trim()
                            ? customer.name.trim()[0].toUpperCase()
                            : "?"}
                        </span>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {customer.name || "Unnamed customer"}
                          </p>

                          <div className="mt-1">
                            <StatusBadge
                              status={customer.relationshipStatus}
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 break-all font-medium text-slate-700">
                        <Phone
                          size={14}
                          className="shrink-0 text-slate-400"
                        />

                        {customer.phone || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <AccountBadge hasAccount={customer.hasAccount} />
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex min-w-9 items-center justify-center rounded-lg bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-700">
                        {Number(customer.totalBookings) || 0}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 whitespace-nowrap text-slate-500">
                        <Clock3
                          size={14}
                          className="shrink-0 text-slate-400"
                        />

                        {formatDate(customer.lastInteractionAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile customer cards */}
          <div className="grid gap-3 p-4 md:hidden">
            {filtered.map((customer) => (
              <article
                key={customer.customerId}
                className="rounded-xl border border-slate-200 p-4 transition hover:border-sky-200"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-base font-bold text-sky-700">
                    {customer.name?.trim()
                      ? customer.name.trim()[0].toUpperCase()
                      : "?"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-semibold text-slate-900">
                      {customer.name || "Unnamed customer"}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge
                        status={customer.relationshipStatus}
                      />

                      <AccountBadge hasAccount={customer.hasAccount} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="inline-flex shrink-0 items-center gap-2 text-slate-500">
                      <Phone size={15} />
                      Phone
                    </span>

                    <span className="break-all text-right font-medium text-slate-700">
                      {customer.phone || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="inline-flex items-center gap-2 text-slate-500">
                      <CalendarCheck size={15} />
                      Bookings
                    </span>

                    <span className="font-semibold text-slate-800">
                      {Number(customer.totalBookings) || 0}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="inline-flex shrink-0 items-center gap-2 text-slate-500">
                      <Clock3 size={15} />
                      Last interaction
                    </span>

                    <span className="text-right text-slate-600">
                      {formatDate(customer.lastInteractionAt)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Results footer */}
          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {customers.length}
              </span>{" "}
              customers
            </p>

            {search.trim() && (
              <p>
                Filtered by:{" "}
                <span className="font-medium text-slate-700">
                  {search.trim()}
                </span>
              </p>
            )}
          </div>
        </>
      )}
    </section>

    <footer className="mt-8 flex flex-col items-center justify-between gap-2 pb-4 text-xs text-slate-400 sm:flex-row">
      <p>Universal Smart Queue &amp; Booking Management System</p>
      <p>Staff customer directory</p>
    </footer>
  </div>
</main>


);
}

export default StaffCustomersPage;
