import { useEffect, useState, useCallback } from "react";
import {
  GitBranch,
  Plus,
  RefreshCw,
  MapPin,
  Phone,
  Clock3,
  Pencil,
  Power,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Save,
} from "lucide-react";

import {
  listBranches,
  createBranch,
  updateBranch,
} from "../../api/branches";

import Modal from "../../components/Modal";
import BranchCounters from "../../components/BranchCounters";

const inputClassName =
  "mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.error || fallback;
}

function BranchForm({ initialValues, onSubmit, submitLabel }) {
  const [name, setName] = useState(initialValues?.name || "");
  const [address, setAddress] = useState(initialValues?.address || "");
  const [phone, setPhone] = useState(initialValues?.phone || "");
  const [timezone, setTimezone] = useState(
    initialValues?.timezone || "Africa/Accra"
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a branch name.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        name: trimmedName,
        address: address.trim(),
        phone: phone.trim(),
        timezone: timezone.trim() || "Africa/Accra",
      });
    } catch (err) {
      setError(
        getErrorMessage(err, "Something went wrong. Please try again.")
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
            <GitBranch size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-stone-800">
              Branch information
            </h3>
            <p className="mt-1 text-sm leading-5 text-stone-600">
              Add the location details your team and customers will use.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="branch-name"
          className="text-sm font-semibold text-stone-700"
        >
          Branch name <span className="text-red-500">*</span>
        </label>

        <input
          id="branch-name"
          type="text"
          required
          autoFocus
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Accra Central Branch"
          className={inputClassName}
        />
      </div>

      <div>
        <label
          htmlFor="branch-address"
          className="text-sm font-semibold text-stone-700"
        >
          Branch address
        </label>

        <div className="relative">
          <MapPin
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <input
            id="branch-address"
            type="text"
            maxLength={250}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Street, area, city"
            className={`${inputClassName} pl-11`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="branch-phone"
          className="text-sm font-semibold text-stone-700"
        >
          Contact phone
        </label>

        <div className="relative">
          <Phone
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <input
            id="branch-phone"
            type="tel"
            maxLength={30}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="e.g. 024 000 0000"
            className={`${inputClassName} pl-11`}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="branch-timezone"
          className="text-sm font-semibold text-stone-700"
        >
          Timezone
        </label>

        <div className="relative">
          <Clock3
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <input
            id="branch-timezone"
            type="text"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            placeholder="Africa/Accra"
            className={`${inputClassName} pl-11`}
          />
        </div>

        <p className="mt-2 text-xs leading-5 text-stone-500">
          Use an IANA timezone identifier, such as Africa/Accra.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={submitting}
          onClick={() => {
            // The parent modal owns closing behavior.
            // The form does not close itself.
          }}
          className="hidden"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting ? (
            <RefreshCw size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}

          {submitting ? "Saving branch..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-stone-100 text-stone-600 ring-1 ring-inset ring-stone-200"
      }`}
    >
      {isActive ? (
        <CheckCircle2 size={13} />
      ) : (
        <XCircle size={13} />
      )}

      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function BranchStats({ branches }) {
  const activeCount = branches.filter(
    (branch) => branch.status === "active"
  ).length;

  const inactiveCount = branches.length - activeCount;

  const stats = [
    {
      label: "Total branches",
      value: branches.length,
      icon: Building2,
      iconStyle: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Active branches",
      value: activeCount,
      icon: CheckCircle2,
      iconStyle: "bg-green-50 text-green-700",
    },
    {
      label: "Inactive branches",
      value: inactiveCount,
      icon: XCircle,
      iconStyle: "bg-stone-100 text-stone-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-stone-500">
                  {stat.label}
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconStyle}`}
              >
                <Icon size={22} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BranchCard({
  branch,
  onEdit,
  onToggleStatus,
  updatingStatus,
}) {
  const isActive = branch.status === "active";

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Building2 size={23} />
            </div>

            <div className="min-w-0">
              <h3 className="break-words text-base font-bold text-stone-900">
                {branch.name}
              </h3>

              <p className="mt-1 text-xs text-stone-400">
                Branch ID: {branch.id}
              </p>
            </div>
          </div>

          <StatusBadge status={branch.status} />
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <MapPin size={17} className="mt-0.5 shrink-0 text-stone-400" />

            <span className="break-words text-stone-600">
              {branch.address || "No address added"}
            </span>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <Phone size={17} className="mt-0.5 shrink-0 text-stone-400" />

            <span className="break-words text-stone-600">
              {branch.phone || "No phone number added"}
            </span>
          </div>

          <div className="flex items-start gap-3 text-sm">
            <Clock3 size={17} className="mt-0.5 shrink-0 text-stone-400" />

            <span className="break-words text-stone-600">
              {branch.timezone || "Africa/Accra"}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
          <button
            type="button"
            onClick={() => onEdit(branch)}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/10"
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            type="button"
            disabled={updatingStatus}
            onClick={() => onToggleStatus(branch)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? "bg-amber-50 text-amber-800 hover:bg-amber-100 focus:ring-amber-500/10"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 focus:ring-emerald-600/10"
            }`}
          >
            {updatingStatus ? (
              <RefreshCw size={15} className="animate-spin" />
            ) : (
              <Power size={15} />
            )}

            {updatingStatus
              ? "Updating..."
              : isActive
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      </div>

      <div className="border-t border-stone-100 bg-stone-50/60 p-4 sm:p-5">
        <BranchCounters branchId={branch.id} branchName={branch.name} />
      </div>
    </article>
  );
}

function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [updatingBranchId, setUpdatingBranchId] = useState(null);

  const loadBranches = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await listBranches();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load branches."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  async function handleCreate(values) {
    await createBranch(values);
    setShowAddModal(false);
    await loadBranches(true);
  }

  async function handleEditSubmit(values) {
    await updateBranch(editingBranch.id, values);
    setEditingBranch(null);
    await loadBranches(true);
  }

  async function toggleStatus(branch) {
    const newStatus =
      branch.status === "active" ? "inactive" : "active";

    setError(null);
    setUpdatingBranchId(branch.id);

    try {
      await updateBranch(branch.id, {
        status: newStatus,
      });

      await loadBranches(true);
    } catch (err) {
      setError(
        getErrorMessage(err, "Couldn't update this branch.")
      );
    } finally {
      setUpdatingBranchId(null);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50/70 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page heading */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <GitBranch size={16} />
              <span>Organization management</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Branches
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base">
              Manage your business locations, contact information, and queue
              counters from one place.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => loadBranches(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-100 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20"
            >
              <Plus size={18} />
              Add branch
            </button>
          </div>
        </section>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Something needs your attention
                </p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadBranches()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Summary cards */}
        {!loading && branches.length > 0 && (
          <BranchStats branches={branches} />
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-stone-200 bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-stone-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-stone-100" />
                    <div className="h-3 w-1/3 rounded bg-stone-100" />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="h-4 rounded bg-stone-100" />
                  <div className="h-4 w-4/5 rounded bg-stone-100" />
                  <div className="h-4 w-3/5 rounded bg-stone-100" />
                </div>

                <div className="mt-6 h-10 rounded-xl bg-stone-100" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && branches.length === 0 && !error && (
          <section className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Building2 size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-stone-900">
              No branches yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              Add your first business location to start organizing your queue
              counters and managing operations across branches.
            </p>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20"
            >
              <Plus size={18} />
              Create your first branch
            </button>
          </section>
        )}

        {/* Branch cards */}
        {!loading && branches.length > 0 && (
          <section>
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Your locations
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Manage branch details, availability, and queue counters.
                </p>
              </div>

              <p className="text-sm text-stone-500">
                {branches.length}{" "}
                {branches.length === 1 ? "branch" : "branches"}
              </p>
            </div>

            <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
              {branches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  onEdit={setEditingBranch}
                  onToggleStatus={toggleStatus}
                  updatingStatus={updatingBranchId === branch.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Add branch modal */}
        {showAddModal && (
          <Modal
            title="Add branch"
            onClose={() => setShowAddModal(false)}
          >
            <BranchForm
              onSubmit={handleCreate}
              submitLabel="Create branch"
            />
          </Modal>
        )}

        {/* Edit branch modal */}
        {editingBranch && (
          <Modal
            title="Edit branch"
            onClose={() => setEditingBranch(null)}
          >
            <BranchForm
              key={editingBranch.id}
              initialValues={editingBranch}
              onSubmit={handleEditSubmit}
              submitLabel="Save changes"
            />
          </Modal>
        )}
      </div>
    </main>
  );
}

export default BranchesPage;

