import { useEffect, useState, useCallback } from "react";
import { listBookings, createBooking } from "../../api/adminBookings";
import { lookupCustomerByPhone, quickRegisterCustomer } from "../../api/customers";
import { listBranches } from "../../api/branches";
import { listServices } from "../../api/services";
import Modal from "../../components/Modal";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-sky-100 text-sky-700",
  checked_in: "bg-indigo-100 text-indigo-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
  no_show: "bg-red-100 text-red-700",
};

// Same phone-lookup-then-quick-register pattern as the Staff Queue
// Console's check-in flow (Phase 15 Step 4) — an Org Admin creating a
// booking on a customer's behalf has the identical "who is this for"
// problem a front-desk check-in does.
function CreateBookingForm({ branches, services, onSubmit }) {
  const [phone, setPhone] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState("");
  const [branchId, setBranchId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const availableServices = services.filter((s) => !s.branchId || s.branchId === branchId);

  async function handleLookup(e) {
    e.preventDefault();
    setError(null);
    setFoundCustomer(null);
    setNotFound(false);
    try {
      const customer = await lookupCustomerByPhone(phone);
      setFoundCustomer(customer);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
      else setError(err.response?.data?.error || "Couldn't look up that number.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      let customer = foundCustomer;
      if (!customer) customer = await quickRegisterCustomer({ name, phone });
      await onSubmit({ customerId: customer.id, branchId, serviceId, bookingDate, bookingTime, partySize: Number(partySize), notes: notes || undefined });
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't create this booking.");
    } finally {
      setSubmitting(false);
    }
  }

  const ready = (foundCustomer || (notFound && name.trim())) && branchId && serviceId && bookingDate && bookingTime;

  return (
    <form onSubmit={foundCustomer || notFound ? handleSubmit : handleLookup} className="space-y-4">
      {error && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="flex gap-2">
        <input
          type="tel"
          required
          placeholder="Customer phone number"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setFoundCustomer(null); setNotFound(false); }}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
        />
        {!foundCustomer && !notFound && (
          <button type="submit" className="rounded-md bg-slate-800 text-white px-3 py-2 text-sm hover:bg-slate-700">
            Look Up
          </button>
        )}
      </div>

      {foundCustomer && <p className="text-sm text-green-700">Found: {foundCustomer.name}</p>}
      {notFound && (
        <div>
          <p className="text-sm text-slate-500 mb-1">No customer found — enter a name to register them:</p>
          <input
            type="text"
            required
            placeholder="Customer name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
          />
        </div>
      )}

      {(foundCustomer || notFound) && (
        <>
          <select
            required
            value={branchId}
            onChange={(e) => { setBranchId(e.target.value); setServiceId(""); }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800"
          >
            <option value="">Select a branch…</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select
            required
            disabled={!branchId}
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50"
          >
            <option value="">{branchId ? "Select a service…" : "Pick a branch first"}</option>
            {availableServices.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
            <input type="time" required value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          </div>
          <input type="number" min="1" value={partySize} onChange={(e) => setPartySize(e.target.value)} placeholder="Party size" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes (optional)" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800" />
          <button
            type="submit"
            disabled={!ready || submitting}
            className="w-full rounded-md bg-sky-600 text-white py-2 text-sm font-medium hover:bg-sky-500 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating…" : "Create Booking"}
          </button>
        </>
      )}
    </form>
  );
}

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bookingsData, branchesData, servicesData] = await Promise.all([listBookings(), listBranches(), listServices()]);
      setBookings(bookingsData);
      setBranches(branchesData);
      setServices(servicesData);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleCreate(payload) {
    await createBooking(payload);
    setShowAddModal(false);
    await loadAll();
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Bookings</h1>
        <button onClick={() => setShowAddModal(true)} className="rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-500 transition-colors">
          Create Booking
        </button>
      </div>

      {error && <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <p className="mt-8 text-slate-400">Loading…</p>}
      {!loading && bookings.length === 0 && !error && <p className="mt-8 text-slate-400">No bookings yet.</p>}

      {!loading && bookings.length > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Date / Time</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{b.customer?.name}</p>
                    <p className="text-xs text-slate-400">{b.customer?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{b.service?.name}</td>
                  <td className="px-4 py-3 text-slate-600">{new Date(b.bookingDate).toLocaleDateString()} {b.bookingTime}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[b.status] || "bg-slate-100 text-slate-500"}`}>
                      {b.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <Modal title="Create Booking" onClose={() => setShowAddModal(false)}>
          <CreateBookingForm branches={branches} services={services} onSubmit={handleCreate} />
        </Modal>
      )}
    </div>
  );
}

export default BookingsPage;
