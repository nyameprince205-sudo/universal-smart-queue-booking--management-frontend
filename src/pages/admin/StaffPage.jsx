import { useEffect, useState, useCallback } from "react";
import { listStaff, createStaff, deactivateStaff, reactivateStaff } from "../../api/staff";
import { listBranches } from "../../api/branches";
import Modal from "../../components/Modal";

// The frontend half of Task 3's account-creation flow — see
// staff.controller.js's createStaff for why this is the ONE place in the
// whole app that actually sets emailVerified: false, and why that matters.
function CreateStaffForm({ branches, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branchId, setBranchId] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, email, password, branchId: branchId || undefined });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700">Full name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Initial password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        />
        <p className="mt-1 text-xs text-slate-400">At least 8 characters, with a letter and a number.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Branch <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <select
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        >
          <option value="">Not branch-scoped</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-slate-800 text-white py-2 font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Creating…" : "Create Staff Account"}
      </button>
    </form>
  );
}

function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffData, branchesData] = await Promise.all([listStaff(), listBranches()]);
      setStaff(staffData);
      setBranches(branchesData);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load staff.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreate(values) {
    await createStaff(values);
    setShowAddModal(false);
    await loadAll();
  }

  // Deactivating asks for confirmation (this locks the person out
  // immediately, per the backend's login check) — reactivating doesn't,
  // since it's the reversible/low-stakes direction of this same toggle.
  async function handleToggleStatus(member) {
    const isActive = member.status === "active";
    if (isActive && !window.confirm(`Deactivate ${member.name}? They won't be able to log in until reactivated.`)) {
      return;
    }
    setActioningId(member.id);
    setError(null);
    try {
      if (isActive) await deactivateStaff(member.id);
      else await reactivateStaff(member.id);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't update this staff member.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Staff</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-500 transition-colors"
        >
          Add Staff
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading && <p className="mt-8 text-slate-400">Loading…</p>}

      {!loading && staff.length === 0 && !error && (
        <p className="mt-8 text-slate-400">No staff accounts yet — add your first one.</p>
      )}

      {!loading && staff.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((s) => {
                const isActive = s.status === "active";
                return (
                  <tr key={s.id} className={isActive ? "" : "bg-slate-50"}>
                    <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                    <td className="px-4 py-3 text-slate-500">{s.email}</td>
                    <td className="px-4 py-3 text-slate-500">{s.branchName || "Not branch-scoped"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.emailVerified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {s.emailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(s)}
                        disabled={actioningId === s.id}
                        className={`text-sm font-medium hover:underline disabled:opacity-50 ${
                          isActive ? "text-red-600" : "text-sky-600"
                        }`}
                      >
                        {actioningId === s.id ? "Working…" : isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <Modal title="Add Staff Account" onClose={() => setShowAddModal(false)}>
          <CreateStaffForm branches={branches} onSubmit={handleCreate} />
        </Modal>
      )}
    </div>
  );
}

export default StaffPage;
