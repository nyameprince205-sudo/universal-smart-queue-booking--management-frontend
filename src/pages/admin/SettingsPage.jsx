import { useEffect, useState } from "react";
import {
getMyOrganization,
updateMyOrganization,
} from "../../api/organization";

const inputClass =
"mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

const labelClass = "block text-sm font-semibold text-slate-700";

function FormField({ label, hint, children }) {
return ( <div> <label className={labelClass}>{label}</label>
{hint && ( <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
)}
{children} </div>
);
}

function SectionHeading({ number, title, description }) {
return ( <div className="flex items-start gap-3"> <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
{number} </div> <div> <h2 className="text-base font-bold text-slate-900">{title}</h2> <p className="mt-1 text-sm leading-6 text-slate-500">
{description} </p> </div> </div>
);
}

function SettingsPage() {
const [name, setName] = useState("");
const [phone, setPhone] = useState("");
const [queuePrefix, setQueuePrefix] = useState("");
const [timezone, setTimezone] = useState("");
const [description, setDescription] = useState("");
const [whatsapp, setWhatsapp] = useState("");
const [website, setWebsite] = useState("");
const [facebook, setFacebook] = useState("");
const [instagram, setInstagram] = useState("");
const [openingHours, setOpeningHours] = useState("");

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [saved, setSaved] = useState(false);
const [saving, setSaving] = useState(false);

useEffect(() => {
let active = true;


async function loadSettings() {
  try {
    const data = await getMyOrganization();

    if (!active) return;

    setName(data.name || "");
    setPhone(data.phone || "");
    setQueuePrefix(data.settings?.queuePrefix || "");
    setTimezone(data.settings?.timezone || "");
    setDescription(data.description || "");
    setWhatsapp(data.whatsapp || "");
    setWebsite(data.website || "");
    setFacebook(data.facebook || "");
    setInstagram(data.instagram || "");
    setOpeningHours(data.openingHours || "");
  } catch (err) {
    if (active) {
      setError(
        err.response?.data?.error ||
          "Couldn't load organization settings. Please try again."
      );
    }
  } finally {
    if (active) setLoading(false);
  }
}

loadSettings();

return () => {
  active = false;
};


}, []);

function handleChange(setter) {
return (event) => {
setter(event.target.value);
setSaved(false);
};
}

async function handleSubmit(event) {
event.preventDefault();


setError("");
setSaved(false);
setSaving(true);

try {
  await updateMyOrganization({
    name: name.trim(),
    phone: phone.trim(),
    queuePrefix: queuePrefix.trim(),
    timezone: timezone.trim(),
    description: description.trim(),
    whatsapp: whatsapp.trim(),
    website: website.trim(),
    facebook: facebook.trim(),
    instagram: instagram.trim(),
    openingHours: openingHours.trim(),
  });

  setSaved(true);
} catch (err) {
  setError(
    err.response?.data?.error ||
      "Couldn't save your changes. Please try again."
  );
} finally {
  setSaving(false);
}


}

if (loading) {
return ( <div className="min-h-full bg-slate-50 p-5 sm:p-8"> <div className="mx-auto max-w-5xl animate-pulse space-y-6"> <div className="h-8 w-48 rounded-lg bg-slate-200" /> <div className="h-4 w-72 max-w-full rounded bg-slate-200" /> <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"> <div className="h-5 w-48 rounded bg-slate-200" /> <div className="h-11 rounded-xl bg-slate-100" /> <div className="h-11 rounded-xl bg-slate-100" /> <div className="h-11 rounded-xl bg-slate-100" /> </div> </div> </div>
);
}

return ( <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"> <div className="mx-auto max-w-5xl">
{/* Page header */} <div className="mb-8"> <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"> <span className="h-2 w-2 rounded-full bg-indigo-500" />
Organization Management </div>


      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Settings
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
        Manage your organization's details, queue preferences, and public
        booking profile from one place.
      </p>
    </div>

    {/* Feedback messages */}
    {error && (
      <div
        role="alert"
        className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        <span className="font-bold">!</span>
        <div>
          <p className="font-semibold">Something went wrong</p>
          <p className="mt-1">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => setError("")}
          className="ml-auto rounded-lg px-2 py-1 font-semibold hover:bg-red-100"
          aria-label="Dismiss error"
        >
          ×
        </button>
      </div>
    )}

    {saved && (
      <div
        role="status"
        className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 font-bold">
          ✓
        </span>
        <div>
          <p className="font-semibold">Changes saved successfully</p>
          <p className="mt-1 text-emerald-700">
            Your organization settings have been updated.
          </p>
        </div>
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Organization details */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
          <SectionHeading
            number="01"
            title="Organization Details"
            description="Basic information used to identify and contact your organization."
          />
        </div>

        <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-8">
          <div className="sm:col-span-2">
            <FormField label="Organization name">
              <input
                type="text"
                required
                maxLength={150}
                value={name}
                onChange={handleChange(setName)}
                placeholder="Enter your organization name"
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField label="Phone number" hint="Include your country code if applicable.">
            <input
              type="tel"
              value={phone}
              onChange={handleChange(setPhone)}
              placeholder="e.g. 024 123 4567"
              className={inputClass}
            />
          </FormField>

          <FormField
            label="Timezone"
            hint="Use a timezone identifier supported by your application."
          >
            <input
              type="text"
              value={timezone}
              onChange={handleChange(setTimezone)}
              placeholder="e.g. Africa/Accra"
              className={inputClass}
            />
          </FormField>
        </div>
      </section>

      {/* Queue settings */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
          <SectionHeading
            number="02"
            title="Queue Preferences"
            description="Customize the ticket prefix customers see when joining your queue."
          />
        </div>

        <div className="px-5 py-6 sm:px-8">
          <div className="max-w-xl">
            <FormField
              label="Queue ticket prefix"
              hint="Use up to 5 characters. For example, R produces tickets such as R001 and R002."
            >
              <input
                type="text"
                maxLength={5}
                value={queuePrefix}
                onChange={handleChange(setQueuePrefix)}
                placeholder="e.g. R"
                className={inputClass}
              />
            </FormField>

            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Ticket preview
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {[1, 2, 3].map((number) => (
                  <span
                    key={number}
                    className="rounded-lg border border-indigo-100 bg-white px-4 py-2 font-mono text-sm font-bold text-indigo-700 shadow-sm"
                  >
                    {(queuePrefix.trim() || "Q").toUpperCase()}
                    {String(number).padStart(3, "0")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Public profile */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
          <SectionHeading
            number="03"
            title="Public Booking Profile"
            description="Prepare the details customers can use to learn about your organization and contact you."
          />
        </div>

        <div className="space-y-5 px-5 py-6 sm:px-8">
          <FormField
            label="Description"
            hint="Describe your organization and the services you provide. Maximum 500 characters."
          >
            <textarea
              rows={4}
              maxLength={500}
              value={description}
              onChange={handleChange(setDescription)}
              placeholder="Tell customers about your organization..."
              className={`${inputClass} resize-y`}
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {description.length}/500 characters
            </p>
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="WhatsApp number"
              hint="International format without + or spaces."
            >
              <input
                type="tel"
                value={whatsapp}
                onChange={handleChange(setWhatsapp)}
                placeholder="233201234567"
                className={inputClass}
              />
            </FormField>

            <FormField label="Website">
              <input
                type="url"
                value={website}
                onChange={handleChange(setWebsite)}
                placeholder="https://example.com"
                className={inputClass}
              />
            </FormField>

            <FormField label="Facebook page">
              <input
                type="text"
                value={facebook}
                onChange={handleChange(setFacebook)}
                placeholder="facebook.com/yourpage"
                className={inputClass}
              />
            </FormField>

            <FormField label="Instagram handle or profile">
              <input
                type="text"
                value={instagram}
                onChange={handleChange(setInstagram)}
                placeholder="@yourhandle"
                className={inputClass}
              />
            </FormField>
          </div>

          <FormField
            label="Opening hours"
            hint="Enter your normal operating hours in a readable format."
          >
            <input
              type="text"
              value={openingHours}
              onChange={handleChange(setOpeningHours)}
              placeholder="Mon–Fri: 9am–6pm, Sat: 10am–2pm"
              className={inputClass}
            />
          </FormField>
        </div>
      </section>

      {/* Save actions */}
      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:border sm:px-6">
        <p className="text-xs leading-5 text-slate-500">
          Remember to save your changes before leaving this page.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {saving ? "Saving changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  </div>
</div>


);
}

export default SettingsPage;
