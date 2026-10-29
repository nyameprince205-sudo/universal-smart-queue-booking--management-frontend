import { useEffect, useState, useCallback } from "react";
import {
Plus,
Search,
BriefcaseBusiness,
Clock3,
Banknote,
MapPin,
Users,
Pencil,
Trash2,
X,
CheckCircle2,
CircleAlert,
RefreshCw,
Layers3,
CalendarClock,
LoaderCircle,
Sparkles,
} from "lucide-react";

import {
listServices,
createService,
updateService,
deactivateService,
} from "../../api/services";

import { listBranches } from "../../api/branches";
import Modal from "../../components/Modal";

const inputClass =
"mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10";

const labelClass = "block text-sm font-semibold text-slate-700";

const cardClass =
"rounded-2xl border border-slate-200/80 bg-white shadow-sm";

function ServiceForm({ branches, service, onSubmit }) {
const isEdit = Boolean(service);

const [name, setName] = useState(service?.name ?? "");
const [description, setDescription] = useState(
service?.description ?? ""
);
const [durationMinutes, setDurationMinutes] = useState(
service?.durationMinutes ?? 30
);
const [price, setPrice] = useState(service?.price ?? "");
const [branchId, setBranchId] = useState(service?.branchId ?? "");
const [capacityPerSlot, setCapacityPerSlot] = useState(
service?.capacityPerSlot ?? ""
);
const [whenFull, setWhenFull] = useState(
service?.whenFull ?? "waitlist"
);

const [error, setError] = useState(null);
const [submitting, setSubmitting] = useState(false);

const hasCapacity =
capacityPerSlot !== "" && Number(capacityPerSlot) > 0;

async function handleSubmit(event) {
event.preventDefault();
setError(null);


if (!name.trim()) {
  setError("Please enter a service name.");
  return;
}

if (!Number.isFinite(Number(durationMinutes)) ||
    Number(durationMinutes) < 1) {
  setError("Duration must be at least one minute.");
  return;
}

if (price !== "" && (!Number.isFinite(Number(price)) || Number(price) < 0)) {
  setError("Please enter a valid non-negative price.");
  return;
}

if (capacityPerSlot !== "" &&
    (!Number.isInteger(Number(capacityPerSlot)) ||
     Number(capacityPerSlot) < 1)) {
  setError("Capacity must be a whole number of at least one, or left blank.");
  return;
}

setSubmitting(true);

try {
  await onSubmit({
    name: name.trim(),
    description: description.trim() || undefined,
    durationMinutes: Number(durationMinutes),
    price: price === "" ? null : price,
    branchId: branchId || undefined,
    capacityPerSlot:
      capacityPerSlot === "" ? null : Number(capacityPerSlot),
    whenFull,
  });
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Something went wrong. Please try again."
  );
} finally {
  setSubmitting(false);
}


}

return ( <form onSubmit={handleSubmit} className="space-y-5">
{error && ( <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"> <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> <p>{error}</p> </div>
)}


  <div>
    <label htmlFor="service-name" className={labelClass}>
      Service name <span className="text-red-500">*</span>
    </label>
    <input
      id="service-name"
      type="text"
      required
      maxLength={120}
      value={name}
      onChange={(event) => setName(event.target.value)}
      placeholder="e.g. General consultation"
      className={inputClass}
    />
  </div>

  <div>
    <label htmlFor="service-description" className={labelClass}>
      Description{" "}
      <span className="font-normal text-slate-400">(optional)</span>
    </label>
    <textarea
      id="service-description"
      rows={3}
      maxLength={500}
      value={description}
      onChange={(event) => setDescription(event.target.value)}
      placeholder="Briefly describe what this service includes..."
      className={`${inputClass} resize-y`}
    />
    <p className="mt-1 text-right text-xs text-slate-400">
      {description.length}/500
    </p>
  </div>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div>
      <label htmlFor="service-duration" className={labelClass}>
        Duration (minutes) <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="service-duration"
          type="number"
          min="1"
          step="1"
          required
          value={durationMinutes}
          onChange={(event) =>
            setDurationMinutes(event.target.value)
          }
          className={`${inputClass} pl-9`}
        />
      </div>
    </div>

    <div>
      <label htmlFor="service-price" className={labelClass}>
        Price{" "}
        <span className="font-normal text-slate-400">(optional)</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
          GHS
        </span>
        <input
          id="service-price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="0.00"
          className={`${inputClass} pl-12`}
        />
      </div>
    </div>
  </div>

  <div>
    <label htmlFor="service-branch" className={labelClass}>
      Branch assignment
    </label>
    <select
      id="service-branch"
      value={branchId}
      onChange={(event) => setBranchId(event.target.value)}
      className={inputClass}
    >
      <option value="">Available across all branches</option>
      {branches.map((branch) => (
        <option key={branch.id} value={branch.id}>
          {branch.name}
        </option>
      ))}
    </select>
    <p className="mt-1.5 text-xs leading-5 text-slate-500">
      Choose a specific branch or make this service available across
      all branches.
    </p>
  </div>

  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:p-5">
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
        <Users className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-800">
          Booking capacity
        </h3>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          Control how many customers can book this service at the
          same date and time.
        </p>
      </div>
    </div>

    <div className="mt-4">
      <label htmlFor="service-capacity" className={labelClass}>
        Customers per time slot
      </label>
      <input
        id="service-capacity"
        type="number"
        min="1"
        step="1"
        value={capacityPerSlot}
        onChange={(event) =>
          setCapacityPerSlot(event.target.value)
        }
        placeholder="Unlimited capacity"
        className={inputClass}
      />
      <p className="mt-1.5 text-xs leading-5 text-slate-500">
        Examples: a private consultation may allow 1 customer, while
        a bank counter may allow several customers per slot.
      </p>
    </div>

    {hasCapacity && (
      <div className="mt-4 border-t border-emerald-100 pt-4">
        <label htmlFor="service-full-policy" className={labelClass}>
          What happens when a slot is full?
        </label>
        <select
          id="service-full-policy"
          value={whenFull}
          onChange={(event) => setWhenFull(event.target.value)}
          className={inputClass}
        >
          <option value="waitlist">
            Add the customer to the waitlist
          </option>
          <option value="reject">
            Ask the customer to choose another slot
          </option>
        </select>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          {whenFull === "waitlist"
            ? "Customers can join the waitlist when the selected slot is full. Automatic confirmation and notifications depend on your backend implementation."
            : "Customers are asked to choose another time, date, or available branch."}
        </p>
      </div>
    )}
  </div>

  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
    <button
      type="submit"
      disabled={submitting}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {submitting ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Saving service...
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          {isEdit ? "Save changes" : "Create service"}
        </>
      )}
    </button>
  </div>
</form>


);
}

function ServiceSkeleton() {
return ( <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
{[1, 2, 3].map((item) => (
<div
key={item}
className={`${cardClass} animate-pulse p-5`}
> <div className="h-4 w-32 rounded bg-slate-200" /> <div className="mt-3 h-3 w-full rounded bg-slate-100" /> <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" /> <div className="mt-6 h-20 rounded-xl bg-slate-100" /> <div className="mt-5 h-9 rounded-lg bg-slate-100" /> </div>
))} </div>
);
}

function ServicesPage() {
const [services, setServices] = useState([]);
const [branches, setBranches] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [showAddModal, setShowAddModal] = useState(false);
const [editingService, setEditingService] = useState(null);
const [search, setSearch] = useState("");
const [busyServiceId, setBusyServiceId] = useState(null);

const loadAll = useCallback(async () => {
setLoading(true);
setError(null);


try {
  const [servicesData, branchesData] = await Promise.all([
    listServices(),
    listBranches(),
  ]);

  setServices(servicesData);
  setBranches(branchesData);
} catch (err) {
  setError(
    err.response?.data?.error || "Couldn't load services."
  );
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
if (
!window.confirm(
`Deactivate "${service.name}"? Customers won't be able to book it anymore.`
)
) {
return;
}


setError(null);
setBusyServiceId(service.id);

try {
  await deactivateService(service.id);
  await loadAll();
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Couldn't deactivate this service."
  );
} finally {
  setBusyServiceId(null);
}


}

function branchName(branchId) {
if (!branchId) return "All branches";


return branches.find(
  (branch) => String(branch.id) === String(branchId)
)?.name || "Unknown branch";


}

function formatPrice(price) {
if (price === null || price === undefined || price === "") {
return "Not specified";
}


const amount = Number(price);

if (!Number.isFinite(amount)) return `GHS ${price}`;

return `GHS ${amount.toLocaleString("en-GH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;


}

function capacityText(service) {
if (
service.capacityPerSlot === null ||
service.capacityPerSlot === undefined ||
service.capacityPerSlot === ""
) {
return "Unlimited";
}


return `${service.capacityPerSlot} per slot`;


}

const filteredServices = services.filter((service) => {
const query = search.trim().toLowerCase();


if (!query) return true;

return [
  service.name,
  service.description,
  branchName(service.branchId),
]
  .filter(Boolean)
  .some((value) => String(value).toLowerCase().includes(query));


});

return ( <main className="min-h-full bg-slate-50/70 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"> <div className="mx-auto max-w-7xl"> <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"> <div> <div className="flex items-center gap-2 text-sm font-medium text-emerald-700"> <BriefcaseBusiness className="h-4 w-4" />
Business configuration </div>


        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Services
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
          Manage the services customers can book, their prices,
          durations, branch assignments, and booking capacity.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowAddModal(true)}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20"
      >
        <Plus className="h-4 w-4" />
        Add service
      </button>
    </header>

    {error && (
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>

        <button
          type="button"
          onClick={loadAll}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>
    )}

    <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Total services
          </p>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Layers3 className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          {loading ? "—" : services.length}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Services returned by your API
        </p>
      </div>

      <div className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Branches
          </p>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <MapPin className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          {loading ? "—" : branches.length}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Available branch assignments
        </p>
      </div>

      <div className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Search results
          </p>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <Search className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          {loading ? "—" : filteredServices.length}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Services matching your search
        </p>
      </div>
    </section>

    <section className={`${cardClass} mt-6 p-4 sm:p-5`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-800">
            Your service catalogue
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your configured services.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search services..."
            aria-label="Search services"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          />
        </div>
      </div>
    </section>

    {loading ? (
      <div className="mt-6">
        <ServiceSkeleton />
      </div>
    ) : services.length === 0 && !error ? (
      <section className={`${cardClass} mt-6 px-6 py-14 text-center`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
          <BriefcaseBusiness className="h-8 w-8 text-emerald-700" />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-900">
          No services yet
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Create your first service to let customers book appointments
          or access your queue.
        </p>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" />
          Create your first service
        </button>
      </section>
    ) : filteredServices.length === 0 ? (
      <section className={`${cardClass} mt-6 px-6 py-12 text-center`}>
        <Search className="mx-auto h-8 w-8 text-slate-400" />
        <h2 className="mt-3 font-semibold text-slate-800">
          No matching services
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Try another name, description, or branch.
        </p>
        <button
          type="button"
          onClick={() => setSearch("")}
          className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Clear search
        </button>
      </section>
    ) : (
      <>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className={`${cardClass} flex min-w-0 flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-semibold text-slate-900">
                    {service.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {branchName(service.branchId)}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  Active
                </span>
              </div>

              {service.description ? (
                <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                  {service.description}
                </p>
              ) : (
                <p className="mt-4 min-h-10 text-sm italic text-slate-400">
                  No description provided.
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    Duration
                  </div>
                  <p className="mt-1.5 font-semibold text-slate-800">
                    {service.durationMinutes} min
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Banknote className="h-3.5 w-3.5" />
                    Price
                  </div>
                  <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
                    {formatPrice(service.price)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    Capacity
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-slate-800">
                    {capacityText(service)}
                  </p>
                  {service.capacityPerSlot !== null &&
                    service.capacityPerSlot !== undefined &&
                    service.capacityPerSlot !== "" && (
                      <p className="mt-1 text-xs text-slate-500">
                        {service.whenFull === "reject"
                          ? "Full slots rejected"
                          : "Full slots waitlist"}
                      </p>
                    )}
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    Branch
                  </div>
                  <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
                    {branchName(service.branchId)}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex gap-2 border-t border-slate-100 pt-4 mt-5">
                <button
                  type="button"
                  onClick={() => setEditingService(service)}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDeactivate(service)}
                  disabled={busyServiceId === service.id}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyServiceId === service.id ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Deactivate
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Showing {filteredServices.length} of {services.length} services.
        </p>
      </>
    )}

    <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <span>Service management</span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarClock className="h-3.5 w-3.5" />
        Changes are saved through your existing API.
      </span>
    </footer>
  </div>

  {showAddModal && (
    <Modal
      title="Create a service"
      onClose={() => setShowAddModal(false)}
    >
      <ServiceForm
        branches={branches}
        onSubmit={handleCreate}
      />
    </Modal>
  )}

  {editingService && (
    <Modal
      title={`Edit ${editingService.name}`}
      onClose={() => setEditingService(null)}
    >
      <ServiceForm
        key={editingService.id}
        branches={branches}
        service={editingService}
        onSubmit={handleUpdate}
      />
    </Modal>
  )}
</main>


);
}

export default ServicesPage;
