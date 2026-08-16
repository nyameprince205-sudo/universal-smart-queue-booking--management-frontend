import { useEffect, useState, useCallback } from "react";
import { listBranches, createBranch, updateBranch } from "../../api/branches";
import Modal from "../../components/Modal";
function BranchForm({
  initialValues,
  onSubmit,
  submitLabel
}) {
  const [name, setName] = useState(initialValues?.name || "");
  const [address, setAddress] = useState(initialValues?.address || "");
  const [phone, setPhone] = useState(initialValues?.phone || "");
  const [timezone, setTimezone] = useState(initialValues?.timezone || "Africa/Accra");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        address,
        phone,
        timezone
      });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }
  return <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-slate-700">Branch name</label>
        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Address</label>
        <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Phone</label>
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Timezone</label>
        <input type="text" value={timezone} onChange={e => setTimezone(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
      </div>
      <button type="submit" disabled={submitting} className="w-full rounded-md bg-slate-800 text-white py-2 font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>;
}
function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const loadBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listBranches();
      setBranches(data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load branches.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadBranches();
  }, [loadBranches]);
  async function handleCreate(values) {
    await createBranch(values);
    setShowAddModal(false);
    await loadBranches();
  }
  async function handleEditSubmit(values) {
    await updateBranch(editingBranch.id, values);
    setEditingBranch(null);
    await loadBranches();
  }
  async function toggleStatus(branch) {
    const newStatus = branch.status === "active" ? "inactive" : "active";
    await updateBranch(branch.id, {
      status: newStatus
    });
    await loadBranches();
  }
  return <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Branches</h1>
        <button onClick={() => setShowAddModal(true)} className="rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-500 transition-colors">
          Add Branch
        </button>
      </div>

      {error && <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading && <p className="mt-8 text-slate-400">Loading…</p>}

      {!loading && branches.length === 0 && !error && <p className="mt-8 text-slate-400">No branches yet — add your first one.</p>}

      {!loading && branches.length > 0 && <div className="mt-6 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.map(branch => <tr key={branch.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{branch.name}</td>
                  <td className="px-4 py-3 text-slate-500">{branch.address || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{branch.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${branch.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button onClick={() => setEditingBranch(branch)} className="text-sky-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => toggleStatus(branch)} className="text-slate-500 hover:underline">
                      {branch.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>}

      {showAddModal && <Modal title="Add Branch" onClose={() => setShowAddModal(false)}>
          <BranchForm onSubmit={handleCreate} submitLabel="Add Branch" />
        </Modal>}

      {editingBranch && <Modal title="Edit Branch" onClose={() => setEditingBranch(null)}>
          <BranchForm initialValues={editingBranch} onSubmit={handleEditSubmit} submitLabel="Save Changes" />
        </Modal>}
    </div>;
}
export default BranchesPage;