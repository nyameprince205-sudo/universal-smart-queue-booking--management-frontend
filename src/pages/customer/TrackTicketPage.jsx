import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { trackTicket } from "../../api/queue";
import { createQueueSocket } from "../../api/socket";
import { formatDuration } from "../../utils/formatDuration";
const STATUS_COPY = {
  waiting: {
    label: "Waiting",
    color: "bg-amber-100 text-amber-700"
  },
  called: {
    label: "You're being called!",
    color: "bg-sky-100 text-sky-700"
  },
  serving: {
    label: "Now being served",
    color: "bg-indigo-100 text-indigo-700"
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-700"
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-slate-100 text-slate-500"
  },
  missed: {
    label: "Missed",
    color: "bg-red-100 text-red-700"
  }
};
const TERMINAL_MESSAGES = {
  completed: "You've been served — thank you!",
  cancelled: "This ticket was cancelled.",
  missed: "This ticket was marked missed. If you still need service, please check in again."
};
function TrackTicketPage() {
  const {
    uuid
  } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const socketRef = useRef(null);
  const load = useCallback(async () => {
    try {
      const result = await trackTicket(uuid);
      setData(result);
      setNotFound(false);
    } catch (err) {
      if (err.response?.status === 404) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [uuid]);
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);
  useEffect(() => {
    if (!data?.branchId) return;
    const socket = createQueueSocket();
    socketRef.current = socket;
    socket.connect();
    socket.emit("join-branch-queue", data.branchId);
    socket.on("queue:update", load);
    return () => {
      socket.emit("leave-branch-queue", data.branchId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [data?.branchId]);
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Loading…</p>
      </div>;
  }
  if (notFound) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Not found</h1>
          <p className="mt-2 text-slate-500">This tracking link is invalid or has expired.</p>
          <Link to="/" className="mt-4 inline-block text-sky-600 hover:underline">
            Back home
          </Link>
        </div>
      </div>;
  }
  const isTerminal = ["completed", "cancelled", "missed"].includes(data.status);
  const statusInfo = STATUS_COPY[data.status] || {
    label: data.status,
    color: "bg-slate-100 text-slate-500"
  };
  return <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-sm mx-auto">
        <p className="text-center text-sm text-slate-500">{data.organizationName}</p>
        <p className="text-center text-xs text-slate-400">{data.branchName}</p>

        <div className="mt-4 bg-white rounded-lg border border-slate-200 p-6 text-center">
          <p className="text-4xl font-bold text-slate-800">{data.ticketNumber}</p>
          <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <p className="mt-1 text-sm text-slate-500">{data.serviceName}</p>

          {isTerminal ? <p className="mt-4 text-sm text-slate-600">{TERMINAL_MESSAGES[data.status]}</p> : <div className="mt-5 grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-xs text-slate-400">Customers ahead</p>
                <p className="text-lg font-semibold text-slate-800">{data.customersAhead}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Estimated wait</p>
                <p className="text-lg font-semibold text-slate-800">{formatDuration(data.estimatedWaitSeconds)}</p>
              </div>
              {data.estimatedArrivalTime && <div className="col-span-2">
                  <p className="text-xs text-slate-400">Estimated turn</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {new Date(data.estimatedArrivalTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })}
                  </p>
                </div>}
            </div>}
        </div>

        <div className="mt-4 bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between text-sm">
          <div>
            <p className="text-slate-400">Now serving</p>
            <p className="font-medium text-slate-800">{data.nowServingTicketNumber || "—"}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Completed today</p>
            <p className="font-medium text-slate-800">{data.customersCompletedToday}</p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">This page updates automatically — no need to refresh.</p>
      </div>
    </div>;
}
export default TrackTicketPage;