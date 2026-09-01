import { useEffect, useState, useCallback } from "react";
import { Users, Clock, Radio } from "lucide-react";
import apiClient from "../api/client";
const POLL_INTERVAL_MS = 10000;
const BUSYNESS_STYLES = {
  quiet: {
    dot: "bg-green-500",
    label: "No queue",
    text: "text-green-700",
    bg: "bg-green-50 border-green-200"
  },
  moderate: {
    dot: "bg-amber-500",
    label: "Moderate",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200"
  },
  busy: {
    dot: "bg-red-500",
    label: "Busy",
    text: "text-red-700",
    bg: "bg-red-50 border-red-200"
  }
};
function formatWait(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
function BranchStatus({
  branch,
  showName
}) {
  const style = BUSYNESS_STYLES[branch.busyness] || BUSYNESS_STYLES.moderate;
  return <div className={`rounded-lg border p-4 ${style.bg}`}>
      {showName && <p className="text-sm font-medium text-warm-ink mb-3">{branch.branchName}</p>}

      <div className="flex items-center gap-2 mb-3">
        
        <span className={`w-2 h-2 rounded-full ${style.dot} animate-pulse`} aria-hidden="true" />
        <span className={`text-sm font-medium ${style.text}`}>{style.label}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-warm-muted flex items-center gap-1">
            <Users className="w-3 h-3" aria-hidden="true" /> Waiting
          </p>
          <p className="font-display text-xl font-semibold text-warm-ink mt-0.5">
            {branch.waiting}
          </p>
        </div>
        <div>
          <p className="text-xs text-warm-muted flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden="true" /> Your wait
          </p>
          <p className="font-display text-xl font-semibold text-warm-ink mt-0.5">
            {formatWait(branch.estimatedWaitMinutes)}
          </p>
        </div>
        <div>
          <p className="text-xs text-warm-muted flex items-center gap-1">
            <Radio className="w-3 h-3" aria-hidden="true" /> Now serving
          </p>
          <p className="font-display text-xl font-semibold text-forest-600 mt-0.5">
            {branch.nowServing || "—"}
          </p>
        </div>
      </div>
    </div>;
}
function LiveQueueStatus({
  slug
}) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const load = useCallback(async () => {
    try {
      const res = await apiClient.get(`/queue/status/${slug}`);
      setData(res.data);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [slug]);
  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);
  if (failed || !data || !data.branches || data.branches.length === 0) return null;
  return <section className="mb-6" aria-labelledby="live-queue-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="live-queue-heading" className="text-sm font-medium text-warm-muted">
          Queue right now
        </h2>
        <span className="text-xs text-warm-muted">Updates live</span>
      </div>

      <div className={data.branches.length > 1 ? "grid sm:grid-cols-2 gap-3" : ""}>
        {data.branches.map(branch => <BranchStatus key={branch.branchId} branch={branch} showName={data.branches.length > 1} />)}
      </div>
    </section>;
}
export default LiveQueueStatus;