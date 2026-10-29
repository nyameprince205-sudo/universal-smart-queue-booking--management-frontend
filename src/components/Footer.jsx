import { Link } from "react-router-dom";
import {
  Search,
  CalendarCheck,
  Radio,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

const JOURNEY = [
  {
    icon: Search,
    label: "Find",
    detail: "an organization",
  },
  {
    icon: CalendarCheck,
    label: "Book",
    detail: "or join the queue",
  },
  {
    icon: Radio,
    label: "Track",
    detail: "your position live",
  },
  {
    icon: CheckCircle2,
    label: "Get served",
    detail: "at the right time",
  },
];

const NAV_GROUPS = [
  {
    title: "Explore",
    links: [
      { to: "/organizations", label: "Find an Organization" },
      { to: "/about", label: "About SmartQueue" },
      { to: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "For Organizations",
    links: [
      {
        to: "/request-registration",
        label: "Register Your Business",
      },
      { to: "/login", label: "Organization Login" },
    ],
  },
  {
    title: "For Customers",
    links: [
      { to: "/customer/login", label: "Customer Sign In" },
      { to: "/customer/register", label: "Create an Account" },
      { to: "/support", label: "Help & Support" },
    ],
  },
];

function JourneyStep({ step, isLast }) {
  const Icon = step.icon;

  return (
    <li className="flex min-w-0 items-center gap-3 sm:gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gold-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <span className="leading-tight">
        <span className="block text-sm font-semibold text-white">
          {step.label}
        </span>

        <span className="mt-1 block text-xs leading-relaxed text-white/60">
          {step.detail}
        </span>
      </span>

      {!isLast && (
        <span
          className="ml-auto hidden select-none text-gold-400/60 lg:inline"
          aria-hidden="true"
        >
          →
        </span>
      )}
    </li>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden bg-forest-900 font-sans text-white">
      {/* Customer journey */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-gold-400">
              A smarter way to wait
            </span>

            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              Your time matters.
              <br />
              <span className="text-gold-400">
                Waiting should be simpler.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
              SmartQueue connects customers with the organizations they need,
              helping them book services, join queues, and follow their
              position without unnecessary waiting.
            </p>
          </div>

          <ul className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {JOURNEY.map((step, index) => (
              <JourneyStep
                key={step.label}
                step={step}
                isLast={index === JOURNEY.length - 1}
              />
            ))}
          </ul>
        </div>
      </div>

      {/* Footer navigation */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              to="/"
              className="group inline-flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              aria-label="SmartQueue home"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 font-display text-xl font-semibold text-gold-400 ring-1 ring-white/10 transition-colors group-hover:bg-white/15">
                U
              </span>

              <span>
                <span className="block font-display text-lg font-semibold tracking-tight text-white">
                  Universal Smart Queue
                </span>
                <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">
                  Booking Management System
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              A smarter way for people and businesses to manage appointments,
              organize queues, and make better use of their time.
            </p>

            <Link
              to="/organizations"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold-400 transition-colors hover:text-gold-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              Explore organizations
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Navigation groups */}
          {NAV_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-400">
                {group.title}
              </h3>

              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={`${link.to}-${link.label}`}>
                    <Link
                      to={link.to}
                      className="inline-flex items-start text-sm leading-6 text-white/65 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="text-xs leading-5 text-white/50">
            © {year} Universal Smart Queue &amp; Booking Management System.
            All rights reserved.
          </p>

          <Link
            to="/"
            className="inline-flex w-fit items-center gap-1 text-xs font-medium text-white/60 transition-colors hover:text-gold-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            Back to home
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

