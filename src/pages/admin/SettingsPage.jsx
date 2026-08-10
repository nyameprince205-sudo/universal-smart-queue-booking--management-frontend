import { useEffect, useState } from "react";
import { getMyOrganization, updateMyOrganization } from "../../api/organization";

// Phase 18, Module 8's "Settings" — the org profile editor this links to
// has existed as a backend endpoint since Phase 15 Step 5 with no
// frontend page in front of it until now.
function SettingsPage() {
  const [org, setOrg] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [queuePrefix, setQueuePrefix] = useState("");
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyOrganization()
      .then((data) => {
        setOrg(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setQueuePrefix(data.settings?.queuePrefix || "");
        setTimezone(data.settings?.timezone || "");
      })
      .catch((err) => setError(err.response?.data?.error || "Couldn't load organization settings."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const updated = await updateMyOrganization({ name, phone, queuePrefix, timezone });
      setOrg(updated);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.error || "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8"><p className="text-slate-400">Loading…</p></div>;

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Manage your organization's profile and queue settings.</p>

      <form onSubmit={handleSubmit} className="mt-6 bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        {saved && (
          <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
            Settings saved.
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">Organization name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Queue ticket prefix <span className="text-slate-400 font-normal">(e.g. "R" for R001, R002…)</span>
          </label>
          <input
            type="text"
            maxLength={5}
            value={queuePrefix}
            onChange={(e) => setQueuePrefix(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Timezone</label>
          <input
            type="text"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-800"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-slate-800 text-white px-4 py-2 text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default SettingsPage;
