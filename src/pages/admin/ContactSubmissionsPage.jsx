import { useEffect, useState, useCallback } from "react";
import {
  Mail,
  MailOpen,
  Inbox,
  RefreshCw,
  CheckCheck,
  Clock3,
  UserRound,
  Phone,
  AtSign,
  MessageSquareText,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

import {
  listContactSubmissions,
  markContactSubmissionRead,
} from "../../api/contact";

function formatMessageDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function MessageSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-stone-100" />

        <div className="flex-1 space-y-3">
          <div className="h-4 w-1/3 rounded bg-stone-100" />
          <div className="h-3 w-2/3 rounded bg-stone-100" />
          <div className="h-3 w-1/4 rounded bg-stone-100" />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="h-3 rounded bg-stone-100" />
        <div className="h-3 w-5/6 rounded bg-stone-100" />
        <div className="h-3 w-2/3 rounded bg-stone-100" />
      </div>
    </div>
  );
}

function MessageCard({ submission, marking, onMarkRead }) {
  const isUnread = !submission.isRead;

  return (
    <article
      className={`overflow-hidden rounded-2xl border transition duration-200 hover:shadow-md ${
        isUnread
          ? "border-emerald-200 bg-white shadow-sm"
          : "border-stone-200/80 bg-white shadow-sm"
      }`}
    >
      {isUnread && <div className="h-1 bg-emerald-600" />}

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isUnread
                ? "bg-emerald-50 text-emerald-700"
                : "bg-stone-100 text-stone-500"
            }`}
          >
            {isUnread ? <Mail size={22} /> : <MailOpen size={22} />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-words text-base font-bold text-stone-900">
                    {submission.name || "Unknown sender"}
                  </h2>

                  {isUnread && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-inset ring-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      Unread
                    </span>
                  )}
                </div>

                {submission.subject && (
                  <p className="mt-1.5 break-words text-sm font-semibold text-stone-700">
                    {submission.subject}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5 text-xs text-stone-400">
                <Clock3 size={14} />
                <time dateTime={submission.createdAt || undefined}>
                  {formatMessageDate(submission.createdAt)}
                </time>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
              {submission.email && (
                <a
                  href={`mailto:${submission.email}`}
                  className="inline-flex min-w-0 items-center gap-2 text-sm text-stone-500 transition hover:text-emerald-700"
                >
                  <AtSign size={15} className="shrink-0" />
                  <span className="break-all">{submission.email}</span>
                  <ArrowUpRight size={13} className="shrink-0" />
                </a>
              )}

              {submission.phone && (
                <a
                  href={`tel:${submission.phone}`}
                  className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-emerald-700"
                >
                  <Phone size={15} className="shrink-0" />
                  <span>{submission.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-stone-100 bg-stone-50/80 p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
            <MessageSquareText size={15} />
            Message
          </div>

          <p className="whitespace-pre-wrap break-words text-sm leading-7 text-stone-700">
            {submission.message || "No message content provided."}
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-stone-400">
            Message ID: {submission.id}
          </span>

          {isUnread ? (
            <button
              type="button"
              onClick={() => onMarkRead(submission.id)}
              disabled={marking}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {marking ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <CheckCheck size={16} />
              )}

              {marking ? "Updating..." : "Mark as read"}
            </button>
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-stone-400">
              <CheckCheck size={16} />
              Already read
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const load = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const data = await listContactSubmissions(unreadOnly);
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err.response?.data?.error || "Couldn't load contact messages."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [unreadOnly]
  );

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkRead(id) {
    setMarkingId(id);
    setError(null);

    try {
      await markContactSubmissionRead(id);
      await load(true);
    } catch (err) {
      setError(
        err.response?.data?.error || "Couldn't update this message."
      );
    } finally {
      setMarkingId(null);
    }
  }

  const unreadCount = submissions.filter(
    (submission) => !submission.isRead
  ).length;

  return (
    <main className="min-h-screen bg-stone-50/70 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-7">
        {/* Page header */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <Inbox size={16} />
              <span>Communication centre</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Contact messages
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base">
              Read customer enquiries, find their contact details, and keep
              track of messages that still need attention.
            </p>
          </div>

          <button
            type="button"
            onClick={() => load(true)}
            disabled={loading || refreshing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-100 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh messages
          </button>
        </section>

        {/* Summary cards */}
        {!loading && !error && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-stone-500">
                    Messages shown
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
                    {submissions.length}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
                  <Inbox size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-stone-500">
                    Unread messages shown
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-700">
                    {unreadCount}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Mail size={22} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Your inbox
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Select a view to manage incoming messages.
            </p>
          </div>

          <div
            className="inline-flex w-fit rounded-xl border border-stone-200 bg-white p-1 shadow-sm"
            role="group"
            aria-label="Filter contact messages"
          >
            <button
              type="button"
              aria-pressed={!unreadOnly}
              onClick={() => setUnreadOnly(false)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                !unreadOnly
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Inbox size={15} />
              All messages
            </button>

            <button
              type="button"
              aria-pressed={unreadOnly}
              onClick={() => setUnreadOnly(true)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                unreadOnly
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Mail size={15} />
              Unread
            </button>
          </div>
        </section>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Couldn't complete that action
                </p>

                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => load()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <MessageSkeleton key={item} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && submissions.length === 0 && !error && (
          <section className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              {unreadOnly ? (
                <CheckCheck size={30} />
              ) : (
                <Inbox size={30} />
              )}
            </div>

            <h3 className="mt-5 text-xl font-bold text-stone-900">
              {unreadOnly ? "You're all caught up!" : "No messages yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
              {unreadOnly
                ? "There are no unread messages in this view. New customer enquiries will appear here when they arrive."
                : "Customer enquiries submitted through your contact form will appear here."}
            </p>

            {unreadOnly && (
              <button
                type="button"
                onClick={() => setUnreadOnly(false)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                <Inbox size={16} />
                View all messages
              </button>
            )}
          </section>
        )}

        {/* Message list */}
        {!loading && submissions.length > 0 && (
          <section className="space-y-4">
            {submissions.map((submission) => (
              <MessageCard
                key={submission.id}
                submission={submission}
                marking={markingId === submission.id}
                onMarkRead={handleMarkRead}
              />
            ))}
          </section>
        )}

        {/* Footer */}
        {!loading && submissions.length > 0 && !error && (
          <div className="flex items-center justify-between border-t border-stone-200 pt-4 text-xs text-stone-400">
            <span>
              Showing {submissions.length}{" "}
              {submissions.length === 1 ? "message" : "messages"}
            </span>

            <span className="inline-flex items-center gap-1.5">
              <UserRound size={13} />
              Contact inbox
            </span>
          </div>
        )}
      </div>
    </main>
  );
}

export default ContactSubmissionsPage;

