import { useEffect, useState } from "react";
import {
Users,
UserRound,
Headset,
BriefcaseBusiness,
CheckCircle2,
AlertCircle,
LoaderCircle,
X,
Save,
Building2,
Info,
} from "lucide-react";
import apiClient from "../api/client";

function AssignStaffModal({ staff, onClose, onSaved }) {
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
    const [countersRes, servicesRes, assignedRes] = await Promise.all([
      staff.branchId
        ? apiClient.get(
            `/queue/counters?branchId=${encodeURIComponent(staff.branchId)}`
          )
        : Promise.resolve({ data: [] }),
      apiClient.get("/services"),
      apiClient.get(`/staff/${staff.id}/services`),
    ]);

    if (cancelled) return;

    const loadedCounters = Array.isArray(countersRes.data)
      ? countersRes.data
      : [];
    const loadedServices = Array.isArray(servicesRes.data)
      ? servicesRes.data
      : [];

    setCounters(loadedCounters);
    setServices(loadedServices);
    setServiceIds(
      (assignedRes.data?.serviceIds || []).map(String)
    );

    const assignedCounter = loadedCounters.find(
      (counter) => String(counter.assignedUserId) === String(staff.id)
    );

    setCounterId(assignedCounter ? String(assignedCounter.id) : "");
  } catch (err) {
    if (!cancelled) {
      setError(
        err.response?.data?.error ||
          "Couldn't load assignment options. Please try again."
      );
    }
  } finally {
    if (!cancelled) setLoading(false);
  }
}

load();

return () => {
  cancelled = true;
};


}, [staff.id, staff.branchId]);

function toggleService(id) {
const normalizedId = String(id);


setServiceIds((previous) =>
  previous.some((serviceId) => String(serviceId) === normalizedId)
    ? previous.filter(
        (serviceId) => String(serviceId) !== normalizedId
      )
    : [...previous, normalizedId]
);


}

async function handleSave() {
if (saving) return;


setSaving(true);
setError(null);

try {
  await apiClient.put(`/staff/${staff.id}/services`, {
    serviceIds,
  });

  const previousCounter = counters.find(
    (counter) => String(counter.assignedUserId) === String(staff.id)
  );

  if (counterId) {
    await apiClient.patch(`/queue/counters/${counterId}/assign`, {
      userId: staff.id,
    });
  } else if (previousCounter) {
    await apiClient.patch(
      `/queue/counters/${previousCounter.id}/assign`,
      { userId: null }
    );
  }

  onSaved();
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Couldn't save the assignments. Please try again."
  );
  setSaving(false);
}


}

const assignedServiceCount = serviceIds.length;

if (loading) {
return ( <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8"> <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50"> <LoaderCircle className="h-7 w-7 animate-spin text-emerald-700" /> </div> <div className="text-center"> <p className="font-semibold text-stone-800">
Loading assignments </p> <p className="mt-1 text-sm text-stone-500">
Getting counters and services for {staff.name}… </p> </div> </div>
);
}

return ( <div className="overflow-hidden rounded-2xl bg-white font-sans">
{/* Header */} <div className="relative overflow-hidden border-b border-emerald-900/10 bg-emerald-950 px-5 py-6 text-white sm:px-7"> <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-emerald-800/40 blur-2xl" />


    <div className="relative flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
          <Users className="h-6 w-6 text-amber-300" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
            Team management
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Staff assignment
          </h2>
          <p className="mt-1 text-sm text-emerald-100/75">
            Choose a counter and the services this staff member handles.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        aria-label="Close assignment form"
        className="rounded-xl p-2 text-emerald-100 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 disabled:opacity-50"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  </div>

  <div className="space-y-6 p-5 sm:p-7">
    {/* Staff profile */}
    <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">
        {staff.name?.trim()?.charAt(0)?.toUpperCase() || "S"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-stone-900">
          {staff.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1">
            <UserRound className="h-3.5 w-3.5" />
            Staff member
          </span>
          <span className="h-1 w-1 rounded-full bg-stone-300" />
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {staff.branchId ? "Branch assigned" : "No branch assigned"}
          </span>
        </div>
      </div>

      <div className="hidden rounded-xl bg-white px-3 py-2 text-center shadow-sm sm:block">
        <p className="text-lg font-bold text-emerald-800">
          {assignedServiceCount}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
          Services
        </p>
      </div>
    </div>

    {/* Error message */}
    {error && (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
      >
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <p>{error}</p>
      </div>
    )}

    {/* Counter assignment */}
    <section>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <Headset className="h-5 w-5 text-emerald-800" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-900">
            Counter assignment
          </h3>
          <p className="text-xs text-stone-500">
            Choose where this staff member serves customers.
          </p>
        </div>
      </div>

      {!staff.branchId ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Branch required
            </p>
            <p className="mt-1 text-sm leading-5 text-amber-800">
              {staff.name} isn't assigned to a branch. Assign a branch
              first before selecting a counter.
            </p>
          </div>
        </div>
      ) : counters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center">
          <Headset className="mx-auto h-7 w-7 text-stone-400" />
          <p className="mt-2 text-sm font-semibold text-stone-800">
            No counters available
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Create a counter at this branch before assigning one.
          </p>
        </div>
      ) : (
        <>
          <label
            htmlFor="staff-counter"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Select counter
          </label>

          <select
            id="staff-counter"
            value={counterId}
            onChange={(event) => setCounterId(event.target.value)}
            disabled={saving}
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 disabled:bg-stone-100"
          >
            <option value="">No counter assigned</option>

            {counters.map((counter) => {
              const takenByOther =
                counter.assignedUserId &&
                String(counter.assignedUserId) !== String(staff.id);

              return (
                <option key={counter.id} value={String(counter.id)}>
                  {counter.name}
                  {takenByOther
                    ? ` — currently assigned to ${counter.assignedUserName || "another staff member"}`
                    : ""}
                </option>
              );
            })}
          </select>

          <p className="mt-2 text-xs leading-5 text-stone-500">
            Selecting a counter assigned to another staff member may
            transfer that counter to {staff.name}, depending on your
            backend assignment rules.
          </p>
        </>
      )}
    </section>

    {/* Service assignment */}
    <section>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <BriefcaseBusiness className="h-5 w-5 text-amber-700" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-900">
            Services they handle
          </h3>
          <p className="text-xs text-stone-500">
            Select which services appear in their workload.
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5 text-center">
          <BriefcaseBusiness className="mx-auto h-7 w-7 text-stone-400" />
          <p className="mt-2 text-sm font-semibold text-stone-800">
            No services created yet
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Create services before assigning them to staff.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs text-stone-500">
              {assignedServiceCount === 0
                ? "No specific services selected"
                : `${assignedServiceCount} service${assignedServiceCount === 1 ? "" : "s"} selected`}
            </span>

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                setServiceIds(
                  serviceIds.length === services.length
                    ? []
                    : services.map((service) => String(service.id))
                )
              }
              className="text-xs font-semibold text-emerald-800 transition hover:text-emerald-950 disabled:opacity-50"
            >
              {serviceIds.length === services.length
                ? "Clear selection"
                : "Select all"}
            </button>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-stone-200 p-2">
            {services.map((service) => {
              const selected = serviceIds.some(
                (id) => String(id) === String(service.id)
              );

              return (
                <label
                  key={service.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    selected
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-transparent bg-white hover:border-stone-200 hover:bg-stone-50"
                  } ${saving ? "pointer-events-none opacity-60" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleService(service.id)}
                    disabled={saving}
                    className="h-4 w-4 rounded border-stone-300 accent-emerald-700 focus:ring-emerald-600"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-stone-800">
                      {service.name}
                    </span>
                    {service.description && (
                      <span className="mt-0.5 block text-xs text-stone-500">
                        {service.description}
                      </span>
                    )}
                  </span>

                  {selected && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                  )}
                </label>
              );
            })}
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-stone-50 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
            <p className="text-xs leading-5 text-stone-600">
              {assignedServiceCount === 0
                ? "No services are selected. Your system currently treats this as handling every service, based on the existing interface logic."
                : `This staff member is assigned to ${assignedServiceCount} selected service${assignedServiceCount === 1 ? "" : "s"}. Confirm that your backend uses these assignments when filtering queue tickets.`}
            </p>
          </div>
        </>
      )}
    </section>

    {/* Actions */}
    <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        disabled={saving}
        className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Saving assignments…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save assignments
          </>
        )}
      </button>
    </div>
  </div>
</div>


);
}

export default AssignStaffModal;
