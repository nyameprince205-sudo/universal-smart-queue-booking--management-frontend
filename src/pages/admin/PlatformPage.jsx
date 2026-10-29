import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Inbox,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserRoundCog,
  Users,
  XCircle,
} from "lucide-react";

import LogoutButton from "../../components/LogoutButton";
import Modal from "../../components/Modal";

import {
  listOrganizations,
  createOrganization,
  updateOrganizationStatus,
  listBusinessTypes,
} from "../../api/platform";

import {
  listOrganizationRequests,
  reviewOrganizationRequest,
} from "../../api/organizationRequests";

import {
  listContactSubmissions,
  markContactSubmissionRead,
} from "../../api/contact";

import {
  listOrgAdmins,
  deactivateOrgAdmin,
  reactivateOrgAdmin,
} from "../../api/platformUsers";

import SupportInboxPage from "./SupportInboxPage";

const ORG_STATUS_STYLES = {
  trial: "bg-amber-50 text-amber-700 ring-amber-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  suspended: "bg-red-50 text-red-700 ring-red-200",
  cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
};

const ALL_ORG_STATUSES = [
  "trial",
  "active",
  "suspended",
  "cancelled",
];

const REQUEST_STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
};

const ADMIN_STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-stone-100 text-stone-600 ring-stone-200",
};

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

function StatusBadge({ status, styles = ORG_STATUS_STYLES }) {
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[status] || "bg-stone-100 text-stone-600 ring-stone-200"
      }`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          status === "active" || status === "approved"
            ? "bg-emerald-500"
            : status === "pending" || status === "trial"
              ? "bg-amber-500"
              : status === "suspended" || status === "rejected"
                ? "bg-red-500"
                : "bg-stone-400"
        }`}
      />
      {label}
    </span>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            {eyebrow}
          </p>
        )}

        <h2 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
          {title}
        </h2>

        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function LoadingState({ label = "Loading data..." }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-12 text-sm text-stone-500">
      <RefreshCw className="h-4 w-4 animate-spin text-emerald-700" />
      {label}
    </div>
  );
}

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-4 font-semibold text-stone-900">{title}</h3>

      {description && (
        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-stone-500">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function SubscriptionCell({ subscription }) {
  if (!subscription) {
    return (
      <span className="text-xs text-stone-400">
        No subscription
      </span>
    );
  }

  const { state, daysRemaining, plan, isTrial } = subscription;

  if (state === "expired") {
    return (
      <div>
        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
          Expired
        </span>

        <p className="mt-1 text-xs text-stone-500">
          {isTrial ? "Trial ended" : plan}
        </p>
      </div>
    );
  }

  if (state === "cancelled") {
    return (
      <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 ring-1 ring-stone-200">
        Cancelled
      </span>
    );
  }

  const urgent =
    typeof daysRemaining === "number" && daysRemaining <= 7;

  return (
    <div>
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
          isTrial
            ? "bg-sky-50 text-sky-700 ring-sky-200"
            : "bg-emerald-50 text-emerald-700 ring-emerald-200"
        }`}
      >
        {isTrial ? "Trial" : plan || "Subscription"}
      </span>

      {typeof daysRemaining === "number" && (
        <p
          className={`mt-1 text-xs ${
            urgent
              ? "font-semibold text-amber-700"
              : "text-stone-500"
          }`}
        >
          {daysRemaining <= 0
            ? "Ends today"
            : daysRemaining === 1
              ? "1 day left"
              : `${daysRemaining} days left`}
        </p>
      )}
    </div>
  );
}

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
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        businessTypeId,
        phone: phone.trim() || undefined,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="org-name"
          className="mb-1.5 block text-sm font-semibold text-stone-700"
        >
          Organization name
        </label>

        <input
          id="org-name"
          type="text"
          required
          maxLength={150}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. ABK Pharmacy"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      <div>
        <label
          htmlFor="org-email"
          className="mb-1.5 block text-sm font-semibold text-stone-700"
        >
          Contact email
        </label>

        <input
          id="org-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="contact@example.com"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      <div>
        <label
          htmlFor="org-business-type"
          className="mb-1.5 block text-sm font-semibold text-stone-700"
        >
          Business type
        </label>

        <select
          id="org-business-type"
          required
          value={businessTypeId}
          onChange={(e) => setBusinessTypeId(e.target.value)}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
          <option value="">Select a business type...</option>

          {businessTypes.map((bt) => (
            <option key={bt.id} value={bt.id}>
              {bt.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="org-phone"
          className="mb-1.5 block text-sm font-semibold text-stone-700"
        >
          Phone number{" "}
          <span className="font-normal text-stone-400">
            (optional)
          </span>
        </label>

        <input
          id="org-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 024 000 0000"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`${buttonPrimary} w-full`}
      >
        {submitting ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}

        {submitting ? "Creating organization..." : "Create organization"}
      </button>
    </form>
  );
}

function OrganizationsTab({
  organizations,
  businessTypes,
  loading,
  onCreate,
  onStatusChange,
  updatingStatusId,
  showAddModal,
  setShowAddModal,
}) {
  const activeCount = organizations.filter(
    (org) => org.status === "active"
  ).length;

  const trialCount = organizations.filter(
    (org) => org.status === "trial"
  ).length;

  const suspendedCount = organizations.filter(
    (org) => org.status === "suspended"
  ).length;

  return (
    <div>
      <SectionHeading
        eyebrow="Platform directory"
        title="Organizations"
        description="Manage registered businesses, subscription states, and platform access."
        action={
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className={buttonPrimary}
          >
            <Plus className="h-4 w-4" />
            Add organization
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            label: "Active organizations",
            value: activeCount,
            icon: CheckCircle2,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
          },
          {
            label: "On trial",
            value: trialCount,
            icon: Clock3,
            color: "text-amber-700",
            bg: "bg-amber-50",
          },
          {
            label: "Suspended",
            value: suspendedCount,
            icon: XCircle,
            color: "text-red-700",
            bg: "bg-red-50",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-stone-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-stone-500">{item.label}</p>

                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>

              <p className="mt-3 text-2xl font-bold tracking-tight text-stone-900">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-stone-500">
          <span className="font-semibold text-stone-800">
            {organizations.length}
          </span>{" "}
          organization{organizations.length === 1 ? "" : "s"} on the
          platform
        </p>
      </div>

      {loading ? (
        <LoadingState label="Loading organizations..." />
      ) : organizations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          description="Organizations will appear here when businesses register or you add one manually."
          action={
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className={buttonPrimary}
            >
              <Plus className="h-4 w-4" />
              Add first organization
            </button>
          }
        />
      ) : (
        <>
          <div className="space-y-3 sm:hidden">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-stone-900">
                      {org.name}
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      {org.businessType?.name || "Business type not set"}
                    </p>
                  </div>

                  <StatusBadge status={org.status} />
                </div>

                <p className="mt-3 break-all text-sm text-stone-600">
                  {org.email}
                </p>

                {org.slug && (
                  <p className="mt-1 text-xs text-stone-400">
                    Slug: {org.slug}
                  </p>
                )}

                <div className="mt-4 rounded-xl bg-stone-50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                    Subscription
                  </p>

                  <SubscriptionCell subscription={org.subscription} />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor={`org-status-${org.id}`}
                    className="mb-1.5 block text-xs font-semibold text-stone-500"
                  >
                    Change organization status
                  </label>

                  <select
                    id={`org-status-${org.id}`}
                    value={org.status}
                    disabled={updatingStatusId === org.id}
                    onChange={(e) =>
                      onStatusChange(org, e.target.value)
                    }
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-emerald-500 disabled:opacity-50"
                  >
                    {ALL_ORG_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() +
                          status.slice(1)}
                      </option>
                    ))}
                  </select>

                  {updatingStatusId === org.id && (
                    <p className="mt-1.5 text-xs text-stone-400">
                      Updating status...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50">
                  <tr>
                    {[
                      "Organization",
                      "Business type",
                      "Contact email",
                      "Subscription",
                      "Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-stone-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {organizations.map((org) => (
                    <tr
                      key={org.id}
                      className="transition hover:bg-stone-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-stone-900">
                          {org.name}
                        </p>

                        <p className="mt-1 text-xs text-stone-400">
                          {org.slug || `ID: ${org.id}`}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-stone-600">
                        {org.businessType?.name || "—"}
                      </td>

                      <td className="px-5 py-4 text-stone-600">
                        {org.email}
                      </td>

                      <td className="px-5 py-4">
                        <SubscriptionCell
                          subscription={org.subscription}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex min-w-40 flex-col items-start gap-2">
                          <StatusBadge status={org.status} />

                          <select
                            aria-label={`Change status for ${org.name}`}
                            value={org.status}
                            disabled={updatingStatusId === org.id}
                            onChange={(e) =>
                              onStatusChange(org, e.target.value)
                            }
                            className="max-w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs text-stone-600 outline-none focus:border-emerald-500 disabled:opacity-50"
                          >
                            {ALL_ORG_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
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
          </div>
        </>
      )}

      {showAddModal && (
        <Modal
          title="Add organization"
          onClose={() => setShowAddModal(false)}
        >
          <CreateOrgForm
            businessTypes={businessTypes}
            onSubmit={onCreate}
          />
        </Modal>
      )}
    </div>
  );
}

function RequestsTab({
  requests,
  loading,
  statusFilter,
  setStatusFilter,
  businessTypes,
  onReview,
  reviewingId,
}) {
  const [approvingId, setApprovingId] = useState(null);
  const [selectedBusinessTypeId, setSelectedBusinessTypeId] =
    useState("");

  function startApproving(id) {
    setApprovingId(id);
    setSelectedBusinessTypeId("");
  }

  async function confirmApprove(id) {
    if (!selectedBusinessTypeId || reviewingId === id) return;

    await onReview(id, "approved", selectedBusinessTypeId);
    setApprovingId(null);
    setSelectedBusinessTypeId("");
  }

  const filters = ["pending", "approved", "rejected", ""];

  return (
    <div>
      <SectionHeading
        eyebrow="Business onboarding"
        title="Registration requests"
        description="Review applications and approve eligible businesses to join the platform."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((status) => {
          const selected = statusFilter === status;

          return (
            <button
              key={status || "all"}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
              }`}
            >
              {status
                ? status.charAt(0).toUpperCase() + status.slice(1)
                : "All requests"}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingState label="Loading registration requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No requests found"
          description="There are no registration requests matching this filter."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900">
                      {request.businessName}
                    </h3>

                    {request.status === "pending" && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Awaiting review
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-stone-500">
                    {request.businessType || "Business type not specified"}
                    {request.ownerName
                      ? ` · ${request.ownerName}`
                      : ""}
                  </p>
                </div>

                <StatusBadge
                  status={request.status}
                  styles={REQUEST_STATUS_STYLES}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-stone-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="text-xs font-medium text-stone-400">
                    Email
                  </p>
                  <p className="mt-1 break-all font-medium text-stone-700">
                    {request.email || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-stone-400">
                    Phone
                  </p>
                  <p className="mt-1 font-medium text-stone-700">
                    {request.phone || "—"}
                  </p>
                </div>

                {(request.city || request.region) && (
                  <div>
                    <p className="text-xs font-medium text-stone-400">
                      Location
                    </p>
                    <p className="mt-1 font-medium text-stone-700">
                      {[request.city, request.region]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}

                {request.numberOfBranches != null && (
                  <div>
                    <p className="text-xs font-medium text-stone-400">
                      Branches
                    </p>
                    <p className="mt-1 font-medium text-stone-700">
                      {request.numberOfBranches}{" "}
                      {request.numberOfBranches === 1
                        ? "branch"
                        : "branches"}
                    </p>
                  </div>
                )}
              </div>

              {request.additionalNotes && (
                <div className="mt-4 rounded-xl border-l-4 border-amber-300 bg-amber-50/70 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Applicant notes
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                    {request.additionalNotes}
                  </p>
                </div>
              )}

              {request.reviewNotes && (
                <p className="mt-3 text-sm text-stone-500">
                  <span className="font-semibold text-stone-700">
                    Review note:
                  </span>{" "}
                  {request.reviewNotes}
                </p>
              )}

              {request.status === "approved" &&
                request.createdOrganizationId && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Organization created successfully. ID:{" "}
                    {request.createdOrganizationId}
                  </div>
                )}

              {request.status === "pending" && (
                <div className="mt-5 border-t border-stone-100 pt-4">
                  {approvingId !== request.id ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startApproving(request.id)}
                        disabled={reviewingId === request.id}
                        className={buttonPrimary}
                      >
                        <Check className="h-4 w-4" />
                        Approve request
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onReview(request.id, "rejected")
                        }
                        disabled={reviewingId === request.id}
                        className={buttonSecondary}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                      <p className="font-semibold text-stone-900">
                        Confirm business type
                      </p>

                      <p className="mt-1 text-sm leading-6 text-stone-500">
                        Choose the official business type before
                        creating this organization. The applicant
                        entered:{" "}
                        <span className="font-medium text-stone-700">
                          {request.businessType || "Not specified"}
                        </span>
                        .
                      </p>

                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <select
                          aria-label="Select business type"
                          value={selectedBusinessTypeId}
                          onChange={(e) =>
                            setSelectedBusinessTypeId(e.target.value)
                          }
                          className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-emerald-500"
                        >
                          <option value="">
                            Select a business type...
                          </option>

                          {businessTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            confirmApprove(request.id)
                          }
                          disabled={
                            !selectedBusinessTypeId ||
                            reviewingId === request.id
                          }
                          className={buttonPrimary}
                        >
                          {reviewingId === request.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}

                          {reviewingId === request.id
                            ? "Creating..."
                            : "Confirm & create"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setApprovingId(null);
                            setSelectedBusinessTypeId("");
                          }}
                          className={buttonSecondary}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesTab({
  submissions,
  loading,
  unreadOnly,
  setUnreadOnly,
  onMarkRead,
  markingId,
}) {
  return (
    <div>
      <SectionHeading
        eyebrow="Customer communication"
        title="Contact messages"
        description="Review incoming messages and keep track of conversations that still need attention."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setUnreadOnly(false)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            !unreadOnly
              ? "bg-emerald-700 text-white shadow-sm"
              : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
          }`}
        >
          All messages
        </button>

        <button
          type="button"
          onClick={() => setUnreadOnly(true)}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            unreadOnly
              ? "bg-emerald-700 text-white shadow-sm"
              : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
          }`}
        >
          Unread only
        </button>
      </div>

      {loading ? (
        <LoadingState label="Loading messages..." />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={unreadOnly ? "Inbox is clear" : "No messages yet"}
          description={
            unreadOnly
              ? "There are no unread messages waiting for your attention."
              : "Messages submitted through your platform contact form will appear here."
          }
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <article
              key={submission.id}
              className={`rounded-2xl border p-4 transition sm:p-5 ${
                submission.isRead
                  ? "border-stone-200 bg-white"
                  : "border-amber-200 bg-amber-50/50 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    submission.isRead
                      ? "bg-stone-100 text-stone-500"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  <Mail className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-stone-900">
                          {submission.name || "Unknown sender"}
                        </h3>

                        {!submission.isRead && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-1 break-all text-sm text-stone-500">
                        {submission.email || "No email provided"}
                        {submission.phone
                          ? ` · ${submission.phone}`
                          : ""}
                      </p>
                    </div>

                    <time className="shrink-0 text-xs text-stone-400">
                      {submission.createdAt
                        ? new Date(
                            submission.createdAt
                          ).toLocaleString()
                        : "Date unavailable"}
                    </time>
                  </div>

                  {submission.subject && (
                    <p className="mt-3 font-semibold text-stone-800">
                      {submission.subject}
                    </p>
                  )}

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-stone-600">
                    {submission.message}
                  </p>

                  {!submission.isRead && (
                    <button
                      type="button"
                      onClick={() => onMarkRead(submission.id)}
                      disabled={markingId === submission.id}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50"
                    >
                      {markingId === submission.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}

                      {markingId === submission.id
                        ? "Updating..."
                        : "Mark as read"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function OrgAdminsTab({
  orgAdmins,
  loading,
  onToggleStatus,
  actioningId,
}) {
  const activeCount = orgAdmins.filter(
    (admin) => admin.status === "active"
  ).length;

  return (
    <div>
      <SectionHeading
        eyebrow="Access management"
        title="Organization administrators"
        description="Manage administrator accounts across the organizations using your platform."
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">
            Total administrators
          </p>
          <p className="mt-2 text-2xl font-bold text-stone-900">
            {orgAdmins.length}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-sm text-stone-500">
            Active administrators
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {activeCount}
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading administrators..." />
      ) : orgAdmins.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No administrators yet"
          description="Organization administrator accounts will appear here when they are created."
        />
      ) : (
        <>
          <div className="space-y-3 sm:hidden">
            {orgAdmins.map((admin) => {
              const isActive = admin.status === "active";
              const busy = actioningId === admin.id;

              return (
                <div
                  key={admin.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-stone-900">
                        {admin.name}
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        {admin.organizationName || "No organization"}
                      </p>
                    </div>

                    <StatusBadge
                      status={admin.status}
                      styles={ADMIN_STATUS_STYLES}
                    />
                  </div>

                  <p className="mt-3 break-all text-sm text-stone-600">
                    {admin.email}
                  </p>

                  {admin.phone && (
                    <p className="mt-1 text-sm text-stone-500">
                      {admin.phone}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => onToggleStatus(admin)}
                    disabled={busy}
                    className={`mt-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                      isActive
                        ? "bg-red-50 text-red-700 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    {busy ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : isActive ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}

                    {busy
                      ? "Updating..."
                      : isActive
                        ? "Deactivate account"
                        : "Reactivate account"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50">
                  <tr>
                    {[
                      "Administrator",
                      "Organization",
                      "Contact details",
                      "Status",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wider text-stone-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {orgAdmins.map((admin) => {
                    const isActive = admin.status === "active";
                    const busy = actioningId === admin.id;

                    return (
                      <tr
                        key={admin.id}
                        className="transition hover:bg-stone-50/70"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-stone-900">
                            {admin.name}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            {admin.email}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-stone-600">
                          {admin.organizationName || "—"}
                        </td>

                        <td className="px-5 py-4 text-stone-600">
                          {admin.phone || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={admin.status}
                            styles={ADMIN_STATUS_STYLES}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => onToggleStatus(admin)}
                            disabled={busy}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                              isActive
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            }`}
                          >
                            {busy && (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            )}

                            {busy
                              ? "Updating..."
                              : isActive
                                ? "Deactivate"
                                : "Reactivate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PlatformPage() {
  const [activeTab, setActiveTab] = useState("organizations");

  const [organizations, setOrganizations] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestStatusFilter, setRequestStatusFilter] =
    useState("pending");
  const [reviewingId, setReviewingId] = useState(null);

  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  const [orgAdmins, setOrgAdmins] = useState([]);
  const [orgAdminsLoading, setOrgAdminsLoading] = useState(true);
  const [orgAdminActioningId, setOrgAdminActioningId] =
    useState(null);

  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrganizations = useCallback(async () => {
    setOrgsLoading(true);

    try {
      const [orgsData, businessTypesData] = await Promise.all([
        listOrganizations(),
        listBusinessTypes(),
      ]);

      setOrganizations(orgsData);
      setBusinessTypes(businessTypesData);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Couldn't load organizations."
      );
      throw err;
    } finally {
      setOrgsLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);

    try {
      const data = await listOrganizationRequests(
        requestStatusFilter || undefined
      );

      setRequests(data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Couldn't load requests."
      );
      throw err;
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
      setError(
        err.response?.data?.error || "Couldn't load messages."
      );
      throw err;
    } finally {
      setSubmissionsLoading(false);
    }
  }, [unreadOnly]);

  const loadOrgAdmins = useCallback(async () => {
    setOrgAdminsLoading(true);

    try {
      const data = await listOrgAdmins();
      setOrgAdmins(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Couldn't load organization administrators."
      );
      throw err;
    } finally {
      setOrgAdminsLoading(false);
    }
  }, []);

  const refreshBadgeCounts = useCallback(async () => {
    const [pending, unread] = await Promise.all([
      listOrganizationRequests("pending").catch(() => []),
      listContactSubmissions(true).catch(() => []),
    ]);

    setPendingCount(pending.length);
    setUnreadCount(unread.length);
  }, []);

  useEffect(() => {
    loadOrganizations().catch(() => {});
  }, [loadOrganizations]);

  useEffect(() => {
    loadRequests().catch(() => {});
  }, [loadRequests]);

  useEffect(() => {
    loadSubmissions().catch(() => {});
  }, [loadSubmissions]);

  useEffect(() => {
    loadOrgAdmins().catch(() => {});
  }, [loadOrgAdmins]);

  useEffect(() => {
    refreshBadgeCounts();
  }, [refreshBadgeCounts]);

  async function handleCreateOrg(values) {
    await createOrganization(values);
    setShowAddModal(false);
    await loadOrganizations();
  }

  async function handleOrgStatusChange(org, newStatus) {
    if (org.status === newStatus) return;

    setUpdatingStatusId(org.id);
    setError(null);

    try {
      await updateOrganizationStatus(org.id, newStatus);
      await loadOrganizations();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Couldn't update this organization's status."
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleReviewRequest(id, status, businessTypeId) {
    setReviewingId(id);
    setError(null);

    try {
      await reviewOrganizationRequest(
        id,
        status,
        businessTypeId
      );

      await loadRequests();
      await refreshBadgeCounts();

      if (status === "approved") {
        await loadOrganizations();
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Couldn't update this request."
      );
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
      setError(
        err.response?.data?.error ||
          "Couldn't update this message."
      );
    } finally {
      setMarkingId(null);
    }
  }

  async function handleToggleOrgAdminStatus(admin) {
    const isActive = admin.status === "active";

    if (
      isActive &&
      !window.confirm(
        `Deactivate ${admin.name}? They won't be able to log in until reactivated.`
      )
    ) {
      return;
    }

    setOrgAdminActioningId(admin.id);
    setError(null);

    try {
      if (isActive) {
        await deactivateOrgAdmin(admin.id);
      } else {
        await reactivateOrgAdmin(admin.id);
      }

      await loadOrgAdmins();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Couldn't update this organization administrator."
      );
    } finally {
      setOrgAdminActioningId(null);
    }
  }

  async function handleRefreshAll() {
    setRefreshing(true);
    setError(null);

    const results = await Promise.allSettled([
      loadOrganizations(),
      loadRequests(),
      loadSubmissions(),
      loadOrgAdmins(),
      refreshBadgeCounts(),
    ]);

    if (results.some((result) => result.status === "rejected")) {
      setError(
        "Some dashboard information couldn't be refreshed. Check your connection and try again."
      );
    }

    setRefreshing(false);
  }

  const tabs = [
    {
      key: "organizations",
      label: "Organizations",
      icon: Building2,
      badge: null,
    },
    {
      key: "requests",
      label: "Registration requests",
      icon: Inbox,
      badge: pendingCount,
    },
    {
      key: "messages",
      label: "Messages",
      icon: Mail,
      badge: unreadCount,
    },
    {
      key: "orgAdmins",
      label: "Org admins",
      icon: UserRoundCog,
      badge: null,
    },
    {
      key: "support",
      label: "Support",
      icon: ShieldCheck,
      badge: null,
    },
  ];

  const activeTabInfo =
    tabs.find((tab) => tab.key === activeTab) || tabs[0];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <header className="relative overflow-hidden bg-emerald-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-36 h-96 w-96 rounded-full bg-emerald-800/30 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-0 pt-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-amber-300 shadow-inner">
                <Activity className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Universal Smart Queue
                </p>

                <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Platform dashboard
                </h1>

                <p className="mt-1 text-sm text-emerald-100/60">
                  Super administrator workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRefreshAll}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />

                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>

              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <p className="text-xs text-emerald-100/60">
                  Access level
                </p>

                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                  Super Admin
                </p>
              </div>

              <LogoutButton className="text-sm font-semibold text-white/80 transition hover:text-white" />
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 pb-6 lg:grid-cols-4">
            {[
              {
                label: "Organizations",
                value: organizations.length,
                icon: Building2,
                detail: "Platform directory",
              },
              {
                label: "Pending requests",
                value: pendingCount,
                icon: Clock3,
                detail: "Awaiting review",
              },
              {
                label: "Unread messages",
                value: unreadCount,
                icon: Mail,
                detail: "Needs attention",
              },
              {
                label: "Org administrators",
                value: orgAdmins.length,
                icon: Users,
                detail: "Across organizations",
              },
            ].map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-emerald-100/70 sm:text-sm">
                      {stat.label}
                    </p>

                    <Icon className="h-4 w-4 shrink-0 text-amber-300" />
                  </div>

                  <p className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-emerald-100/50">
                    {stat.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <nav
          aria-label="Platform dashboard sections"
          className="relative border-t border-white/10"
        >
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 scrollbar-none sm:px-6 lg:px-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-current={selected ? "page" : undefined}
                  className={`relative inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-4 text-sm font-semibold transition sm:px-4 ${
                    selected
                      ? "border-amber-400 text-white"
                      : "border-transparent text-emerald-100/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />

                  {tab.label}

                  {tab.badge > 0 && (
                    <span
                      className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold ${
                        selected
                          ? "bg-amber-400 text-emerald-950"
                          : "bg-white/15 text-white"
                      }`}
                    >
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
          >
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">Something needs your attention</p>
              <p className="mt-1 leading-6">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="rounded-lg p-1 text-red-500 transition hover:bg-red-100"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-stone-400">
            <span>Platform</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-stone-700">
              {activeTabInfo.label}
            </span>
          </div>

          <div className="hidden items-center gap-2 text-xs font-medium text-stone-400 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Administrative workspace
          </div>
        </div>

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

        {activeTab === "support" && (
          <SupportInboxPage
            senderType="super_admin"
            canResolve={true}
            pageTitle="Platform Support Inbox"
            showEscalate={false}
          />
        )}

        <footer className="mt-10 border-t border-stone-200 pt-5">
          <div className="flex flex-col gap-2 text-xs text-stone-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Universal Smart Queue & Booking Management System
            </p>

            <p className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Super administrator area
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default PlatformPage;

