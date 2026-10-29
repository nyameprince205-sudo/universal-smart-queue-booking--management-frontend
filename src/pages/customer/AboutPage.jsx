import {
ArrowRight,
Building2,
CalendarCheck,
ChartNoAxesCombined,
CheckCircle2,
Clock3,
HeartHandshake,
MessageSquareText,
ShieldCheck,
Users,
Target,
Eye,
Zap,
} from "lucide-react";

import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import useDocumentTitle from "../../hooks/useDocumentTitle";

function AboutPage() {
useDocumentTitle("About Us");

const businessBenefits = [
{
icon: Clock3,
title: "Real-Time Queue Management",
description:
"Manage customer queues across multiple branches and give customers better visibility into their waiting time.",
},
{
icon: CalendarCheck,
title: "Simplified Bookings",
description:
"Accept online bookings and make it easier for customers to schedule services without unnecessary complications.",
},
{
icon: ChartNoAxesCombined,
title: "Business Analytics",
description:
"Gain insights into waiting times, staff performance, revenue, and other important business activities.",
},
{
icon: MessageSquareText,
title: "Customer Notifications",
description:
"Keep customers informed through supported communication channels such as SMS, WhatsApp, or email.",
},
];

const customerBenefits = [
{
title: "Discover Services",
description:
"Find businesses and explore the services they offer from one convenient platform.",
},
{
title: "Book Without the Hassle",
description:
"Book services without needing to create an account where account-free booking is supported.",
},
{
title: "Track Your Queue",
description:
"Check your queue position from your phone and stay informed about your turn.",
},
{
title: "Stay Informed",
description:
"Receive notifications when updates about your booking or queue are available.",
},
];

return ( <div className="min-h-screen bg-[#F7F8F5] font-sans"> <Navbar />


  <main>
    {/* Hero */}
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#151C19] via-[#1C2923] to-[#26372D] px-4 py-16 sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/[0.06] sm:h-96 sm:w-96"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full border border-[#D9AB3F]/10 sm:h-72 sm:w-72"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#D9AB3F]/[0.05] blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium tracking-wide text-[#E8D5A4] sm:text-sm">
          <HeartHandshake size={16} aria-hidden="true" />
          About our platform
        </span>

        <h1 className="mx-auto mt-7 max-w-4xl font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl md:text-6xl">
          Better Experiences.
          <span className="mt-2 block text-[#E0B957]">
            Less Waiting. More Living.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-3xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
          Universal Smart Queue &amp; Booking Management System helps
          businesses manage bookings and customer queues while making
          everyday service experiences simpler, clearer, and more
          convenient.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#103B2B] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#154D38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9AB3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C2923] sm:w-auto"
          >
            Explore Organizations
            <ArrowRight size={17} aria-hidden="true" />
          </Link>

          <Link
            to="/request-registration"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9AB3F] sm:w-auto"
          >
            Register Your Business
          </Link>
        </div>
      </div>
    </section>

    {/* Platform overview */}
    <section className="px-4 py-14 sm:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#47745A]">
            Platform overview
          </p>

          <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-[#202923] sm:text-3xl lg:text-4xl">
            One platform for better service management.
          </h2>

          <p className="mt-5 text-sm leading-7 text-[#68736B] sm:text-base sm:leading-8">
            Universal Smart Queue &amp; Booking Management System is a
            multi-tenant queue and booking management platform designed
            for restaurants, salons, hospitals, banks, and service
            businesses across Ghana and Africa.
          </p>

          <p className="mt-4 text-sm leading-7 text-[#68736B] sm:text-base sm:leading-8">
            Businesses can join the platform to manage bookings and
            live queues, while customers have a convenient way to
            book services or check their place in line. Customers can
            book without an account where that option is supported.
          </p>

          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[#DCE8DC] bg-white p-4 sm:p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#28583D]">
              <Zap size={21} aria-hidden="true" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#202923]">
                Designed for convenience
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#68736B]">
                Help reduce uncertainty around waiting and make
                everyday service interactions easier to manage.
              </p>
            </div>
          </div>
        </div>

        {/* Platform feature panel */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#183C2C] to-[#26372D] p-6 shadow-[0_20px_50px_rgba(21,45,30,0.15)] sm:p-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border border-white/[0.07]"
          />

          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-[#E0B957]">
              <Building2 size={28} aria-hidden="true" />
            </div>

            <h3 className="mt-6 font-display text-2xl font-semibold text-white sm:text-3xl">
              Built for businesses of different sizes
            </h3>

            <p className="mt-3 text-sm leading-7 text-white/65">
              From a neighborhood salon to a multi-branch organization,
              the platform is designed to support structured service
              management.
            </p>

            <div className="mt-7 space-y-4">
              {[
                "Multiple branches and staff roles",
                "Online bookings and customer queues",
                "Queue visibility and service updates",
                "Business insights and analytics",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[#E0B957]"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-6 text-white/85">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Vision and mission */}
    <section className="border-y border-[#E6EAE4] bg-white px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#47745A]">
            What guides us
          </p>

          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[#202923] sm:text-3xl">
            Our vision and mission
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#68736B] sm:text-base">
            We want better service experiences to be accessible to
            businesses and customers alike.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7">
          <article className="rounded-2xl border border-[#E3E9E1] bg-[#F7F8F5] p-6 transition-all duration-200 hover:border-[#CFDDCF] hover:shadow-md sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6F4EA] text-[#28583D]">
              <Eye size={24} aria-hidden="true" />
            </div>

            <h3 className="mt-5 font-display text-xl font-semibold text-[#202923]">
              Our Vision
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#68736B] sm:text-base sm:leading-8">
              A future where nobody stands in an unpredictable line —
              every business, from a neighborhood salon to a hospital,
              can offer its customers a modern, transparent, real-time
              queue experience.
            </p>
          </article>

          <article className="rounded-2xl border border-[#E3E9E1] bg-[#F7F8F5] p-6 transition-all duration-200 hover:border-[#CFDDCF] hover:shadow-md sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6EED8] text-[#896A24]">
              <Target size={24} aria-hidden="true" />
            </div>

            <h3 className="mt-5 font-display text-xl font-semibold text-[#202923]">
              Our Mission
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#68736B] sm:text-base sm:leading-8">
              Give every business — regardless of size or technical
              resources — the tools to run queues and bookings
              professionally, without the cost or complexity of
              building the system themselves.
            </p>
          </article>
        </div>
      </div>
    </section>

    {/* Business benefits */}
    <section className="px-4 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#47745A]">
            For organizations
          </p>

          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[#202923] sm:text-3xl">
            Give your business better tools.
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#68736B] sm:text-base">
            Make it easier to organize customer flow, coordinate
            bookings, and understand daily service activity.
          </p>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {businessBenefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className="rounded-2xl border border-[#E3E9E1] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.025)] transition-all duration-200 hover:-translate-y-1 hover:border-[#CFDDCF] hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] sm:p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#28583D]">
                  <Icon size={23} aria-hidden="true" />
                </div>

                <h3 className="mt-5 text-base font-semibold leading-snug text-[#202923]">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#68736B]">
                  {benefit.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>

    {/* Customer benefits */}
    <section className="border-t border-[#E6EAE4] bg-white px-4 py-14 sm:py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#47745A]">
            For customers
          </p>

          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[#202923] sm:text-3xl">
            A more convenient way to access services.
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#68736B] sm:text-base sm:leading-8">
            Customers should be able to find businesses, request
            services, and stay informed without unnecessary
            complications.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#103B2B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#154D38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47745A] focus-visible:ring-offset-2"
          >
            Find an Organization
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {customerBenefits.map((benefit, index) => (
            <article
              key={benefit.title}
              className="rounded-2xl border border-[#E3E9E1] bg-[#F7F8F5] p-5 sm:p-6"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-semibold text-[#28583D] shadow-sm">
                {String(index + 1).padStart(2, "0")}
              </div>

              <h3 className="mt-4 text-base font-semibold text-[#202923]">
                {benefit.title}
              </h3>

              <p className="mt-2 text-sm leading-7 text-[#68736B]">
                {benefit.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* Call to action */}
    <section className="px-4 py-14 sm:py-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#183C2C] to-[#26372D] px-6 py-10 text-center shadow-[0_20px_50px_rgba(21,45,30,0.12)] sm:px-12 sm:py-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/[0.07]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#D9AB3F]/[0.06] blur-3xl"
        />

        <div className="relative mx-auto max-w-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-[#E0B957]">
            <ShieldCheck size={28} aria-hidden="true" />
          </div>

          <h2 className="mt-6 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
            Ready to improve your service experience?
          </h2>

          <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
            Discover organizations on our platform or submit a
            request to bring your business on board.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#103B2B] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#154D38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9AB3F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#183C2C]"
            >
              Explore Organizations
              <ArrowRight size={17} aria-hidden="true" />
            </Link>

            <Link
              to="/request-registration"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.05] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9AB3F]"
            >
              Register Your Business
            </Link>
          </div>
        </div>
      </div>
    </section>
  </main>

  <Footer />
</div>


);
}

export default AboutPage;
