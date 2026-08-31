import { Link } from "react-router-dom";
import { Search, CalendarCheck, Radio, CheckCircle2 } from "lucide-react";
const JOURNEY = [{
  icon: Search,
  label: "Find",
  detail: "an organization"
}, {
  icon: CalendarCheck,
  label: "Book",
  detail: "or join the queue"
}, {
  icon: Radio,
  label: "Track",
  detail: "your position live"
}, {
  icon: CheckCircle2,
  label: "Get served",
  detail: "at the right time"
}];
const NAV_GROUPS = [{
  title: "SmartQueue",
  links: [{
    to: "/organizations",
    label: "Find an Organization"
  }, {
    to: "/about",
    label: "About"
  }, {
    to: "/contact",
    label: "Contact"
  }]
}, {
  title: "For Organizations",
  links: [{
    to: "/request-registration",
    label: "Request Your Organization"
  }, {
    to: "/login",
    label: "Organization Login"
  }]
}, {
  title: "Customers",
  links: [{
    to: "/customer/login",
    label: "Sign In"
  }, {
    to: "/customer/register",
    label: "Create an Account"
  }, {
    to: "/support",
    label: "Support"
  }]
}];
function JourneyStep({
  step,
  isLast
}) {
  const Icon = step.icon;
  return <li className="flex items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-forest-600/10 text-forest-600 shrink-0">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-medium text-warm-ink">{step.label}</span>
          <span className="block text-xs text-warm-muted">{step.detail}</span>
        </span>
      </div>
      
      {!isLast && <span className="hidden sm:inline text-warm-border select-none" aria-hidden="true">
          →
        </span>}
    </li>;
}
function Footer() {
  const year = new Date().getFullYear();
  return <footer className="bg-warm-card border-t border-warm-border font-sans">
      
      <div className="border-b border-warm-border">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-warm-ink leading-tight max-w-2xl">
            Your time matters.
            <br />
            Don't spend it waiting.
          </h2>
          <p className="mt-4 text-warm-muted-2 max-w-2xl leading-relaxed">
            SmartQueue connects customers with the organizations they need — helping them book
            services, join queues, and know exactly when it's their turn.
          </p>

          <ul className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-5">
            {JOURNEY.map((step, i) => <JourneyStep key={step.label} step={step} isLast={i === JOURNEY.length - 1} />)}
          </ul>
        </div>
      </div>

      
      <div className="border-b border-warm-border bg-warm-bg">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="font-display text-xl font-semibold text-warm-ink">
              Have a business with long queues?
            </p>
            <p className="mt-1 text-sm text-warm-muted-2">
              Give your customers a smarter way to wait.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to="/request-registration" className="rounded-md bg-forest-600 text-white px-5 py-2.5 text-sm font-medium text-center hover:bg-forest-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 focus-visible:ring-offset-2">
              Request Your Organization
            </Link>
            <Link to="/organizations" className="rounded-md border border-warm-border text-warm-ink px-5 py-2.5 text-sm font-medium text-center hover:bg-warm-card transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 focus-visible:ring-offset-2">
              Find an Organization
            </Link>
          </div>
        </div>
      </div>

      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="font-display text-lg font-semibold text-warm-ink">SmartQueue</p>
            <p className="mt-2 text-sm text-warm-muted-2 leading-relaxed">
              Universal Smart Queue &amp; Booking Management System.
            </p>
            <p className="mt-4 text-sm text-warm-muted leading-relaxed">
              Built to make waiting simpler — connecting people and organizations through smarter
              queues and bookings.
            </p>
          </div>

          {NAV_GROUPS.map(group => <nav key={group.title} aria-label={group.title}>
              <h3 className="text-xs font-semibold tracking-wide uppercase text-warm-muted">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.links.map(link => <li key={link.to + link.label}>
                    <Link to={link.to} className="text-sm text-warm-muted-2 hover:text-forest-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-400 rounded">
                      {link.label}
                    </Link>
                  </li>)}
              </ul>
            </nav>)}
        </div>
      </div>

      <div className="border-t border-warm-border">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <p className="text-xs text-warm-muted">
            © {year} Universal Smart Queue &amp; Booking Management System
          </p>
        </div>
      </div>
    </footer>;
}
export default Footer;