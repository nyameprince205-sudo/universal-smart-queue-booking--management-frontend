import { useEffect, useState, useCallback, useMemo } from "react";
import {
listStaff,
createStaff,
deactivateStaff,
reactivateStaff,
} from "../../api/staff";
import { listBranches } from "../../api/branches";
import Modal from "../../components/Modal";
import AssignStaffModal from "../../components/AssignStaffModal";

const inputClass =
"w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

function StatusBadge({ active }) {
return (
<span
className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
      }`}
>
<span
className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
/>
{active ? "Active" : "Deactivated"} </span>
);
}

function VerificationBadge({ verified }) {
return (
<span
className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        verified
          ? "bg-blue-50 text-blue-700"
          : "bg-amber-50 text-amber-700"
      }`}
>
{verified ? "Verified" : "Pending"} </span>
);
}

function StatCard({ label, value, description, icon, color }) {
return ( <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"> <div className="flex items-start justify-between gap-3"> <div> <p className="text-sm font-medium text-slate-500">{label}</p> <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
{value} </p> <p className="mt-2 text-xs text-slate-500">{description}</p> </div>


    <div
      className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${color}`}
    >
      {icon}
    </div>
  </div>
</div>


);
}

function CreateStaffForm({ branches, onSubmit }) {
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [branchId, setBranchId] = useState("");
const [error, setError] = useState("");
const [submitting, setSubmitting] = useState(false);

async function handleSubmit(event) {
event.preventDefault();
setError("");


if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
  setError(
    "Password must contain at least 8 characters, including a letter and a number."
  );
  return;
}

setSubmitting(true);

try {
  await onSubmit({
    name: name.trim(),
    email: email.trim(),
    password,
    branchId: branchId || undefined,
  });
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Couldn't create the staff account. Please try again."
  );
  setSubmitting(false);
}


}

return ( <form onSubmit={handleSubmit} className="space-y-5"> <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4"> <p className="text-sm font-semibold text-indigo-900">
Create a staff account </p> <p className="mt-1 text-xs leading-5 text-indigo-700">
Staff members can use their credentials to access the system according
to their assigned permissions. </p> </div>


  {error && (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {error}
    </div>
  )}

  <div>
    <label
      htmlFor="staff-name"
      className="block text-sm font-semibold text-slate-700"
    >
      Full name <span className="text-red-500">*</span>
    </label>
    <input
      id="staff-name"
      type="text"
      required
      maxLength={150}
      autoComplete="name"
      value={name}
      onChange={(event) => setName(event.target.value)}
      placeholder="Enter full name"
      className={`${inputClass} mt-2`}
    />
  </div>

  <div>
    <label
      htmlFor="staff-email"
      className="block text-sm font-semibold text-slate-700"
    >
      Email address <span className="text-red-500">*</span>
    </label>
    <input
      id="staff-email"
      type="email"
      required
      autoComplete="email"
      value={email}
      onChange={(event) => setEmail(event.target.value)}
      placeholder="staff@example.com"
      className={`${inputClass} mt-2`}
    />
  </div>

  <div>
    <label
      htmlFor="staff-password"
      className="block text-sm font-semibold text-slate-700"
    >
      Initial password <span className="text-red-500">*</span>
    </label>
    <input
      id="staff-password"
      type="password"
      required
      minLength={8}
      autoComplete="new-password"
      value={password}
      onChange={(event) => setPassword(event.target.value)}
      placeholder="Create a secure password"
      className={`${inputClass} mt-2`}
    />
    <p className="mt-2 text-xs leading-5 text-slate-500">
      Use at least 8 characters, including a letter and a number.
    </p>
  </div>

  <div>
    <label
      htmlFor="staff-branch"
      className="block text-sm font-semibold text-slate-700"
    >
      Branch assignment
    </label>
    <select
      id="staff-branch"
      value={branchId}
      onChange={(event) => setBranchId(event.target.value)}
      className={`${inputClass} mt-2`}
    >
      <option value="">Not branch-scoped</option>
      {branches.map((branch) => (
        <option key={branch.id} value={branch.id}>
          {branch.name}
        </option>
      ))}
    </select>
    <p className="mt-2 text-xs text-slate-500">
      You can leave this empty if the account should not be assigned to a
      specific branch.
    </p>
  </div>

  <button
    type="submit"
    disabled={submitting}
    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {submitting && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
    )}
    {submitting ? "Creating account..." : "Create Staff Account"}
  </button>
</form>


);
}

function StaffPage() {
const [staff, setStaff] = useState([]);
const [branches, setBranches] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [showAddModal, setShowAddModal] = useState(false);
const [actioningId, setActioningId] = useState(null);
const [assigningStaff, setAssigningStaff] = useState(null);
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [branchFilter, setBranchFilter] = useState("all");

const loadAll = useCallback(async (showLoader = true) => {
if (showLoader) setLoading(true);
setError("");


try {
  const [staffData, branchesData] = await Promise.all([
    listStaff(),
    listBranches(),
  ]);

  setStaff(Array.isArray(staffData) ? staffData : []);
  setBranches(Array.isArray(branchesData) ? branchesData : []);
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Couldn't load staff accounts. Please try again."
  );
} finally {
  if (showLoader) setLoading(false);
}


}, []);

useEffect(() => {
loadAll();
}, [loadAll]);

const stats = useMemo(() => {
const active = staff.filter((member) => member.status === "active");
const inactive = staff.filter((member) => member.status !== "active");
const verified = staff.filter((member) => member.emailVerified);


return {
  total: staff.length,
  active: active.length,
  inactive: inactive.length,
  verified: verified.length,
};


}, [staff]);

const filteredStaff = useMemo(() => {
const query = search.trim().toLowerCase();


return staff.filter((member) => {
  const matchesSearch =
    !query ||
    member.name?.toLowerCase().includes(query) ||
    member.email?.toLowerCase().includes(query) ||
    member.branchName?.toLowerCase().includes(query);

  const matchesStatus =
    statusFilter === "all" ||
    (statusFilter === "active" && member.status === "active") ||
    (statusFilter === "inactive" && member.status !== "active");

  const matchesBranch =
    branchFilter === "all" ||
    (branchFilter === "unassigned" && !member.branchName) ||
    String(member.branchId ?? "") === branchFilter;

  return matchesSearch && matchesStatus && matchesBranch;
});


}, [staff, search, statusFilter, branchFilter]);

async function handleCreate(values) {
await createStaff(values);
setShowAddModal(false);
await loadAll(false);
}

async function handleToggleStatus(member) {
const isActive = member.status === "active";


if (
  isActive &&
  !window.confirm(
    `Deactivate ${member.name}? They won't be able to log in until reactivated.`
  )
) {
  return;
}

setActioningId(member.id);
setError("");

try {
  if (isActive) {
    await deactivateStaff(member.id);
  } else {
    await reactivateStaff(member.id);
  }

  await loadAll(false);
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Couldn't update this staff member. Please try again."
  );
} finally {
  setActioningId(null);
}


}

function renderStaffActions(member) {
const isActive = member.status === "active";
const isWorking = actioningId === member.id;


return (
  <div className="flex flex-wrap items-center gap-3">
    {isActive && (
      <button
        type="button"
        onClick={() => setAssigningStaff(member)}
        className="rounded-lg px-2 py-1.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
      >
        Assign
      </button>
    )}

    <button
      type="button"
      onClick={() => handleToggleStatus(member)}
      disabled={isWorking}
      className={`rounded-lg px-2 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive
          ? "text-red-600 hover:bg-red-50"
          : "text-emerald-700 hover:bg-emerald-50"
      }`}
    >
      {isWorking
        ? "Working..."
        : isActive
          ? "Deactivate"
          : "Reactivate"}
    </button>
  </div>
);


}

return ( <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"> <div className="mx-auto max-w-7xl">
{/* Page header */} <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <div> <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"> <span className="h-2 w-2 rounded-full bg-indigo-500" />
Team Management </div>


        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Staff
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage staff accounts, branch assignments, account status, and
          email verification.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
      >
        <span className="text-lg leading-none">+</span>
        Add Staff
      </button>
    </div>

    {/* Error message */}
    {error && (
      <div
        role="alert"
        className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        <span className="font-bold">!</span>
        <p className="flex-1">{error}</p>
        <button
          type="button"
          onClick={() => loadAll()}
          className="rounded-lg px-3 py-1.5 font-semibold hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    )}

    {/* Summary cards */}
    <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Staff"
        value={stats.total}
        description="All registered staff accounts"
        icon="👥"
        color="bg-indigo-50 text-indigo-600"
      />
      <StatCard
        label="Active Staff"
        value={stats.active}
        description="Accounts currently active"
        icon="✓"
        color="bg-emerald-50 text-emerald-600"
      />
      <StatCard
        label="Deactivated"
        value={stats.inactive}
        description="Accounts currently inactive"
        icon="⊘"
        color="bg-slate-100 text-slate-600"
      />
      <StatCard
        label="Email Verified"
        value={stats.verified}
        description="Accounts with verified emails"
        icon="✉"
        color="bg-blue-50 text-blue-600"
      />
    </div>

    {/* Staff list */}
    <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Staff Directory
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading staff accounts..."
                : `${filteredStaff.length} of ${staff.length} staff account${staff.length === 1 ? "" : "s"}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadAll()}
            disabled={loading}
            className="self-start rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {/* Search and filters */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="relative sm:col-span-2 xl:col-span-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or branch..."
              aria-label="Search staff"
              className={`${inputClass} pl-9`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by staff status"
            className={inputClass}
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Deactivated only</option>
          </select>

          <select
            value={branchFilter}
            onChange={(event) => setBranchFilter(event.target.value)}
            aria-label="Filter by branch"
            className={inputClass}
          >
            <option value="all">All branches</option>
            <option value="unassigned">Not branch-scoped</option>
            {branches.map((branch) => (
              <option key={branch.id} value={String(branch.id)}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 p-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-center gap-4"
            >
              <div className="h-11 w-11 rounded-xl bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 rounded bg-slate-100" />
                <div className="h-3 w-52 max-w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
            👥
          </div>
          <h3 className="mt-5 text-lg font-bold text-slate-900">
            No staff accounts yet
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Create your first staff account to start managing your team.
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            + Add Your First Staff Member
          </button>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <h3 className="text-base font-bold text-slate-900">
            No matching staff
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or filter selections.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setBranchFilter("all");
            }}
            className="mt-4 text-sm font-semibold text-indigo-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 sm:hidden">
            {filteredStaff.map((member) => {
              const isActive = member.status === "active";

              return (
                <article
                  key={member.id}
                  className="p-4 transition hover:bg-slate-50/70"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base font-bold text-indigo-700">
                      {(member.name || "?").charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="break-words font-semibold text-slate-900">
                        {member.name}
                      </p>
                      <p className="mt-1 break-all text-sm text-slate-500">
                        {member.email}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <StatusBadge active={isActive} />
                        <VerificationBadge
                          verified={Boolean(member.emailVerified)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <span aria-hidden="true">⌖</span>
                    <span>{member.branchName || "Not branch-scoped"}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                    {renderStaffActions(member)}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Staff Member</th>
                  <th className="px-6 py-4 font-semibold">Branch</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-700">
                          {(member.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {member.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            ID: {member.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {member.branchName || "Not branch-scoped"}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge active={member.status === "active"} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <p className="text-slate-600">{member.email}</p>
                        <VerificationBadge
                          verified={Boolean(member.emailVerified)}
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        {renderStaffActions(member)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  </div>

  {/* Create staff modal */}
  {showAddModal && (
    <Modal
      title="Add Staff Account"
      onClose={() => setShowAddModal(false)}
    >
      <CreateStaffForm branches={branches} onSubmit={handleCreate} />
    </Modal>
  )}

  {/* Assign staff modal */}
  {assigningStaff && (
    <Modal
      title={`Assign ${assigningStaff.name}`}
      onClose={() => setAssigningStaff(null)}
    >
      <AssignStaffModal
        staff={assigningStaff}
        onClose={() => setAssigningStaff(null)}
        onSaved={async () => {
          setAssigningStaff(null);
          await loadAll(false);
        }}
      />
    </Modal>
  )}
</div>


);
}

export default StaffPage;
