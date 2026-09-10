import { useEffect, useState, useCallback } from "react";
import apiClient from "../api/client";
function BranchCounters({
  branchId,
  branchName
}) {
  const [counters, setCounters] = useState(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    try {
      const res = await apiClient.get(`/queue/counters?branchId=${branchId}`);
      setCounters(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load counters.");
    }
  }, [branchId]);
  useEffect(() => {
    load();
  }, [load]);
  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await apiClient.post("/queue/counters", {
        branchId,
        name: newName.trim()
      });
      setNewName("");
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't create this counter.");
    } finally {
      setCreating(false);
    }
  }
  async function toggleOpen(counter) {
    setError(null);
    try {
      await apiClient.patch(`/queue/counters/${counter.id}`, {
        status: counter.status === "open" ? "closed" : "open"
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't update this counter.");
    }
  }
  if (counters === null) return <p className="text-sm text-slate-400">Loading counters…</p>;
  return <div className="mt-3 pt-3 border-t border-slate-100">
      <p className="text-xs font-medium text-slate-500 mb-2">Counters at {branchName}</p>

      {error && <div className="mb-2 rounded-md bg-red-50 border border-red-200 px-3 py-1.5 text-xs text-red-700">
          {error}
        </div>}

      {counters.length === 0 ? <p className="text-xs text-slate-400 mb-2">
          No counters yet — add one, then assign a staff member to it from the Staff page.
        </p> : <ul className="space-y-1.5 mb-3">
          {counters.map(c => <li key={c.id} className="flex items-center justify-between text-sm">
              <span className="text-slate-700">{c.name}</span>
              <button onClick={() => toggleOpen(c)} className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.status === "open" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-200 text-slate-500 hover:bg-slate-300"}`}>
                {c.status === "open" ? "Open" : "Closed"}
              </button>
            </li>)}
        </ul>}

      <form onSubmit={handleCreate} className="flex gap-2">
        <input type="text" placeholder="New counter name…" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-800" />
        <button type="submit" disabled={creating || !newName.trim()} className="rounded-md bg-slate-800 text-white px-3 py-1.5 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors whitespace-nowrap">
          {creating ? "Adding…" : "Add"}
        </button>
      </form>
    </div>;
}
export default BranchCounters;