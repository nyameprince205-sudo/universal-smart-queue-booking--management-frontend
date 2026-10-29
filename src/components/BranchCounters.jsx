import { useEffect, useState, useCallback } from "react";
import {
Headset,
Plus,
LoaderCircle,
AlertCircle,
CheckCircle2,
XCircle,
Building2,
RefreshCw,
Users,
ArrowRight,
} from "lucide-react";
import apiClient from "../api/client";

function BranchCounters({ branchId, branchName }) {
const [counters, setCounters] = useState(null);
const [newName, setNewName] = useState("");
const [creating, setCreating] = useState(false);
const [updatingId, setUpdatingId] = useState(null);
const [error, setError] = useState(null);

const load = useCallback(async () => {
setError(null);


try {
  const res = await apiClient.get(
    `/queue/counters?branchId=${encodeURIComponent(branchId)}`
  );
  setCounters(Array.isArray(res.data) ? res.data : []);
} catch (err) {
  setError(err.response?.data?.error || "Couldn't load counters.");
}


}, [branchId]);

useEffect(() => {
setCounters(null);
load();
}, [load]);

async function handleCreate(e) {
e.preventDefault();


const trimmedName = newName.trim();

if (!trimmedName || creating) return;

setCreating(true);
setError(null);

try {
  await apiClient.post("/queue/counters", {
    branchId,
    name: trimmedName,
  });

  setNewName("");
  await load();
} catch (err) {
  setError(
    err.response?.data?.error || "Couldn't create this counter."
  );
} finally {
  setCreating(false);
}


}

async function toggleOpen(counter) {
if (updatingId !== null) return;


setUpdatingId(counter.id);
setError(null);

try {
  await apiClient.patch(`/queue/counters/${counter.id}`, {
    status: counter.status === "open" ? "closed" : "open",
  });

  await load();
} catch (err) {
  setError(
    err.response?.data?.error || "Couldn't update this counter."
  );
} finally {
  setUpdatingId(null);
}


}

if (counters === null) {
return ( <div className="mt-4 flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-5"> <LoaderCircle className="h-5 w-5 animate-spin text-emerald-700" /> <div> <p className="text-sm font-semibold text-stone-800">
Loading counters </p> <p className="mt-0.5 text-xs text-stone-500">
Retrieving counters for this branch… </p> </div> </div>
);
}

const openCount = counters.filter(
(counter) => counter.status === "open"
).length;

const closedCount = counters.length - openCount;

return ( <section className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-white font-sans shadow-sm">
{/* Section header */} <div className="border-b border-stone-100 bg-stone-50/80 px-4 py-4 sm:px-5"> <div className="flex items-start justify-between gap-3"> <div className="flex items-start gap-3"> <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100"> <Headset className="h-5 w-5 text-emerald-800" /> </div>


        <div>
          <h3 className="font-semibold text-stone-900">
            Branch counters
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
            <Building2 className="h-3.5 w-3.5" />
            {branchName || "Selected branch"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={load}
        aria-label="Refresh counters"
        className="rounded-lg border border-stone-200 bg-white p-2 text-stone-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>

    {/* Summary */}
    <div className="mt-4 grid grid-cols-3 gap-2">
      <div className="rounded-xl border border-stone-200 bg-white p-3">
        <p className="text-xs text-stone-500">Total counters</p>
        <p className="mt-1 text-xl font-bold text-stone-900">
          {counters.length}
        </p>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
        <p className="text-xs text-emerald-800">Open</p>
        <p className="mt-1 text-xl font-bold text-emerald-900">
          {openCount}
        </p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-3">
        <p className="text-xs text-stone-500">Closed</p>
        <p className="mt-1 text-xl font-bold text-stone-600">
          {closedCount}
        </p>
      </div>
    </div>
  </div>

  <div className="space-y-5 p-4 sm:p-5">
    {/* Error */}
    {error && (
      <div
        role="alert"
        className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
        <p>{error}</p>
      </div>
    )}

    {/* Counter list */}
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-stone-800">
          Your counters
        </h4>
        <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
          {counters.length} {counters.length === 1 ? "counter" : "counters"}
        </span>
      </div>

      {counters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Headset className="h-6 w-6 text-stone-400" />
          </div>

          <h4 className="mt-3 text-sm font-semibold text-stone-800">
            No counters created yet
          </h4>

          <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-stone-500">
            Add your first counter below, then assign a staff member to it
            from the Staff page.
          </p>

          <button
            type="button"
            onClick={() =>
              document.getElementById("new-counter-name")?.focus()
            }
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            Add first counter
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {counters.map((counter) => {
            const isOpen = counter.status === "open";
            const isUpdating = updatingId === counter.id;

            return (
              <li
                key={counter.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 transition hover:border-emerald-200 hover:shadow-sm sm:p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      isOpen ? "bg-emerald-50" : "bg-stone-100"
                    }`}
                  >
                    <Headset
                      className={`h-5 w-5 ${
                        isOpen ? "text-emerald-800" : "text-stone-500"
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-stone-800">
                      {counter.name}
                    </p>

                    <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500">
                      {counter.assignedUserName ? (
                        <>
                          <Users className="h-3.5 w-3.5" />
                          <span className="truncate">
                            {counter.assignedUserName}
                          </span>
                        </>
                      ) : (
                        "No staff assigned"
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleOpen(counter)}
                  disabled={updatingId !== null}
                  aria-label={`${
                    isOpen ? "Close" : "Open"
                  } ${counter.name}`}
                  className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    isOpen
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 focus-visible:ring-emerald-600"
                      : "border-stone-200 bg-stone-100 text-stone-600 hover:bg-stone-200 focus-visible:ring-stone-500"
                  }`}
                >
                  {isUpdating ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : isOpen ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}

                  {isUpdating
                    ? "Updating"
                    : isOpen
                    ? "Open"
                    : "Closed"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>

    {/* Create counter */}
    <div className="border-t border-stone-100 pt-5">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
          <Plus className="h-4 w-4 text-amber-700" />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-stone-900">
            Add a counter
          </h4>
          <p className="mt-0.5 text-xs text-stone-500">
            Give your counter a clear, recognizable name.
          </p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-3">
        <label
          htmlFor="new-counter-name"
          className="block text-xs font-medium text-stone-600"
        >
          Counter name
        </label>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="new-counter-name"
            type="text"
            placeholder="e.g. Teller 1, Window 2, Table 5"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            maxLength={100}
            disabled={creating}
            className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:bg-stone-50"
          />

          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add counter
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        <p className="text-xs leading-5 text-stone-500">
          Examples: Reception, Cashier 1, Customer Service, Window 2.
        </p>
      </form>
    </div>
  </div>
</section>


);
}

export default BranchCounters;
