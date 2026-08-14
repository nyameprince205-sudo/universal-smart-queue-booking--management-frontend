import { useEffect, useState, useCallback } from "react";
import LogoutButton from "../../components/LogoutButton";
import Modal from "../../components/Modal";
import { listOrganizations, createOrganization, updateOrganizationStatus, listBusinessTypes } from "../../api/platform";
import { listOrganizationRequests, reviewOrganizationRequest } from "../../api/organizationRequests";
import { listContactSubmissions, markContactSubmissionRead } from "../../api/contact";
import { listOrgAdmins, deactivateOrgAdmin, reactivateOrgAdmin } from "../../api/platformUsers";

// This page used to only show the organization list — registration
// requests and contact messages each lived on their own separate page,
// which meant a Super Admin had no single place to actually see what
// needed attention. This consolidates all three onto one real dashboard,
// reusing the exact same, already-tested API calls each of those separate
// pages already used — nothing new on the backend, just brought together.
//
// Deliberately no icons or illustrations anywhere on this page — a
// distinct visual identity from the rest of the app comes from color,
// spacing, and typography alone, not decoration.

const ORG_STATUS_STYLES = {
  trial: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  suspended: "bg-red-100 text-red-700",
  cancelled: "bg-slate-200 text-warm-muted-2",
};
const ALL_ORG_STATUSES = ["trial", "active", "suspended", "cancelled"];

const REQUEST_STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

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
      {error && <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div>
        <label htmlFor="org-name" className="block text-sm font-medium text-warm-ink">Organization name</label>
        <input id="org-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-warm-border px-3 py-2 text-warm-ink" />
      </div>
      <div>
        <label htmlFor="org-email" className="block text-sm font-medium text-warm-ink">Contact email</label>
        <input id="org-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-warm-border px-3 py-2 text-warm-ink" />
      </div>
      <div>
        <label htmlFor="org-business-type" className="block text-sm font-medium text-warm-ink">Business type</label>
        <select id="org-business-type" required value={businessTypeId} onChange={(e) => setBusinessTypeId(e.target.value)} className="mt-1 w-full rounded-md border border-warm-border px-3 py-2 text-warm-ink">
          <option value="">Select a business type…</option>
          {businessTypes.map((bt) => <option key={bt.id} value={bt.id}>{bt.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="org-phone" className="block text-sm font-medium text-warm-ink">
          Phone <span className="text-warm-muted font-normal">(optional)</span>
        </label>
        <input id="org-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-md border border-warm-border px-3 py-2 text-warm-ink" />
      </div>
      <button type="submit" disabled={submitting} className="w-full rounded-md bg-forest-600 text-white py-2 font-medium hover:bg-forest-700 disabled:opacity-50 transition-colors">
        {submitting ? "Creating…" : "Create Organization"}
      </button>
    </form>
  );
}

// ---- Tab: Organizations ----
function OrganizationsTab({ organizations, businessTypes, loading, error, onCreate, onStatusChange, updatingStatusId, showAddModal, setShowAddModal }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-warm-muted-2">{organizations.length} organization{organizations.length === 1 ? "" : "s"} on the platform</p>
        <button onClick={() => setShowAddModal(true)} className="rounded-md bg-forest-600 text-white px-4 py-2 text-sm font-medium hover:bg-forest-700 transition-colors">
          Add Organization
        </button>
      </div>

      {loading && <p className="mt-8 text-warm-muted">Loading…</p>}

      {!loading && (
        <div className="mt-4 bg-white rounded-lg border border-warm-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-warm-bg text-warm-muted-2">
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
                    <p className="font-medium text-warm-ink">{org.name}</p>
                    <p className="text-xs text-warm-muted">{org.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-warm-muted-2">{org.businessType?.name}</td>
                  <td className="px-4 py-3 text-warm-muted-2">{org.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ORG_STATUS_STYLES[org.status]}`}>{org.status}</span>
                      <select
                        value={org.status}
                        disabled={updatingStatusId === org.id}
                        onChange={(e) => onStatusChange(org, e.target.value)}
                        className="text-xs rounded border border-warm-border px-1 py-0.5 text-warm-muted-2 disabled:opacity-50"
                      >
                        {ALL_ORG_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
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
          <CreateOrgForm businessTypes={businessTypes} onSubmit={onCreate} />
        </Modal>
      )}
    </div>
  );
}

// ---- Tab: Registration Requests ----
function RequestsTab({ requests, loading, statusFilter, setStatusFilter, businessTypes, onReview, reviewingId }) {
  // Approving now genuinely creates the organization (see the backend's
  // own comment on reviewOrganizationRequest), which needs a real
  // businessTypeId — a request only ever has free-text like "Restaurant"
  // typed by whoever submitted it, not a real link into your business
  // types table. This tracks which request is mid-approval so its picker
  // shows inline, rather than guessing at a match and risking a wrong or
  // duplicate business type getting created silently.
  const [approvingId, setApprovingId] = useState(null);
  const [selectedBusinessTypeId, setSelectedBusinessTypeId] = useState("");

  function startApproving(id) {
    setApprovingId(id);
    setSelectedBusinessTypeId("");
  }

  function confirmApprove(id) {
    if (!selectedBusinessTypeId) return;
    onReview(id, "approved", selectedBusinessTypeId);
    setApprovingId(null);
  }

  return (
    <div>
      <div className="flex gap-2">
        {["pending", "approved", "rejected", ""].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              statusFilter === s ? "bg-forest-600 text-white" : "bg-white text-warm-muted-2 border border-warm-border hover:bg-warm-bg"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading && <p className="mt-8 text-warm-muted">Loading…</p>}
      {!loading && requests.length === 0 && <p className="mt-8 text-warm-muted">No requests here.</p>}

      <div className="mt-4 space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="bg-white rounded-lg border border-warm-border p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-warm-ink">{r.businessName}</p>
                <p className="text-sm text-warm-muted-2">{r.businessType} · {r.ownerName}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${REQUEST_STATUS_STYLES[r.status] || "bg-slate-100 text-warm-muted-2"}`}>{r.status}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-warm-muted-2">
              <p>{r.phone}</p>
              <p>{r.email}</p>
              {r.city && <p>{r.city}{r.region ? `, ${r.region}` : ""}</p>}
              {r.numberOfBranches != null && <p>{r.numberOfBranches} branch{r.numberOfBranches === 1 ? "" : "es"}</p>}
            </div>
            {r.additionalNotes && <p className="mt-2 text-sm text-warm-muted-2 italic">"{r.additionalNotes}"</p>}
            {r.reviewNotes && <p className="mt-2 text-sm text-warm-muted-2">Review note: {r.reviewNotes}</p>}
            {r.status === "approved" && r.createdOrganizationId && (
              <p className="mt-2 text-sm text-forest-600">Organization created (id {r.createdOrganizationId}).</p>
            )}

            {r.status === "pending" && approvingId !== r.id && (
              <div className="mt-4 flex gap-2">
                <button onClick={() => startApproving(r.id)} disabled={reviewingId === r.id} className="rounded-md bg-emerald-700 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                  Approve
                </button>
                <button onClick={() => onReview(r.id, "rejected")} disabled={reviewingId === r.id} className="rounded-md bg-white border border-warm-border text-warm-ink px-3 py-1.5 text-sm font-medium hover:bg-warm-bg disabled:opacity-50 transition-colors">
                  Reject
                </button>
              </div>
            )}

            {r.status === "pending" && approvingId === r.id && (
              <div className="mt-4 rounded-md border border-warm-border bg-warm-bg p-3">
                <label className="block text-xs font-medium text-warm-muted-2 mb-1">
                  Confirm business type before creating the organization — they wrote "{r.businessType}"
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedBusinessTypeId}
                    onChange={(e) => setSelectedBusinessTypeId(e.target.value)}
                    className="flex-1 rounded-md border border-warm-border px-2 py-1.5 text-sm text-warm-ink"
                  >
                    <option value="">Select a business type…</option>
                    {businessTypes.map((bt) => (
                      <option key={bt.id} value={bt.id}>{bt.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => confirmApprove(r.id)}
                    disabled={!selectedBusinessTypeId || reviewingId === r.id}
                    className="rounded-md bg-emerald-700 text-white px-3 py-1.5 text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {reviewingId === r.id ? "Creating…" : "Confirm & create"}
                  </button>
                  <button
                    onClick={() => setApprovingId(null)}
                    className="rounded-md bg-white border border-warm-border text-warm-ink px-3 py-1.5 text-sm font-medium hover:bg-warm-bg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Tab: Contact Messages ----
function MessagesTab({ submissions, loading, unreadOnly, setUnreadOnly, onMarkRead, markingId }) {
  return (
    <div>
      <div className="flex gap-2">
        <button onClick={() => setUnreadOnly(false)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!unreadOnly ? "bg-forest-600 text-white" : "bg-white text-warm-muted-2 border border-warm-border hover:bg-warm-bg"}`}>
          All
        </button>
        <button onClick={() => setUnreadOnly(true)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${unreadOnly ? "bg-forest-600 text-white" : "bg-white text-warm-muted-2 border border-warm-border hover:bg-warm-bg"}`}>
          Unread
        </button>
      </div>

      {loading && <p className="mt-8 text-warm-muted">Loading…</p>}
      {!loading && submissions.length === 0 && <p className="mt-8 text-warm-muted">No messages here.</p>}

      <div className="mt-4 space-y-3">
        {submissions.map((s) => (
          <div key={s.id} className={`rounded-lg border p-5 ${s.isRead ? "bg-white border-warm-border" : "bg-gold-50 border-gold-100"}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-warm-ink">
                  {s.name}
                  {!s.isRead && <span className="ml-2 rounded-full bg-forest-600 text-white text-xs px-2 py-0.5">New</span>}
                </p>
                <p className="text-sm text-warm-muted-2">{s.email}{s.phone ? ` · ${s.phone}` : ""}</p>
                {s.subject && <p className="text-sm font-medium text-warm-ink mt-1">{s.subject}</p>}
              </div>
              <p className="text-xs text-warm-muted shrink-0 ml-3">{new Date(s.createdAt).toLocaleDateString()}</p>
            </div>
            <p className="mt-2 text-sm text-warm-muted-2">{s.message}</p>
            {!s.isRead && (
              <button onClick={() => onMarkRead(s.id)} disabled={markingId === s.id} className="mt-3 text-sm text-forest-600 hover:underline disabled:opacity-50">
                {markingId === s.id ? "Marking…" : "Mark as read"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Super Admin's own missing toolkit, filled in — every Org Admin across
// the whole platform, not just one organization's own. Deactivating one
// here immediately locks that person out (same login check every other
// deactivation in this app already relies on), without touching the
// organization itself or its staff.
const ADMIN_STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-200 text-slate-500",
};

function OrgAdminsTab({ orgAdmins, loading, onToggleStatus, actioningId }) {
  return (
    <div>
      <p className="text-sm text-warm-muted">{orgAdmins.length} Org Admin{orgAdmins.length === 1 ? "" : "s"} across the platform</p>

      {loading && <p className="mt-8 text-warm-muted">Loading…</p>}
      {!loading && orgAdmins.length === 0 && <p className="mt-8 text-warm-muted">No Org Admins yet.</p>}

      {!loading && orgAdmins.length > 0 && (
        <div className="mt-4 bg-white rounded-lg border border-warm-border overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-warm-bg text-warm-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border">
              {orgAdmins.map((a) => {
                const isActive = a.status === "active";
                return (
                  <tr key={a.id} className={isActive ? "" : "bg-warm-bg"}>
                    <td className="px-4 py-3 font-medium text-warm-ink">{a.name}</td>
                    <td className="px-4 py-3 text-warm-muted-2">{a.organizationName || "—"}</td>
                    <td className="px-4 py-3 text-warm-muted-2">
                      <p>{a.email}</p>
                      {a.phone && <p className="text-xs text-warm-muted">{a.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ADMIN_STATUS_STYLES[a.status] || "bg-slate-100 text-warm-muted-2"}`}>
                        {isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onToggleStatus(a)}
                        disabled={actioningId === a.id}
                        className={`text-sm font-medium hover:underline disabled:opacity-50 ${isActive ? "text-red-600" : "text-forest-600"}`}
                      >
                        {actioningId === a.id ? "Working…" : isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PlatformPage() {
  const [activeTab, setActiveTab] = useState("organizations");

  // Organizations
  const [organizations, setOrganizations] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Registration requests
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestStatusFilter, setRequestStatusFilter] = useState("pending");
  const [reviewingId, setReviewingId] = useState(null);

  // Contact messages
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  // Org Admins
  const [orgAdmins, setOrgAdmins] = useState([]);
  const [orgAdminsLoading, setOrgAdminsLoading] = useState(true);
  const [orgAdminActioningId, setOrgAdminActioningId] = useState(null);

  const [error, setError] = useState(null);

  const loadOrganizations = useCallback(async () => {
    setOrgsLoading(true);
    try {
      const [orgsData, businessTypesData] = await Promise.all([listOrganizations(), listBusinessTypes()]);
      setOrganizations(orgsData);
      setBusinessTypes(businessTypesData);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load organizations.");
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const data = await listOrganizationRequests(requestStatusFilter || undefined);
      setRequests(data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load requests.");
    } finally {
      setRequestsLoading(false);
    }
  }, [requestStatusFilter]);

  const loadSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    try {
      const data = await listContactSubmissions(unreadOnly);
      setSubmissions(data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load messages.");
    } finally {
      setSubmissionsLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => { loadOrganizations(); }, [loadOrganizations]);
  useEffect(() => { loadRequests(); }, [loadRequests]);
  useEffect(() => { loadSubmissions(); }, [loadSubmissions]);

  const loadOrgAdmins = useCallback(async () => {
    setOrgAdminsLoading(true);
    try {
      const data = await listOrgAdmins();
      setOrgAdmins(data);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't load Org Admins.");
    } finally {
      setOrgAdminsLoading(false);
    }
  }, []);

  useEffect(() => { loadOrgAdmins(); }, [loadOrgAdmins]);

  // Badge counts — fetched independently of whatever filter each tab
  // currently has applied (so the "Requests" badge still shows the
  // pending count even while viewing the "Approved" filter). Refreshed
  // once on mount and again after any action that could actually change
  // these numbers — not on every filter click, which would just be
  // wasted requests for numbers that didn't change.
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const refreshBadgeCounts = useCallback(async () => {
    const [pending, unread] = await Promise.all([
      listOrganizationRequests("pending").catch(() => []),
      listContactSubmissions(true).catch(() => []),
    ]);
    setPendingCount(pending.length);
    setUnreadCount(unread.length);
  }, []);
  useEffect(() => { refreshBadgeCounts(); }, [refreshBadgeCounts]);

  async function handleCreateOrg(values) {
    await createOrganization(values);
    setShowAddModal(false);
    await loadOrganizations();
  }

  async function handleOrgStatusChange(org, newStatus) {
    setUpdatingStatusId(org.id);
    setError(null);
    try {
      await updateOrganizationStatus(org.id, newStatus);
      await loadOrganizations();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't update this organization's status.");
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleReviewRequest(id, status, businessTypeId) {
    setReviewingId(id);
    setError(null);
    try {
      await reviewOrganizationRequest(id, status, businessTypeId);
      await loadRequests();
      await refreshBadgeCounts();
      // An approval may have just created a real organization — refresh
      // the Organizations tab's own list too, so it's already there the
      // next time someone switches to that tab instead of looking stale.
      if (status === "approved") await loadOrganizations();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't update this request.");
    } finally {
      setReviewingId(null);
    }
  }

  async function handleMarkRead(id) {
    setMarkingId(id);
    setError(null);
    try {
      await markContactSubmissionRead(id);
      await loadSubmissions();
      await refreshBadgeCounts();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't update this message.");
    } finally {
      setMarkingId(null);
    }
  }

  async function handleToggleOrgAdminStatus(admin) {
    const isActive = admin.status === "active";
    if (isActive && !window.confirm(`Deactivate ${admin.name}? They won't be able to log in until reactivated.`)) {
      return;
    }
    setOrgAdminActioningId(admin.id);
    setError(null);
    try {
      if (isActive) await deactivateOrgAdmin(admin.id);
      else await reactivateOrgAdmin(admin.id);
      await loadOrgAdmins();
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't update this Org Admin.");
    } finally {
      setOrgAdminActioningId(null);
    }
  }

  const TABS = [
    { key: "organizations", label: "Organizations", badge: null },
    { key: "requests", label: "Registration Requests", badge: pendingCount },
    { key: "messages", label: "Messages", badge: unreadCount },
    { key: "orgAdmins", label: "Org Admins", badge: null },
  ];

  return (
    <div className="min-h-screen bg-warm-bg font-sans">
      <div className="bg-warm-ink">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium tracking-widest text-white/50 uppercase">Super Admin</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-white">Platform Dashboard</h1>
          </div>
          <LogoutButton className="text-sm font-medium text-white/70 hover:text-white transition-colors" />
        </div>

        <div className="max-w-5xl mx-auto px-8">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key ? "border-gold-600 text-white" : "border-transparent text-white/50 hover:text-white/80"
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-gold-600 text-warm-ink text-xs font-semibold w-5 h-5">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {error && <div className="mb-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

        {activeTab === "organizations" && (
          <OrganizationsTab
            organizations={organizations}
            businessTypes={businessTypes}
            loading={orgsLoading}
            onCreate={handleCreateOrg}
            onStatusChange={handleOrgStatusChange}
            updatingStatusId={updatingStatusId}
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
          />
        )}
        {activeTab === "requests" && (
          <RequestsTab
            requests={requests}
            loading={requestsLoading}
            statusFilter={requestStatusFilter}
            setStatusFilter={setRequestStatusFilter}
            businessTypes={businessTypes}
            onReview={handleReviewRequest}
            reviewingId={reviewingId}
          />
        )}
        {activeTab === "messages" && (
          <MessagesTab
            submissions={submissions}
            loading={submissionsLoading}
            unreadOnly={unreadOnly}
            setUnreadOnly={setUnreadOnly}
            onMarkRead={handleMarkRead}
            markingId={markingId}
          />
        )}
        {activeTab === "orgAdmins" && (
          <OrgAdminsTab
            orgAdmins={orgAdmins}
            loading={orgAdminsLoading}
            onToggleStatus={handleToggleOrgAdminStatus}
            actioningId={orgAdminActioningId}
          />
        )}
      </div>
    </div>
  );
}

export default PlatformPage;
