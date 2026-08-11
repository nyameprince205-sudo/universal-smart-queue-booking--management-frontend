import { Mail, Phone, MapPin } from "lucide-react";
import Navbar from "../../components/Navbar";

// Phase 17, Step 2 (partial — the CONTACT FORM itself is deferred to Step
// 4, since "submit to the backend" needs a new endpoint that doesn't exist
// yet). This ships the static contact info now rather than leaving the
// nav's "Contact" link dead in the meantime; Step 4 adds the form to this
// same page.
function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-800">Contact Us</h1>
        <p className="mt-2 text-slate-500">Have a question or need help? Reach us directly.</p>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 flex items-start gap-3">
            <Mail className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="font-medium text-slate-800">support@queuesaas.example.com</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5 flex items-start gap-3">
            <Phone className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-400">Phone / WhatsApp</p>
              <p className="font-medium text-slate-800">+233 20 000 0000</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5 flex items-start gap-3 sm:col-span-2">
            <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-400">Office</p>
              <p className="font-medium text-slate-800">Accra, Ghana</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-md bg-sky-50 border border-sky-200 px-4 py-3 text-sm text-sky-800">
          A contact form is coming soon — for now, reach us directly using the details above.
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
