import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  Phone,
  MessageCircle,
  Globe,
  Link2,
  AtSign,
  Clock,
  MapPin,
  CalendarDays,
  Users,
  CheckCircle2,
  CircleAlert,
  ArrowLeft,
  ArrowRight,
  Building2,
  Mail,
  UserRound,
  NotebookPen,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Ticket,
  Clock3,
  Check,
  XCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getPublicOrganization } from "../../api/publicOrg";
import {
  createMyBooking,
  createGuestBooking,
} from "../../api/myBookings";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const inputClass =
  "mt-2 block w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:bg-stone-100";

const labelClass =
  "block text-sm font-semibold text-stone-700";

// Accept only Ghana numbers in local (0XXXXXXXXX) or international (+233XXXXXXXXX) format.
const isValidGhanaPhone = (phone) => /^(0\d{9}|\+233\d{9})$/.test(phone);

function SectionHeading({ number, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-sm font-bold text-white">
        {number}
      </span>

      <div>
        <h3 className="font-semibold text-stone-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm leading-5 text-stone-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusMessage({ type = "error", title, children }) {
  const styles = {
    error: {
      wrapper: "border-red-200 bg-red-50",
      icon: "text-red-600",
      title: "text-red-900",
      body: "text-red-800",
      Icon: CircleAlert,
    },
    success: {
      wrapper: "border-emerald-200 bg-emerald-50",
      icon: "text-emerald-700",
      title: "text-emerald-950",
      body: "text-emerald-800",
      Icon: CheckCircle2,
    },
    waitlist: {
      wrapper: "border-amber-200 bg-amber-50",
      icon: "text-amber-700",
      title: "text-amber-950",
      body: "text-amber-900",
      Icon: Clock3,
    },
  };

  const style = styles[type];
  const Icon = style.Icon;

  return (
    <div className={`rounded-2xl border p-4 ${style.wrapper}`} role="status">
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} />

        <div className="min-w-0">
          <p className={`font-semibold ${style.title}`}>{title}</p>
          {children && (
            <div className={`mt-1 text-sm leading-6 ${style.body}`}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingSuccess({ booking, bookingDate, bookingTime, isGuest }) {
  const isWaitlisted = booking.status === "waitlisted";
  const position = booking.waitlistPosition;

  if (isWaitlisted) {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
            <Clock3 className="h-8 w-8 text-amber-700" />
          </div>

          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            Waitlist registration
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
            You’re on the waitlist
          </h3>

          <p className="mt-2 text-sm text-stone-500">
            Your selected time is currently fully booked.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 shrink-0 text-amber-700" />

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-amber-800">
                Requested appointment
              </p>
              <p className="mt-1 font-semibold text-amber-950">
                {bookingDate} at {bookingTime}
              </p>
            </div>
          </div>

          {position != null && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-200 bg-white p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg font-bold text-amber-900">
                {position}
              </div>

              <div>
                <p className="font-semibold text-stone-900">
                  Your waitlist position
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {position === 1
                    ? "You’re first in line."
                    : `There ${position === 2 ? "is" : "are"} ${
                        position - 1
                      } ${
                        position - 1 === 1 ? "person" : "people"
                      } ahead of you.`}
                </p>
              </div>
            </div>
          )}

          <p className="mt-4 text-sm leading-6 text-amber-900">
            You’ve been added to the waitlist. Please follow any confirmation
            or notification instructions provided by the business.
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="font-semibold text-stone-900">What you can do next</p>

          <ul className="mt-3 space-y-3 text-sm text-stone-600">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              Try another date or time.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              Check whether another branch has availability.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              Keep your booking details available for reference.
            </li>
          </ul>
        </div>

        {isGuest ? (
          <p className="text-center text-sm leading-6 text-stone-500">
            Want to manage your bookings in one place?{" "}
            <Link
              to="/customer/register"
              className="font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-950"
            >
              Create a free account
            </Link>
            .
          </p>
        ) : (
          <Link
            to="/my-bookings"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-800"
          >
            View my bookings
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="py-3 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100">
        <CheckCircle2 className="h-10 w-10 text-emerald-800" />
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
        Booking submitted
      </p>

      <h3 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
        Booking confirmed!
      </h3>

      <p className="mt-2 text-sm leading-6 text-stone-500">
        Your booking has been successfully created.
      </p>

      <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 shrink-0 text-emerald-800" />

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-800">
              Appointment date
            </p>
            <p className="mt-1 font-semibold text-emerald-950">
              {bookingDate}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Clock className="h-5 w-5 shrink-0 text-emerald-800" />

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-800">
              Appointment time
            </p>
            <p className="mt-1 font-semibold text-emerald-950">
              {bookingTime}
            </p>
          </div>
        </div>
      </div>

      {isGuest ? (
        <p className="mt-5 text-sm leading-6 text-stone-500">
          Want to track your bookings and make future reservations faster?{" "}
          <Link
            to="/customer/register"
            className="font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-emerald-950"
          >
            Create a free account
          </Link>
          .
        </p>
      ) : (
        <Link
          to="/my-bookings"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-800"
        >
          View my bookings
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function BookingForm({ org, isGuest, onSubmit }) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [branchId, setBranchId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const availableServices = org.services.filter(
    (service) => !service.branchId || service.branchId === branchId
  );

  function handleCustomerPhoneChange(event) {
    const value = event.target.value;

    // Keep the field to digits and a possible leading plus while the user types.
    if (!/^\+?\d*$/.test(value)) return;
    if (value.length > 13) return;
    if (value.startsWith("0") && value.length > 10) return;
    if (value.startsWith("+") && value.length > 13) return;

    setCustomerPhone(value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!branchId || !serviceId || !bookingDate || !bookingTime) {
      setError("Please complete all required booking fields.");
      return;
    }

    if (isGuest && (!customerName.trim() || !customerPhone.trim())) {
      setError("Please enter your name and phone number.");
      return;
    }

    if (isGuest && !isValidGhanaPhone(customerPhone.trim())) {
      setError(
        "Enter a valid Ghana phone number: 0241234567 or +233241234567."
      );
      return;
    }

    if (Number(partySize) < 1 || !Number.isFinite(Number(partySize))) {
      setError("Party size must be at least 1.");
      return;
    }

    setSubmitting(true);

    try {
      const basePayload = {
        organizationId: org.id,
        branchId,
        serviceId,
        bookingDate,
        bookingTime,
        partySize: Number(partySize),
        notes: notes.trim() || undefined,
      };

      const payload = isGuest
        ? {
            ...basePayload,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerEmail: customerEmail.trim() || undefined,
          }
        : basePayload;

      const booking = await onSubmit(payload);
      setConfirmedBooking(booking);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "We couldn’t create this booking. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedBooking) {
    return (
      <BookingSuccess
        booking={confirmedBooking}
        bookingDate={bookingDate}
        bookingTime={bookingTime}
        isGuest={isGuest}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {error && (
        <StatusMessage type="error" title="We couldn’t complete your booking">
          {error}
        </StatusMessage>
      )}

      {isGuest && (
        <section>
          <SectionHeading
            number="01"
            title="Your details"
            description="Tell us how the business can identify and contact you."
          />

          <div className="space-y-4">
            <div>
              <label htmlFor="customerName" className={labelClass}>
                Full name <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                <input
                  id="customerName"
                  type="text"
                  autoComplete="name"
                  required
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  placeholder="Enter your full name"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="customerPhone" className={labelClass}>
                Phone number <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                <input
                  id="customerPhone"
                  type="tel"
                  autoComplete="tel"
                  required
                  placeholder="0241234567 or +233241234567"
                  value={customerPhone}
                  onChange={handleCustomerPhoneChange}
                  maxLength={13}
                  inputMode="tel"
                  className={`${inputClass} pl-10`}
                />
              </div>

              <p className="mt-1.5 text-xs leading-5 text-stone-500">
                Enter 10 digits starting with 0 (0241234567) or +233 followed by 9 digits (+233241234567).
              </p>
            </div>

            <div>
              <label htmlFor="customerEmail" className={labelClass}>
                Email address{" "}
                <span className="font-normal text-stone-400">(optional)</span>
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

                <input
                  id="customerEmail"
                  type="email"
                  autoComplete="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  placeholder="you@example.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <SectionHeading
          number={isGuest ? "02" : "01"}
          title="Choose your service"
          description="Select the branch and service you want to book."
        />

        <div className="space-y-4">
          <div>
            <label htmlFor="branchId" className={labelClass}>
              Branch <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

              <select
                id="branchId"
                required
                value={branchId}
                onChange={(event) => {
                  setBranchId(event.target.value);
                  setServiceId("");
                }}
                className={`${inputClass} appearance-none pl-10`}
              >
                <option value="">Select a branch</option>

                {org.branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="serviceId" className={labelClass}>
              Service <span className="text-red-500">*</span>
            </label>

            <select
              id="serviceId"
              required
              disabled={!branchId}
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className={inputClass}
            >
              <option value="">
                {branchId ? "Select a service" : "Choose a branch first"}
              </option>

              {availableServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                  {service.price != null && service.price !== ""
                    ? ` — GHS ${service.price}`
                    : ""}
                </option>
              ))}
            </select>

            {branchId && availableServices.length === 0 && (
              <p className="mt-2 text-sm text-amber-700">
                No services are currently listed for this branch.
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <SectionHeading
          number={isGuest ? "03" : "02"}
          title="Date and time"
          description="Choose when you would like your appointment."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bookingDate" className={labelClass}>
              Date <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

              <input
                id="bookingDate"
                type="date"
                required
                min={new Date().toLocaleDateString("en-CA")}
                value={bookingDate}
                onChange={(event) => setBookingDate(event.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="bookingTime" className={labelClass}>
              Preferred time <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

              <input
                id="bookingTime"
                type="time"
                required
                value={bookingTime}
                onChange={(event) => setBookingTime(event.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-stone-50 p-3.5">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />
          <p className="text-xs leading-5 text-stone-500">
            Your selected time is a request. Availability and confirmation
            depend on the business’s booking rules.
          </p>
        </div>
      </section>

      <section>
        <SectionHeading
          number={isGuest ? "04" : "03"}
          title="Additional information"
          description="Let the business know anything important about your booking."
        />

        <div className="space-y-4">
          <div>
            <label htmlFor="partySize" className={labelClass}>
              Party size{" "}
              <span className="font-normal text-stone-400">(if applicable)</span>
            </label>

            <div className="relative">
              <Users className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />

              <input
                id="partySize"
                type="number"
                min="1"
                step="1"
                required
                value={partySize}
                onChange={(event) => setPartySize(event.target.value)}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className={labelClass}>
              Notes{" "}
              <span className="font-normal text-stone-400">(optional)</span>
            </label>

            <div className="relative">
              <NotebookPen className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-stone-400" />

              <textarea
                id="notes"
                rows={3}
                maxLength={1000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Any special requests or information..."
                className={`${inputClass} resize-y pl-10`}
              />
            </div>

            <p className="mt-1 text-right text-xs text-stone-400">
              {notes.length}/1000
            </p>
          </div>
        </div>
      </section>

      <div className="border-t border-stone-100 pt-5">
        <button
          type="submit"
          disabled={
            submitting ||
            !org.branches.length ||
            !org.services.length
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-5 py-4 font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <>
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Creating your booking...
            </>
          ) : (
            <>
              <Ticket className="h-5 w-5" />
              Confirm booking
              <ArrowRight className="ml-auto h-4 w-4" />
            </>
          )}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs leading-5 text-stone-500">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
          Your booking details are submitted securely.
        </p>
      </div>
    </form>
  );
}

function ContactLink({ href, icon: Icon, children, external = false }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </a>
  );
}

function OrgProfile({ org }) {
  const hasAnyContact = [
    org.phone,
    org.whatsapp,
    org.website,
    org.facebook,
    org.instagram,
  ].some(Boolean);

  const websiteUrl = (value) =>
    value.startsWith("http") ? value : `https://${value}`;

  const whatsappNumber = org.whatsapp?.replace(/[^\d]/g, "");

  return (
    <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="relative bg-emerald-950 px-6 pb-7 pt-8 text-white sm:px-8">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border-[28px] border-white/5" />
        <div className="absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-emerald-800/40 blur-2xl" />

        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-emerald-100 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mt-7 flex items-start gap-4">
            {org.logoUrl ? (
              <img
                src={org.logoUrl}
                alt={`${org.name} logo`}
                className="h-16 w-16 shrink-0 rounded-2xl border border-white/20 bg-white object-cover shadow-lg sm:h-20 sm:w-20"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 sm:h-20 sm:w-20">
                <Building2 className="h-8 w-8 text-amber-300" />
              </div>
            )}

            <div className="min-w-0 pt-1">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-emerald-100">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                Official booking page
              </div>

              <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                {org.name}
              </h1>

              {org.description && (
                <p className="mt-2 max-w-lg text-sm leading-6 text-emerald-100/80">
                  {org.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        {org.openingHours && (
          <div className="flex items-start gap-3 rounded-2xl bg-stone-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="h-5 w-5 text-amber-800" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Opening hours
              </p>
              <p className="mt-1 text-sm font-medium leading-6 text-stone-800">
                {org.openingHours}
              </p>
            </div>
          </div>
        )}

        {hasAnyContact && (
          <div>
            <h2 className="text-sm font-semibold text-stone-900">
              Contact this business
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {org.phone && (
                <ContactLink
                  href={`tel:${org.phone}`}
                  icon={Phone}
                >
                  Call
                </ContactLink>
              )}

              {org.whatsapp && whatsappNumber && (
                <ContactLink
                  href={`https://wa.me/${whatsappNumber}`}
                  icon={MessageCircle}
                  external
                >
                  WhatsApp
                </ContactLink>
              )}

              {org.website && (
                <ContactLink
                  href={websiteUrl(org.website)}
                  icon={Globe}
                  external
                >
                  Website
                </ContactLink>
              )}

              {org.facebook && (
                <ContactLink
                  href={websiteUrl(org.facebook)}
                  icon={Link2}
                  external
                >
                  Facebook
                </ContactLink>
              )}

              {org.instagram && (
                <ContactLink
                  href={`https://instagram.com/${org.instagram.replace(/^@/, "")}`}
                  icon={AtSign}
                  external
                >
                  Instagram
                </ContactLink>
              )}
            </div>
          </div>
        )}

        {org.branches.length > 0 && (
          <div className="border-t border-stone-100 pt-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-stone-900">
                Our branches
              </h2>

              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
                {org.branches.length}{" "}
                {org.branches.length === 1 ? "location" : "locations"}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {org.branches.map((branch) => (
                <div
                  key={branch.id}
                  className="flex items-start gap-3 rounded-2xl border border-stone-100 p-4 transition hover:border-emerald-100 hover:bg-emerald-50/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <MapPin className="h-5 w-5 text-emerald-800" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-900">
                      {branch.name}
                    </p>

                    {branch.address && (
                      <p className="mt-1 text-sm leading-5 text-stone-500">
                        {branch.address}
                      </p>
                    )}

                    {branch.address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950"
                      >
                        Get directions
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function OrgBookingPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { isAuthenticated, authType } = useAuth();

  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useDocumentTitle(org ? `Book ${org.name}` : "Book a Service");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setNotFound(false);
    setLoadError(false);
    setOrg(null);

    getPublicOrganization(slug)
      .then((organization) => {
        if (active) setOrg(organization);
      })
      .catch((err) => {
        if (!active) return;

        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900">
            <LoaderCircle className="h-7 w-7 animate-spin text-white" />
          </div>

          <p className="mt-4 font-semibold text-stone-800">
            Loading booking page
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Getting the business details ready for you.
          </p>
        </div>
      </div>
    );
  }

  if (notFound || loadError || !org) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
            {notFound ? (
              <Building2 className="h-8 w-8 text-stone-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>

          <h1 className="mt-5 text-2xl font-bold text-stone-900">
            {notFound ? "Business not found" : "Unable to load this page"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-500">
            {notFound
              ? "This business may have changed its booking link or may no longer have a public booking page."
              : "We couldn’t retrieve the business details. Please check your connection and try again."}
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {loadError && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-900 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800"
              >
                Try again
              </button>
            )}

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 px-5 py-3 font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLoggedInCustomer =
    isAuthenticated && authType === "customer";

  const hasBranches = org.branches?.length > 0;
  const hasServices = org.services?.length > 0;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-900">
              <Ticket className="h-5 w-5 text-amber-300" />
            </div>

            <div>
              <p className="font-bold tracking-tight text-stone-900">
                Smart Queue
              </p>
              <p className="text-xs text-stone-500">
                Booking made simpler
              </p>
            </div>
          </Link>

          {isLoggedInCustomer ? (
            <Link
              to="/my-bookings"
              className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 sm:px-4"
            >
              My bookings
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              to="/customer/login"
              state={{ from: location }}
              className="rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 sm:px-4"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-900">
            <Sparkles className="h-3.5 w-3.5" />
            Book online
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
            Your time matters.
            <span className="block text-emerald-800">
              Book ahead with confidence.
            </span>
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-500 sm:text-base">
            Choose your preferred branch, service, date and time. Submit your
            booking details and follow the business’s confirmation process.
          </p>
        </div>

        {!isLoggedInCustomer && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                <UserRound className="h-5 w-5 text-emerald-800" />
              </div>

              <div>
                <p className="font-semibold text-emerald-950">
                  Booking as a guest?
                </p>
                <p className="mt-1 text-sm leading-5 text-emerald-900/75">
                  You can book without signing in. An account can make future
                  bookings and booking history easier to manage.
                </p>
              </div>
            </div>

            <Link
              to="/customer/login"
              state={{ from: location }}
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:self-center"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <div className="min-w-0">
            <OrgProfile org={org} />

            <div className="mt-5 hidden rounded-2xl border border-stone-200 bg-white p-5 sm:block">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                  <ShieldCheck className="h-5 w-5 text-amber-800" />
                </div>

                <div>
                  <h3 className="font-semibold text-stone-900">
                    A simpler way to book
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-stone-500">
                    Submit your details online instead of relying on a phone
                    call or visiting the business just to request an
                    appointment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section
            id="booking-form"
            className="min-w-0 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
          >
            <div className="border-b border-stone-100 bg-white px-5 py-6 sm:px-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                Reservation details
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
                {isLoggedInCustomer
                  ? "Book your appointment"
                  : "Let’s make your booking"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-500">
                Complete the details below. Fields marked with an asterisk
                are required.
              </p>
            </div>

            <div className="p-5 sm:p-7">
              {!hasBranches || !hasServices ? (
                <StatusMessage
                  type="waitlist"
                  title="Bookings aren’t available yet"
                >
                  {!hasBranches
                    ? "This business has not listed any branches on its public booking page yet."
                    : "This business has not listed any services on its public booking page yet."}
                  {" "}Please contact the business directly for assistance.
                </StatusMessage>
              ) : (
                <BookingForm
                  org={org}
                  isGuest={!isLoggedInCustomer}
                  onSubmit={
                    isLoggedInCustomer
                      ? createMyBooking
                      : createGuestBooking
                  }
                />
              )}
            </div>
          </section>
        </div>

        <div className="mt-10 border-t border-stone-200 pt-6 text-center">
          <p className="text-sm text-stone-500">
            Booking powered by{" "}
            <Link
              to="/"
              className="font-semibold text-emerald-800 hover:text-emerald-950"
            >
              Universal Smart Queue
            </Link>
          </p>

          <p className="mt-1 text-xs text-stone-400">
            Making queues and bookings simpler for everyone.
          </p>
        </div>
      </main>
    </div>
  );
}

export default OrgBookingPage;

