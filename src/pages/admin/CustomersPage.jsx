import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Users,
  UserRound,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Phone,
  Mail,
  CalendarDays,
  ClipboardList,
  Building2,
  CircleAlert,
  UserRoundCheck,
  UserRoundX,
  FilterX,
} from "lucide-react";

import { listMyCustomers } from "../../api/customers";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blacklisted: "bg-red-50 text-red-700 ring-red-200",
};

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status) {
  if (!status) return "Unknown";
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = status?.toLowerCase();

  const style =
    STATUS_STYLES[normalizedStatus] ||
    "bg-stone-100 text-stone-600 ring-stone-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function AccountBadge({ hasAccount }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        hasAccount
          ? "bg-blue-50 text-blue-700 ring-blue-200"
          : "bg-stone-100 text-stone-600 ring-stone-200"
      }`}
    >
      {hasAccount ? (
        <UserCheck size={13} />
      ) : (
        <UserRound size={13} />
      )}

      {hasAccount ? "Registered" : "Guest"}
    </span>
  );
}

function SummaryCard({ label, value, icon: Icon, iconStyle, description }) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-500">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs leading-5 text-stone-400">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconStyle}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function CustomerSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-stone-100" />

        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 rounded bg-stone-100" />
          <div className="h-3 w-2/3 rounded bg-stone-100" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="h-3 rounded bg-stone-100" />
        <div className="h-3 w-4/5 rounded bg-stone-100" />
      </div>
    </div>
  );
}

function CustomerCard({ customer }) {
  return (
    <article className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <UserRound size={23} />
          </div>

          <div className="min-w-0">
            <h3 className="break-words font-bold text-stone-900">
              {customer.name || "Unnamed customer"}
            </h3>

            <p className="mt-1 text-xs text-stone-400">
              Customer #{customer.customerId}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold tracking-tight text-stone-900">
            {customer.totalBookings ?? 0}
          </p>

          <p className="text-xs text-stone-400">
            {(customer.totalBookings ?? 0) === 1 ? "booking" : "bookings"}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-start gap-3 text-sm">
          <Phone size={16} className="mt-0.5 shrink-0 text-stone-400" />

          {customer.phone ? (
            <a
              href={`tel:${customer.phone}`}
              className="break-words text-stone-600 transition hover:text-emerald-700"
            >
              {customer.phone}
            </a>
          ) : (
            <span className="text-stone-400">No phone number</span>
          )}
        </div>

        <div className="flex items-start gap-3 text-sm">
          <Mail size={16} className="mt-0.5 shrink-0 text-stone-400" />

          {customer.email ? (
            <a
              href={`mailto:${customer.email}`}
              className="break-all text-stone-600 transition hover:text-emerald-700"
            >
              {customer.email}
            </a>
          ) : (
            <span className="text-stone-400">No email address</span>
          )}
        </div>

        <div className="flex items-start gap-3 text-sm">
          <CalendarDays
            size={16}
            className="mt-0.5 shrink-0 text-stone-400"
          />

          <span className="text-stone-600">
            Last interaction: {formatDate(customer.lastInteractionAt)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
        <StatusBadge status={customer.relationshipStatus} />
        <AccountBadge hasAccount={customer.hasAccount} />
      </div>
    </article>
  );
}

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadCustomers = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await listMyCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.error || "Couldn't load customers."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const summary = useMemo(() => {
    return {
      total: customers.length,
      registered: customers.filter((customer) => customer.hasAccount).length,
      guests: customers.filter((customer) => !customer.hasAccount).length,
      blacklisted: customers.filter(
        (customer) =>
          customer.relationshipStatus?.toLowerCase() === "blacklisted"
      ).length,
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        [
          customer.name,
          customer.phone,
          customer.email,
          String(customer.customerId ?? ""),
        ].some((value) => String(value || "").toLowerCase().includes(query));

      const matchesAccount =
        accountFilter === "all" ||
        (accountFilter === "registered" && customer.hasAccount) ||
        (accountFilter === "guest" && !customer.hasAccount);

      const matchesStatus =
        statusFilter === "all" ||
        customer.relationshipStatus?.toLowerCase() === statusFilter;

      return matchesSearch && matchesAccount && matchesStatus;
    });
  }, [customers, search, accountFilter, statusFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    accountFilter !== "all" ||
    statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setAccountFilter("all");
    setStatusFilter("all");
  }

  return (
    <main className="min-h-screen bg-stone-50/70 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <Users size={16} />
              <span>Customer relationship management</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Customers
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base">
              Understand your customer base, find contact information, and
              review booking activity across your business.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadCustomers(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-100 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh customers
          </button>
        </section>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <CircleAlert
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Couldn't load customers
                </p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadCustomers()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Summary cards */}
        {!loading && !error && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total customers"
              value={summary.total}
              icon={Users}
              iconStyle="bg-emerald-50 text-emerald-700"
              description="Customers shown by your business"
            />

            <SummaryCard
              label="Registered accounts"
              value={summary.registered}
              icon={UserCheck}
              iconStyle="bg-blue-50 text-blue-700"
              description="Customers with an account"
            />

            <SummaryCard
              label="Guest customers"
              value={summary.guests}
              icon={UserRoundX}
              iconStyle="bg-amber-50 text-amber-700"
              description="Customers without an account"
            />

            <SummaryCard
              label="Blacklisted"
              value={summary.blacklisted}
              icon={UserX}
              iconStyle="bg-red-50 text-red-700"
              description="Customers marked as blacklisted"
            />
          </section>
        )}

        {/* Filters */}
        <section className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold text-stone-900">Customer directory</h2>
            <p className="text-sm text-stone-500">
              Search customers and narrow the list using filters.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_1fr_1fr_auto]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, phone, email, or ID..."
                aria-label="Search customers"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
              />
            </div>

            <select
              value={accountFilter}
              onChange={(event) => setAccountFilter(event.target.value)}
              aria-label="Filter by account type"
              className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            >
              <option value="all">All account types</option>
              <option value="registered">Registered accounts</option>
              <option value="guest">Guest customers</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by customer status"
              className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-700 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="blacklisted">Blacklisted</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FilterX size={16} />
              Clear
            </button>
          </div>
        </section>

        {/* Results heading */}
        {!loading && !error && customers.length > 0 && (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Customer records
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Showing {filteredCustomers.length} of {customers.length}{" "}
                {customers.length === 1 ? "customer" : "customers"}.
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <CustomerSkeleton key={item} />
            ))}
          </div>
        )}

        {/* No customers */}
        {!loading && customers.length === 0 && !error && (
          <section className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Users size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-stone-900">
              No customers yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              Customers who book appointments or join your queue will appear
              here when your business has customer activity.
            </p>
          </section>
        )}

        {/* No matching results */}
        {!loading &&
          customers.length > 0 &&
          filteredCustomers.length === 0 && (
            <section className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
                <Search size={25} />
              </div>

              <h3 className="mt-4 font-bold text-stone-900">
                No matching customers
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                Try a different search term or change your filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <FilterX size={16} />
                Clear filters
              </button>
            </section>
          )}

        {/* Mobile and tablet customer cards */}
        {!loading && filteredCustomers.length > 0 && (
          <section className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:hidden">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.customerId}
                customer={customer}
              />
            ))}
          </section>
        )}

        {/* Large-screen table */}
        {!loading && filteredCustomers.length > 0 && (
          <section className="hidden overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm 2xl:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/80 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Contact</th>
                    <th className="px-5 py-4 font-semibold">Account</th>
                    <th className="px-5 py-4 font-semibold">Relationship</th>
                    <th className="px-5 py-4 font-semibold">Bookings</th>
                    <th className="px-5 py-4 font-semibold">Last interaction</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.customerId}
                      className="transition hover:bg-emerald-50/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <UserRound size={19} />
                          </div>

                          <div>
                            <p className="font-semibold text-stone-900">
                              {customer.name || "Unnamed customer"}
                            </p>
                            <p className="mt-1 text-xs text-stone-400">
                              ID: {customer.customerId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          {customer.phone ? (
                            <a
                              href={`tel:${customer.phone}`}
                              className="flex items-center gap-2 text-stone-600 hover:text-emerald-700"
                            >
                              <Phone size={14} />
                              {customer.phone}
                            </a>
                          ) : (
                            <span className="text-stone-400">
                              No phone number
                            </span>
                          )}

                          {customer.email && (
                            <a
                              href={`mailto:${customer.email}`}
                              className="flex items-center gap-2 break-all text-xs text-stone-500 hover:text-emerald-700"
                            >
                              <Mail size={13} />
                              {customer.email}
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <AccountBadge hasAccount={customer.hasAccount} />
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={customer.relationshipStatus} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 font-semibold text-stone-700">
                          <ClipboardList
                            size={16}
                            className="text-stone-400"
                          />
                          {customer.totalBookings ?? 0}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-stone-500">
                        {formatDate(customer.lastInteractionAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!loading && !error && filteredCustomers.length > 0 && (
          <div className="flex items-center justify-between border-t border-stone-200 pt-4 text-xs text-stone-400">
            <span>
              {filteredCustomers.length}{" "}
              {filteredCustomers.length === 1 ? "customer" : "customers"} shown
            </span>

            <span className="inline-flex items-center gap-1.5">
              <UserRoundCheck size={14} />
              Customer directory
            </span>
          </div>
        )}
      </div>
    </main>
  );
}

export default CustomersPage;

