import Navbar from "../../components/Navbar";
import useDocumentTitle from "../../hooks/useDocumentTitle";
// Phase 17, Step 2. Pure static content, zero backend — built as the real
// final version now rather than deferred to Step 4, since there's nothing
// to gate it on.
function AboutPage() {
  useDocumentTitle("About Us");
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-800">About QueueSaaS</h1>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800">Platform Overview</h2>
          <p className="mt-2 text-slate-600 leading-relaxed">
            QueueSaaS is a multi-tenant queue and booking management platform built for restaurants, salons,
            hospitals, banks, and service businesses across Ghana and Africa. Any business can join the
            platform to manage bookings and live queues, while their customers get a fast, account-optional
            way to book a service or check their place in line.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800">Our Vision</h2>
          <p className="mt-2 text-slate-600 leading-relaxed">
            A future where nobody stands in an unpredictable line — every business, from a neighborhood salon
            to a hospital, can offer its customers a modern, transparent, real-time queue experience.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800">Our Mission</h2>
          <p className="mt-2 text-slate-600 leading-relaxed">
            Give every business — regardless of size or technical resources — the tools to run queues and
            bookings professionally, without the cost or complexity of building it themselves.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800">Benefits for Businesses</h2>
          <ul className="mt-2 space-y-2 text-slate-600 list-disc list-inside">
            <li>Real-time queue management across multiple branches</li>
            <li>Online bookings, with or without requiring customers to register</li>
            <li>Live analytics — wait times, staff performance, revenue, and more</li>
            <li>Automated customer notifications via SMS, WhatsApp, or email</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800">Benefits for Customers</h2>
          <ul className="mt-2 space-y-2 text-slate-600 list-disc list-inside">
            <li>Find and book a business in minutes — no account required</li>
            <li>Track your live position in the queue from your phone</li>
            <li>Get notified the moment it's your turn</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
