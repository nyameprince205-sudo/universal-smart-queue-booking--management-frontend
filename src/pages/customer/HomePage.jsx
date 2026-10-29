import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
Search,
ArrowRight,
CalendarCheck,
Clock3,
Building2,
HeartPulse,
Pill,
Scissors,
Utensils,
Landmark,
Sparkles,
CheckCircle2,
ShieldCheck,
Smartphone,
} from "lucide-react";

import { searchOrganizations } from "../../api/publicOrg";
import { listMyBookings } from "../../api/myBookings";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import PlatformQueueStats from "../../components/PlatformQueueStats";
import HowItWorks from "../../components/HowItWorks";
import Footer from "../../components/Footer";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useCustomerBookingUpdates from "../../hooks/useCustomerBookingUpdates";
import { formatBookingTime } from "../../utils/formatBookingTime";

const STATUS_LABELS = {
pending: "Pending",
confirmed: "Confirmed",
checked_in: "Checked in",
completed: "Completed",
cancelled: "Cancelled",
no_show: "No show",
};

const HERO_IMAGE =
"https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85";

const CATEGORIES = [
{
name: "Hospitals & Clinics",
description: "Spend less time waiting for care.",
icon: HeartPulse,
image:
"https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=700&q=80",
search: "hospital",
},
{
name: "Pharmacies",
description: "Find a pharmacy and plan your visit.",
icon: Pill,
image:
"https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=700&q=80",
search: "pharmacy",
},
{
name: "Restaurants",
description: "Make a booking before you arrive.",
icon: Utensils,
image:
"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=700&q=80",
search: "restaurant",
},
{
name: "Salons & Beauty",
description: "Book your next appointment.",
icon: Scissors,
image:
"https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80",
search: "salon",
},
{
name: "Banks & Finance",
description: "Plan your visit and save time.",
icon: Landmark,
image:
"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=700&q=80",
search: "bank",
},
{
name: "Other Services",
description: "Discover services in one place.",
icon: Building2,
image:
"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=700&q=80",
search: "",
},
];

function RecentBookings({ profile }) {
const [bookings, setBookings] = useState(null);

const load = useCallback(() => {
listMyBookings()
.then((data) => setBookings(data.slice(0, 5)))
.catch(() => setBookings([]));
}, []);

useEffect(() => {
load();
}, [load]);

useCustomerBookingUpdates(load);

return ( <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6"> <div className="rounded-2xl border border-warm-border bg-warm-card p-5 shadow-sm sm:p-6"> <div className="flex flex-wrap items-center justify-between gap-3"> <div> <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-600">
Your account </p> <h2 className="mt-1 font-display text-xl font-semibold text-warm-ink">
Welcome back{profile?.name ? `, ${profile.name}` : ""} </h2> <p className="mt-1 text-sm text-warm-muted">
Keep track of your recent bookings. </p> </div>


      <Link
        to="/my-bookings"
        className="inline-flex items-center gap-2 rounded-lg border border-warm-border px-4 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-warm-bg"
      >
        View bookings <ArrowRight className="h-4 w-4" />
      </Link>
    </div>

    {bookings === null && (
      <p className="mt-5 text-sm text-warm-muted">Loading your bookings…</p>
    )}

    {bookings?.length === 0 && (
      <div className="mt-5 rounded-xl bg-warm-bg p-4">
        <p className="text-sm text-warm-muted">
          You haven’t made any bookings yet. Find a business below to get
          started.
        </p>
        <Link
          to="/organizations"
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-forest-700 hover:underline"
        >
          Find a business <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )}

    {bookings && bookings.length > 0 && (
      <div className="mt-5 divide-y divide-warm-border">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-warm-ink">
                {booking.organization?.name}
              </p>
              <p className="mt-1 text-xs text-warm-muted">
                {booking.service?.name} ·{" "}
                {new Date(booking.bookingDate).toLocaleDateString()} at{" "}
                {formatBookingTime(booking.bookingTime)}
              </p>
            </div>

            <span className="rounded-full bg-warm-bg px-3 py-1.5 text-xs font-semibold text-forest-700">
              {STATUS_LABELS[booking.status] || booking.status}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
</div>


);
}

function SectionHeading({ eyebrow, title, description }) {
return ( <div className="mx-auto max-w-2xl text-center"> <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
{eyebrow} </p> <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-warm-ink sm:text-3xl">
{title} </h2>
{description && ( <p className="mt-3 text-sm leading-7 text-warm-muted sm:text-base">
{description} </p>
)} </div>
);
}

function HomePage() {
useDocumentTitle("Find a Business Near You");

const navigate = useNavigate();
const { isAuthenticated, authType, profile } = useAuth();

const isLoggedInCustomer =
isAuthenticated && authType === "customer";

const [searchTerm, setSearchTerm] = useState("");
const [popularOrgs, setPopularOrgs] = useState([]);
const [loadingPopular, setLoadingPopular] = useState(true);

useEffect(() => {
searchOrganizations("")
.then((data) => {
setPopularOrgs(Array.isArray(data) ? data.slice(0, 6) : []);
})
.catch(() => setPopularOrgs([]))
.finally(() => setLoadingPopular(false));
}, []);

function handleSearch(event) {
event.preventDefault();


const query = searchTerm.trim();

navigate(
  query
    ? `/organizations?search=${encodeURIComponent(query)}`
    : "/organizations"
);


}

function handleCategorySearch(query) {
navigate(
query
? `/organizations?search=${encodeURIComponent(query)}`
: "/organizations"
);
}

return ( <div className="min-h-screen overflow-hidden bg-warm-bg font-sans text-warm-ink"> <Navbar />


  {isLoggedInCustomer && <RecentBookings profile={profile} />}

  {/* HERO */}
  <section className="relative px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
    <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-14">
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-forest-600/15 bg-white/70 px-3.5 py-2 text-xs font-semibold text-forest-700 shadow-sm sm:text-sm">
          <Sparkles className="h-4 w-4" />
          A simpler way to plan your visits
        </div>

        <h1 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-[1.12] tracking-tight text-warm-ink sm:text-5xl lg:text-6xl">
          Less waiting.
          <span className="block text-forest-600">
            More living.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-base leading-7 text-warm-muted sm:text-lg sm:leading-8">
          Find businesses, book appointments, and join queues from one
          place. Plan ahead and spend less time wondering when it will be
          your turn.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-8 flex flex-col gap-2 rounded-2xl border border-warm-border bg-warm-card p-2 shadow-lg shadow-black/[0.04] sm:flex-row"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
            <Search className="h-5 w-5 shrink-0 text-forest-600" />
            <input
              type="text"
              placeholder="What business are you looking for?"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search businesses"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-warm-ink outline-none placeholder:text-warm-muted"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-forest-400 focus:ring-offset-2"
          >
            Find a business <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-warm-muted sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-forest-600" />
            Browse without an account
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-forest-600" />
            Your time matters
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/organizations")}
            className="rounded-xl bg-warm-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            Explore businesses
          </button>

          <Link
            to="/request-registration"
            className="inline-flex items-center gap-2 rounded-xl border border-warm-border bg-warm-card px-5 py-3 text-sm font-semibold text-warm-ink transition hover:border-forest-600 hover:text-forest-700"
          >
            Register your business <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Hero photograph */}
      <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
        <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-gold-600/15 blur-2xl sm:h-48 sm:w-48" />

        <div className="relative overflow-hidden rounded-[2rem] border border-white shadow-2xl shadow-forest-900/10">
          <img
            src={HERO_IMAGE}
            alt="People collaborating in a modern business environment"
            fetchPriority="high"
            className="h-[320px] w-full object-cover sm:h-[430px] lg:h-[510px]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
              Your next visit, made easier
            </p>
            <h2 className="mt-2 max-w-sm font-display text-2xl font-semibold leading-tight sm:text-3xl">
              Make time for what matters.
            </h2>
          </div>
        </div>

        <div className="absolute -bottom-5 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-3 rounded-2xl border border-warm-border bg-warm-card p-3.5 shadow-xl sm:-left-5 sm:bottom-8 sm:max-w-xs sm:p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-600/10 text-forest-700">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-warm-ink">
              Plan ahead
            </p>
            <p className="mt-0.5 text-xs leading-5 text-warm-muted">
              Find a service and arrange your visit.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="mx-auto mt-20 max-w-7xl sm:mt-24">
      <PlatformQueueStats />
    </div>
  </section>

  {/* CATEGORIES */}
  <section className="border-y border-warm-border/70 bg-white/60 px-4 py-16 sm:px-6 sm:py-20">
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="Explore by category"
        title="Where do you need to go?"
        description="Start with the type of service you need and discover businesses you can visit, book, or join in the queue."
      />

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;

          return (
            <button
              type="button"
              key={category.name}
              onClick={() => handleCategorySearch(category.search)}
              className="group overflow-hidden rounded-2xl border border-warm-border bg-warm-card text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-forest-400"
            >
              <div className="relative h-48 overflow-hidden sm:h-52">
                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-forest-700 shadow-md">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {category.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 p-4">
                <p className="text-sm leading-6 text-warm-muted">
                  {category.description}
                </p>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-warm-border text-forest-700 transition group-hover:border-forest-600 group-hover:bg-forest-600 group-hover:text-white">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  </section>

  {/* BUSINESSES */}
  <section className="px-4 py-16 sm:px-6 sm:py-20">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
            Discover
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-warm-ink sm:text-3xl">
            Businesses on the platform
          </h2>
          <p className="mt-3 text-sm leading-7 text-warm-muted sm:text-base">
            Explore available businesses and find a convenient way to plan
            your next visit.
          </p>
        </div>

        <Link
          to="/organizations"
          className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-semibold text-forest-700 transition hover:text-forest-600"
        >
          Browse all businesses <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loadingPopular && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl border border-warm-border bg-warm-card"
            />
          ))}
        </div>
      )}

      {!loadingPopular && popularOrgs.length > 0 && (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popularOrgs.map((org) => (
            <Link
              key={org.id}
              to={`/book/${org.slug}`}
              className="group flex min-h-36 items-center gap-4 rounded-2xl border border-warm-border bg-warm-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-forest-600/30 hover:shadow-lg"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest-600/10 text-forest-700">
                <Building2 className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-base font-semibold text-warm-ink group-hover:text-forest-700">
                  {org.name}
                </h3>
                <p className="mt-1 text-sm text-warm-muted">
                  {[org.city, org.region].filter(Boolean).join(", ") ||
                    "Business on the platform"}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700">
                  View business <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loadingPopular && popularOrgs.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-warm-border bg-warm-card px-5 py-10 text-center">
          <Building2 className="mx-auto h-9 w-9 text-warm-muted" />
          <h3 className="mt-4 font-display text-lg font-semibold text-warm-ink">
            Find your next destination
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-warm-muted">
            Browse the directory to search for a business or service.
          </p>
          <Link
            to="/organizations"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-forest-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-forest-700"
          >
            Explore businesses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  </section>

  {/* HOW IT WORKS */}
  <section className="border-y border-warm-border/70 bg-white/60 px-4 py-16 sm:px-6 sm:py-20">
    <div className="mx-auto max-w-7xl">
      <SectionHeading
        eyebrow="Simple by design"
        title="Your visit, in three steps"
        description="A straightforward experience from finding a service to managing your visit."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          {
            number: "01",
            icon: Search,
            title: "Find a business",
            description:
              "Search for a business or browse categories to find the service you need.",
          },
          {
            number: "02",
            icon: CalendarCheck,
            title: "Book or join a queue",
            description:
              "Choose an available service and follow the steps provided by the business.",
          },
          {
            number: "03",
            icon: Clock3,
            title: "Keep track of your visit",
            description:
              "Use the available booking or queue information to stay informed.",
          },
        ].map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.number}
              className="rounded-2xl border border-warm-border bg-warm-card p-6 sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold tracking-[0.15em] text-forest-600">
                  STEP {step.number}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-600/10 text-forest-700">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold text-warm-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-warm-muted">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>

  {/* EXISTING HOW IT WORKS COMPONENT */}
  <HowItWorks />

  {/* PRODUCT BENEFITS */}
  <section className="px-4 py-16 sm:px-6 sm:py-20">
    <div className="mx-auto grid max-w-7xl items-center gap-10 rounded-[2rem] bg-forest-900 px-6 py-10 text-white sm:px-10 sm:py-14 lg:grid-cols-2 lg:gap-14">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">
          Built for easier visits
        </p>
        <h2 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          Your time is valuable. Make every visit count.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
          Whether you are arranging a service or running a business, a
          clearer booking and queue process can help everyone plan better.
        </p>

        <div className="mt-7 space-y-4">
          {[
            "Find participating businesses in one place",
            "Make bookings through supported services",
            "Help businesses organize queues and customer visits",
          ].map((benefit) => (
            <div key={benefit} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
              <p className="text-sm leading-6 text-white/90">{benefit}</p>
            </div>
          ))}
        </div>

        <Link
          to="/organizations"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gold-600 px-5 py-3 text-sm font-bold text-warm-ink transition hover:brightness-105"
        >
          Get started <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative">
        <div className="absolute -inset-3 rounded-[2rem] bg-white/5 blur-xl" />
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-5 sm:p-7">
          <div className="flex items-center gap-3 border-b border-white/15 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-600 text-warm-ink">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">A simpler customer journey</p>
              <p className="mt-1 text-xs text-white/60">
                Search. Book. Stay informed.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              {
                icon: Search,
                title: "Find a service",
                detail: "Discover a business that meets your needs.",
              },
              {
                icon: CalendarCheck,
                title: "Plan your visit",
                detail: "Follow the booking options offered.",
              },
              {
                icon: Clock3,
                title: "Know what comes next",
                detail: "Check the status of your booking or queue.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-4"
                >
                  <Icon className="h-5 w-5 shrink-0 text-gold-600" />
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/65">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* BUSINESS REGISTRATION CTA */}
  <section className="px-4 pb-16 sm:px-6 sm:pb-20">
    <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl border border-warm-border bg-warm-card p-6 shadow-sm sm:flex-row sm:items-center sm:p-9">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">
          For business owners
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-warm-ink sm:text-3xl">
          Ready to organize your bookings and queues?
        </h2>
        <p className="mt-3 text-sm leading-7 text-warm-muted sm:text-base">
          Request to register your business and explore a better way to
          manage customer visits.
        </p>
      </div>

      <Link
        to="/request-registration"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-forest-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-forest-700"
      >
        Register your business <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </section>

  <Footer />
</div>


);
}

export default HomePage;
