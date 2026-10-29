import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Headset,
  MessageSquare,
  Plus,
  Search,
  Building2,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
  LifeBuoy,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SupportThread from "../../components/SupportThread";
import {
  createTicket,
  listMyTickets,
  getTicket,
} from "../../api/support";
import { searchOrganizations } from "../../api/publicOrg";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useAuth } from "../../context/AuthContext";

function SupportPage() {
  useDocumentTitle("Support");

  const { isAuthenticated, authType } = useAuth();
  const isLoggedInCustomer =
    isAuthenticated && authType === "customer";

  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openingTicketId, setOpeningTicketId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [orgs, setOrgs] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [ticketSearch, setTicketSearch] = useState("");

  const [form, setForm] = useState({
    organizationId: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadTickets = useCallback(async () => {
    if (!isLoggedInCustomer) {
      setTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await listMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setError("Couldn't load your support tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isLoggedInCustomer]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    let cancelled = false;

    async function loadOrganizations() {
      setOrgsLoading(true);

      try {
        const data = await searchOrganizations("");

        if (!cancelled) {
          setOrgs(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setOrgs([]);
        }
      } finally {
        if (!cancelled) {
          setOrgsLoading(false);
        }
      }
    }

    loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, []);

  async function openTicket(id) {
    setOpeningTicketId(id);
    setError(null);

    try {
      const ticket = await getTicket(id);
      setActiveTicket(ticket);
    } catch {
      setError("Couldn't open this ticket. Please try again.");
    } finally {
      setOpeningTicketId(null);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();

    const subject = form.subject.trim();
    const message = form.message.trim();

    if (!form.organizationId || !subject || !message) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createTicket({
        ...form,
        subject,
        message,
      });

      setShowNew(false);
      setForm({
        organizationId: "",
        subject: "",
        message: "",
      });

      await loadTickets();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Couldn't create your support ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleThreadUpdated() {
    if (!activeTicket) return;

    try {
      const updatedTicket = await getTicket(activeTicket.id);
      setActiveTicket(updatedTicket);
      await loadTickets();
    } catch {
      setError("Your ticket may have been updated, but we couldn't refresh it.");
    }
  }

  function closeNewTicketForm() {
    setShowNew(false);
    setError(null);
    setForm({
      organizationId: "",
      subject: "",
      message: "",
    });
  }

  function getStatusStyle(status) {
    switch (status) {
      case "open":
        return {
          className: "border-amber-200 bg-amber-50 text-amber-800",
          icon: Clock3,
          label: "Open",
        };

      case "in_progress":
        return {
          className: "border-sky-200 bg-sky-50 text-sky-800",
          icon: MessageSquare,
          label: "In progress",
        };

      case "resolved":
        return {
          className: "border-emerald-200 bg-emerald-50 text-emerald-800",
          icon: CheckCircle2,
          label: "Resolved",
        };

      case "closed":
        return {
          className: "border-stone-200 bg-stone-100 text-stone-700",
          icon: ShieldCheck,
          label: "Closed",
        };

      default:
        return {
          className: "border-stone-200 bg-stone-100 text-stone-700",
          icon: AlertCircle,
          label: String(status || "Unknown").replaceAll("_", " "),
        };
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const query = ticketSearch.trim().toLowerCase();

    if (!query) return true;

    return (
      String(ticket.subject || "").toLowerCase().includes(query) ||
      String(ticket.status || "").toLowerCase().includes(query)
    );
  });

  const openCount = tickets.filter(
    (ticket) =>
      ticket.status === "open" || ticket.status === "in_progress"
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) =>
      ticket.status === "resolved" || ticket.status === "closed"
  ).length;

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7f7f2] font-sans text-stone-800">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#142c24]">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:36px_36px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-stone-300 transition hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to home
            </Link>

            <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-200">
                  <Headset className="h-4 w-4" aria-hidden="true" />
                  Support center
                </div>

                <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  How can we
                  <span className="block text-amber-300">
                    help you today?
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-stone-300 sm:text-lg sm:leading-8">
                  Get assistance with your bookings, queues, or business
                  interactions. Create a support ticket and keep track of
                  the conversation in one place.
                </p>
              </div>

              {isLoggedInCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setShowNew((current) => !current);
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3.5 text-sm font-bold text-[#142c24] shadow-lg shadow-black/10 transition hover:bg-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-300/30"
                >
                  {showNew ? (
                    <X className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  )}

                  {showNew ? "Cancel ticket" : "Create a ticket"}
                </button>
              )}
            </div>
          </div>

          <div className="absolute bottom-0 right-0 hidden h-1.5 w-1/3 bg-amber-300 sm:block" />
        </section>

        {/* Main content */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          {error && (
            <div
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              role="alert"
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <p className="flex-1">{error}</p>

              <button
                type="button"
                onClick={() => setError(null)}
                className="rounded-md p-1 text-red-700 transition hover:bg-red-100"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* New ticket form */}
          {showNew && isLoggedInCustomer && !activeTicket && (
            <section className="mb-10 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_20px_60px_-30px_rgba(20,44,36,0.22)]">
              <div className="border-b border-stone-100 bg-stone-50/70 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#173b2e] text-amber-300">
                    <MessageSquare className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-stone-900 sm:text-2xl">
                      Create a support ticket
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-stone-500">
                      Select the business your enquiry concerns and explain
                      the issue clearly.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreate} className="space-y-5 p-6 sm:p-8">
                <div>
                  <label
                    htmlFor="support-organization"
                    className="block text-sm font-semibold text-stone-700"
                  >
                    Business <span className="text-red-600">*</span>
                  </label>

                  <div className="relative mt-2">
                    <Building2
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400"
                      aria-hidden="true"
                    />

                    <select
                      id="support-organization"
                      name="organizationId"
                      required
                      value={form.organizationId}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          organizationId: e.target.value,
                        }))
                      }
                      disabled={orgsLoading || orgs.length === 0}
                      className="w-full appearance-none rounded-xl border border-stone-200 bg-stone-50/70 py-3 pl-12 pr-4 text-sm text-stone-800 outline-none transition focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {orgsLoading
                          ? "Loading businesses..."
                          : orgs.length === 0
                            ? "No businesses available"
                            : "Select a business"}
                      </option>

                      {orgs.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!orgsLoading && orgs.length === 0 && (
                    <p className="mt-2 text-xs text-stone-500">
                      We couldn't load the business directory. Please try
                      refreshing the page.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="support-subject"
                    className="block text-sm font-semibold text-stone-700"
                  >
                    Subject <span className="text-red-600">*</span>
                  </label>

                  <input
                    id="support-subject"
                    name="subject"
                    type="text"
                    required
                    maxLength={150}
                    value={form.subject}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="e.g. Problem with my booking"
                    className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="support-message"
                      className="block text-sm font-semibold text-stone-700"
                    >
                      Describe your issue{" "}
                      <span className="text-red-600">*</span>
                    </label>

                    <span className="text-xs text-stone-400">
                      {form.message.length}/5000
                    </span>
                  </div>

                  <textarea
                    id="support-message"
                    name="message"
                    required
                    minLength={5}
                    maxLength={5000}
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Explain what happened and how we can help..."
                    className="mt-2 min-h-36 w-full resize-y rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm leading-6 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeNewTicketForm}
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      orgsLoading ||
                      orgs.length === 0
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b2e] px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <LoaderCircle
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        Creating ticket...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Submit ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Ticket conversation */}
          {activeTicket ? (
            <section>
              <button
                type="button"
                onClick={() => {
                  setActiveTicket(null);
                  setError(null);
                }}
                className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to all tickets
              </button>

              <div className="mb-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <MessageSquare
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Support conversation
                    </p>

                    <h2 className="mt-1 break-words text-xl font-bold text-stone-900">
                      {activeTicket.subject}
                    </h2>

                    <div className="mt-3">
                      {(() => {
                        const status = getStatusStyle(activeTicket.status);
                        const StatusIcon = status.icon;

                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                          >
                            <StatusIcon
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            {status.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              <SupportThread
                ticket={activeTicket}
                currentSenderType="customer"
                canResolve={false}
                onUpdated={handleThreadUpdated}
              />
            </section>
          ) : (
            <>
              {/* Ticket overview */}
              {isLoggedInCustomer && (
                <div className="mb-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-stone-500">
                        Total tickets
                      </p>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
                        <LifeBuoy className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>

                    <p className="mt-3 text-3xl font-bold text-stone-900">
                      {tickets.length}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      All your support conversations
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-stone-500">
                        Active tickets
                      </p>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                        <Clock3 className="h-5 w-5" aria-hidden="true" />
                      </div>
                    </div>

                    <p className="mt-3 text-3xl font-bold text-stone-900">
                      {openCount}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Open or being handled
                    </p>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-stone-500">
                        Resolved tickets
                      </p>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                        <CheckCircle2
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    <p className="mt-3 text-3xl font-bold text-stone-900">
                      {resolvedCount}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      Resolved or closed
                    </p>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-stone-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">
                      Your support tickets
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">
                      Open a ticket to read replies and continue the conversation.
                    </p>
                  </div>

                  {isLoggedInCustomer && tickets.length > 0 && (
                    <div className="relative w-full sm:max-w-xs">
                      <Search
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                        aria-hidden="true"
                      />

                      <input
                        type="search"
                        aria-label="Search support tickets"
                        value={ticketSearch}
                        onChange={(e) => setTicketSearch(e.target.value)}
                        placeholder="Search your tickets..."
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
                      />
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-7">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <LoaderCircle
                        className="h-8 w-8 animate-spin text-emerald-800"
                        aria-hidden="true"
                      />
                      <p className="mt-4 font-medium text-stone-700">
                        Loading your tickets...
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        Please wait a moment.
                      </p>
                    </div>
                  ) : !isLoggedInCustomer ? (
                    <div className="mx-auto max-w-lg py-8 text-center sm:py-12">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                        <Headset
                          className="h-8 w-8"
                          aria-hidden="true"
                        />
                      </div>

                      <h3 className="mt-5 text-xl font-bold text-stone-900">
                        Sign in to access support
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-stone-500">
                        Sign in to create support tickets, communicate with
                        businesses, and follow replies to your enquiries.
                      </p>

                      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                          to="/customer/login"
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b2e] px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"
                        >
                          Sign in
                          <ArrowRight
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </Link>

                        <Link
                          to="/customer/register"
                          className="inline-flex items-center justify-center rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-emerald-800 hover:text-emerald-800"
                        >
                          Create an account
                        </Link>
                      </div>
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="mx-auto max-w-lg py-10 text-center sm:py-14">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
                        <MessageSquare
                          className="h-8 w-8"
                          aria-hidden="true"
                        />
                      </div>

                      <h3 className="mt-5 text-xl font-bold text-stone-900">
                        No support tickets yet
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-stone-500">
                        If you need help with a booking or a business, create
                        your first support ticket here.
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setShowNew(true);
                        }}
                        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#173b2e] px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-900"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        Create your first ticket
                      </button>
                    </div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="py-12 text-center">
                      <Search
                        className="mx-auto h-8 w-8 text-stone-300"
                        aria-hidden="true"
                      />
                      <h3 className="mt-3 font-semibold text-stone-900">
                        No matching tickets
                      </h3>
                      <p className="mt-1 text-sm text-stone-500">
                        Try a different search term.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTickets.map((ticket) => {
                        const status = getStatusStyle(ticket.status);
                        const StatusIcon = status.icon;
                        const isOpening =
                          openingTicketId === ticket.id;

                        return (
                          <button
                            key={ticket.id}
                            type="button"
                            onClick={() => openTicket(ticket.id)}
                            disabled={openingTicketId !== null}
                            className="group flex w-full flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-4 text-left transition duration-200 hover:border-emerald-700/40 hover:bg-emerald-50/20 hover:shadow-md disabled:cursor-wait disabled:opacity-70 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                          >
                            <div className="flex min-w-0 items-start gap-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition group-hover:bg-emerald-100 group-hover:text-emerald-800">
                                {isOpening ? (
                                  <LoaderCircle
                                    className="h-5 w-5 animate-spin"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <MessageSquare
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="break-words font-semibold text-stone-900 transition group-hover:text-emerald-900">
                                  {ticket.subject}
                                </h3>

                                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                                  <span className="inline-flex items-center gap-1">
                                    <MessageSquare
                                      className="h-3.5 w-3.5"
                                      aria-hidden="true"
                                    />
                                    {ticket.messages?.length || 0} messages
                                  </span>

                                  <span className="hidden text-stone-300 sm:inline">
                                    •
                                  </span>

                                  <span className="inline-flex items-center gap-1">
                                    <Clock3
                                      className="h-3.5 w-3.5"
                                      aria-hidden="true"
                                    />
                                    Updated{" "}
                                    {ticket.updatedAt
                                      ? new Date(
                                          ticket.updatedAt
                                        ).toLocaleDateString()
                                      : "recently"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 pl-15 sm:justify-end sm:pl-0">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                              >
                                <StatusIcon
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                {status.label}
                              </span>

                              <ArrowRight
                                className="h-4 w-4 shrink-0 text-stone-400 transition group-hover:translate-x-1 group-hover:text-emerald-800"
                                aria-hidden="true"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-5">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">
                    Your support conversations
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Your tickets are associated with your account. Sign in
                    with the correct customer account to view your support
                    history and replies.
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default SupportPage;

