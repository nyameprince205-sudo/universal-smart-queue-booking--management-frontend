import { useEffect, useState } from "react";
import apiClient from "../api/client";
function AssignStaffModal({
  staff,
  onClose,
  onSaved
}) {
  const [counters, setCounters] = useState([]);
  const [services, setServices] = useState([]);
  const [counterId, setCounterId] = useState("");
  const [serviceIds, setServiceIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [countersRes, servicesRes, assignedRes] = await Promise.all([staff.branchId ? apiClient.get(`/queue/counters?branchId=${staff.branchId}`) : Promise.resolve({
          data: []
        }), apiClient.get("/services"), apiClient.get(`/staff/${staff.id}/services`)]);
        if (cancelled) return;
        setCounters(countersRes.data);
        setServices(servicesRes.data);
        setServiceIds(assignedRes.data.serviceIds || []);
        const mine = countersRes.data.find(c => String(c.assignedUserId) === String(staff.id));
        setCounterId(mine ? String(mine.id) : "");
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || "Couldn't load assignment options.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [staff]);
  function toggleService(id) {
    setServiceIds(prev => prev.some(s => String(s) === String(id)) ? prev.filter(s => String(s) !== String(id)) : [...prev, String(id)]);
  }
  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await apiClient.put(`/staff/${staff.id}/services`, {
        serviceIds
      });
      const previous = counters.find(c => String(c.assignedUserId) === String(staff.id));
      if (counterId) {
        await apiClient.patch(`/queue/counters/${counterId}/assign`, {
          userId: staff.id
        });
      } else if (previous) {
        await apiClient.patch(`/queue/counters/${previous.id}/assign`, {
          userId: null
        });
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't save. Please try again.");
      setSaving(false);
    }
  }
  if (loading) return <p className="text-sm text-slate-400">Loading…</p>;
  return <div className="space-y-5">
      {error && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>}

      
      <div>
        <label className="block text-sm font-medium text-slate-700">Counter</label>
        {!staff.branchId ? <p className="mt-1 text-sm text-slate-500">
            {staff.name} isn't assigned to a branch, so there are no counters to choose from. Set
            their branch first.
          </p> : counters.length === 0 ? <p className="mt-1 text-sm text-slate-500">
            No counters exist at this branch yet — create one before assigning.
          </p> : <>
            <select value={counterId} onChange={e => setCounterId(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800">
              <option value="">No counter</option>
              {counters.map(c => {
            const takenByOther = c.assignedUserId && String(c.assignedUserId) !== String(staff.id);
            return <option key={c.id} value={c.id}>
                    {c.name}
                    {takenByOther ? ` — currently ${c.assignedUserName}` : ""}
                  </option>;
          })}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              Choosing a counter someone else is on will move it to {staff.name}.
            </p>
          </>}
      </div>

      
      <div>
        <label className="block text-sm font-medium text-slate-700">Services they handle</label>
        {services.length === 0 ? <p className="mt-1 text-sm text-slate-500">No services created yet.</p> : <>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
              {services.map(s => <label key={s.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={serviceIds.some(id => String(id) === String(s.id))} onChange={() => toggleService(s.id)} className="rounded border-slate-300" />
                  {s.name}
                </label>)}
            </div>
            
            <p className="mt-2 text-xs text-slate-500">
              {serviceIds.length === 0 ? "None selected — they'll handle every service." : `They'll only see queue tickets for ${serviceIds.length === 1 ? "this service" : "these services"}.`}
            </p>
          </>}
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="flex-1 rounded-md bg-slate-800 text-white py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors">
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={onClose} className="rounded-md border border-slate-300 text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>;
}
export default AssignStaffModal;