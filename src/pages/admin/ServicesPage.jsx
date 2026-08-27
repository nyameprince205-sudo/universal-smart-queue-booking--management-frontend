import { useEffect, useState, useCallback } from "react";
import { listServices, createService, updateService, deactivateService } from "../../api/services";
import { listBranches } from "../../api/branches";
import Modal from "../../components/Modal";
function ServiceForm({
  branches,
  service,
  onSubmit
}) {
  const isEdit = Boolean(service);
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [durationMinutes, setDurationMinutes] = useState(service?.durationMinutes ?? 30);
  const [price, setPrice] = useState(service?.price ?? "");
  const [branchId, setBranchId] = useState(service?.branchId ?? "");
  const [capacityPerSlot, setCapacityPerSlot] = useState(service?.capacityPerSlot ?? "");
  const [whenFull, setWhenFull] = useState(service?.whenFull ?? "waitlist");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const hasCapacity = capacityPerSlot !== "" && Number(capacityPerSlot) > 0;
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name,
        description: description || undefined,
        durationMinutes: Number(durationMinutes),
        price: price === "" ? null : price,
        branchId: branchId || undefined,
        capacityPerSlot: capacityPerSlot === "" ? null : Number(capacityPerSlot),
        whenFull
      });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }
  return <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-slate-700">Service name</label>
        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Description <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Duration (minutes)</label>
          <input type="number" min="1" required value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Price <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Branch <span className="text-slate-400 font-normal">(optional — leave blank for all branches)</span>
        </label>
        <select value={branchId} onChange={e => setBranchId(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
          <option value="">All branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            How many bookings per time slot? <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input type="number" min="1" placeholder="Leave blank for unlimited" value={capacityPerSlot} onChange={e => setCapacityPerSlot(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
          <p className="mt-1 text-xs text-slate-500">
            How many customers can book this service at the same date and time. A hotel
            room or a private consultation is usually 1; a bank counter might be 3.
            Leave blank if there's no limit.
          </p>
        </div>

        
        {hasCapacity && <div>
            <label className="block text-sm font-medium text-slate-700">
              When that time is full…
            </label>
            <select value={whenFull} onChange={e => setWhenFull(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500">
              <option value="waitlist">Add the customer to a waitlist</option>
              <option value="reject">Tell them it's taken and to pick another time</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {whenFull === "waitlist" ? "Good for short appointments — banks, clinics, salons. If someone cancels, the next person in line is confirmed automatically and notified." : "Good for bookings that last all day — hotel rooms, evening tables. The customer is told immediately so they can choose another time, date or branch instead of waiting."}
            </p>
          </div>}
      </div>

      <button type="submit" disabled={submitting} className="w-full rounded-md bg-slate-800 text-white py-2 font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Service"}
      </button>
    </form>;
}
function ServicesPage() {
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [servicesData, branchesData] = await Promise.all([listServices(), listBranches()]);
      setServices(servicesData);
      setBranches(branchesData);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load services.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadAll();
  }, [loadAll]);
  async function handleCreate(values) {
    await createService(values);
    setShowAddModal(false);
    await loadAll();
  }
  async function handleUpdate(values) {
    await updateService(editingService.id, values);
    setEditingService(null);
    await loadAll();
  }
  async function handleDeactivate(service) {
    if (!window.confirm(`Deactivate "${service.name}"? Customers won't be able to book it anymore.`)) return;
    await deactivateService(service.id);
    await loadAll();
  }
  function branchName(branchId) {
    if (!branchId) return "All branches";
    return branches.find(b => b.id === branchId)?.name || "—";
  }
  function capacityLabel(service) {
    if (service.capacityPerSlot === null || service.capacityPerSlot === undefined) {
      return <span className="text-slate-400">Unlimited</span>;
    }
    return <span>
        {service.capacityPerSlot} per slot
        <span className="text-slate-400">
          {service.whenFull === "reject" ? ", then refuse" : ", then waitlist"}
        </span>
      </span>;
  }
  return <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Services</h1>
        <button onClick={() => setShowAddModal(true)} className="rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-500 transition-colors">
          Add Service
        </button>
      </div>

      {error && <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading && <p className="mt-8 text-slate-400">Loading…</p>}

      {!loading && services.length === 0 && !error && <p className="mt-8 text-slate-400">No active services yet — add your first one.</p>}

      {!loading && services.length > 0 && <div className="mt-6 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map(service => <tr key={service.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{service.name}</p>
                    {service.description && <p className="text-xs text-slate-400">{service.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{service.durationMinutes} min</td>
                  <td className="px-4 py-3 text-slate-500">{service.price ? `GHS ${service.price}` : "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{capacityLabel(service)}</td>
                  <td className="px-4 py-3 text-slate-500">{branchName(service.branchId)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => setEditingService(service)} className="text-sky-600 hover:underline">
                      Edit
                    </button>
                    <span className="text-slate-300 mx-2">|</span>
                    <button onClick={() => handleDeactivate(service)} className="text-red-600 hover:underline">
                      Deactivate
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>}

      {showAddModal && <Modal title="Add Service" onClose={() => setShowAddModal(false)}>
          <ServiceForm branches={branches} onSubmit={handleCreate} />
        </Modal>}

      
      {editingService && <Modal title={`Edit ${editingService.name}`} onClose={() => setEditingService(null)}>
          <ServiceForm key={editingService.id} branches={branches} service={editingService} onSubmit={handleUpdate} />
        </Modal>}
    </div>;
}
export default ServicesPage;