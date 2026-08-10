import { useEffect, useState, useCallback } from "react";
import { listOrganizationRequests, reviewOrganizationRequest } from "../../api/organizationRequests";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

// Phase 17, Step 1 — Super Admin review page. Approving here does NOT
// create the organization (see the backend's own comment on
// reviewOrganizationRequest) — after approving, the Super Admin still goes
// to the Platform page's existing "Create Organization" form to actually
// provision it, using the details shown here.
function OrganizationRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrganizationRequests(statusFilter || undefined);
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load requests.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReview(id, status) {
    const reviewNotes = status === "rejected" ? window.prompt("Optional note for rejecting this request:") || undefined : undefined;
    setReviewingId(id);
    try {
      await reviewOrganizationRequest(id, status, reviewNotes);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't update this request.");
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold text-slate-800">Organization Requests</h1>

      <div className="mt-4 flex gap-2">
        {["pending", "approved", "rejected", ""].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              statusFilter === s ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {error && <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading && <p className="mt-8 text-slate-400">Loading…</p>}
      {!loading && requests.length === 0 && !error && <p className="mt-8 text-slate-400">No requests here.</p>}

      <div className="mt-6 space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-800">{r.businessName}</p>
                <p className="text-sm text-slate-500">{r.businessType} · {r.ownerName}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status] || "bg-slate-100 text-slate-500"}`}>
                {r.status}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
              <p>{r.phone}</p>
              <p>{r.email}</p>
              {r.city && <p>{r.city}{r.region ? `, ${r.region}` : ""}</p>}
              {r.numberOfBranches != null && <p>{r.numberOfBranches} branch{r.numberOfBranches === 1 ? "" : "es"}</p>}
            </div>
            {r.additionalNotes && <p className="mt-2 text-sm text-slate-500 italic">"{r.additionalNotes}"</p>}
            {r.reviewNotes && <p className="mt-2 text-sm text-slate-500">Review note: {r.reviewNotes}</p>}

            {r.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleReview(r.id, "approved")}
                  disabled={reviewingId === r.id}
                  className="rounded-md bg-green-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-green-500 disabled:opacity-50 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReview(r.id, "rejected")}
                  disabled={reviewingId === r.id}
                  className="rounded-md bg-white border border-slate-300 text-slate-700 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrganizationRequestsPage;
