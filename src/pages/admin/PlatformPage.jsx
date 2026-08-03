import { useEffect, useState, useCallback } from "react";
import LogoutButton from "../../components/LogoutButton";
import Modal from "../../components/Modal";
import { listOrganizations, createOrganization, updateOrganizationStatus, listBusinessTypes } from "../../api/platform";

const STATUS_STYLES = {
  trial: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const ALL_STATUSES = ["trial", "active", "suspended", "cancelled"];

function CreateOrgForm({ businessTypes, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, email, businessTypeId, phone: phone || undefined });
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
        <label className="block text-sm font-medium text-slate-700">Organization name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Contact email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Business type</label>
        <select
          required
          value={businessTypeId}
          onChange={(e) => setBusinessTypeId(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        >
          <option value="">Select a business type…</option>
          {businessTypes.map((bt) => (
            <option key={bt.id} value={bt.id}>
              {bt.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Phone <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-slate-800 text-white py-2 font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Creating…" : "Create Organization"}
      </button>
    </form>
  );
}

function PlatformPage() {
  const [organizations, setOrganizations] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [orgsData, businessTypesData] = await Promise.all([listOrganizations(), listBusinessTypes()]);
      setOrganizations(orgsData);
      setBusinessTypes(businessTypesData);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load organizations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreate(values) {
    await createOrganization(values);
    setShowAddModal(false);
    await loadAll();
  }

  async function handleStatusChange(org, newStatus) {
    setUpdatingStatusId(org.id);
    setError(null);
    try {
      await updateOrganizationStatus(org.id, newStatus);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't update this organization's status.");
    } finally {
      setUpdatingStatusId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-slate-400 uppercase">Super Admin</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-800">Platform Organizations</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-500 transition-colors"
          >
            Add Organization
          </button>
          <LogoutButton />
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading && <p className="mt-8 text-slate-400">Loading…</p>}

      {!loading && (
        <div className="mt-6 bg-white rounded-lg border border-slate-200 overflow-hidden max-w-4xl">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Business Type</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {organizations.map((org) => (
                <tr key={org.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{org.name}</p>
                    <p className="text-xs text-slate-400">{org.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{org.businessType?.name}</td>
                  <td className="px-4 py-3 text-slate-500">{org.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[org.status]}`}>
                        {org.status}
                      </span>
                      <select
                        value={org.status}
                        disabled={updatingStatusId === org.id}
                        onChange={(e) => handleStatusChange(org, e.target.value)}
                        className="text-xs rounded border border-slate-300 px-1 py-0.5 text-slate-600 disabled:opacity-50"
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <Modal title="Add Organization" onClose={() => setShowAddModal(false)}>
          <CreateOrgForm businessTypes={businessTypes} onSubmit={handleCreate} />
        </Modal>
      )}
    </div>
  );
}

export default PlatformPage;
