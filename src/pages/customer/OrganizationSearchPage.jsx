import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Building2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { searchOrganizations } from "../../api/publicOrg";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import useDocumentTitle from "../../hooks/useDocumentTitle";

function OrganizationSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("search") || "";
  const categoryId = searchParams.get("categoryId") || "";

  const [search, setSearch] = useState(query);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resultsSectionRef = useRef(null);
  const shouldScrollToResultsRef = useRef(false);

  useDocumentTitle(
    categoryId
      ? "Organizations by Category"
      : query
        ? `Search: ${query}`
        : "Find a Business"
  );

  // Scroll directly to the organization directory.
  const scrollToResults = useCallback(() => {
    const section = resultsSectionRef.current;

    if (!section) return;

    const navbarOffset = 100;
    const sectionTop =
      section.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: Math.max(0, sectionTop - navbarOffset),
      behavior: "smooth",
    });
  }, []);

  // Fetch organizations using both the search term and category ID.
  const runSearch = useCallback(async (term, selectedCategoryId = "") => {
    setLoading(true);
    setError(null);

    try {
      const data = await searchOrganizations(term, {
        ...(selectedCategoryId
          ? { categoryId: selectedCategoryId }
          : {}),
      });

      setOrganizations(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrganizations([]);

      setError(
        err.response?.data?.error ||
          "We couldn't load organizations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Synchronize the input and fetch results whenever the URL changes.
  // This also restores the selected category after a page refresh.
  useEffect(() => {
    setSearch(query);

    shouldScrollToResultsRef.current = true;

    runSearch(query, categoryId);
  }, [query, categoryId, runSearch]);

  // Scroll after the results have finished loading.
  useEffect(() => {
    if (loading || !shouldScrollToResultsRef.current) {
      return;
    }

    let secondFrame;

    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        scrollToResults();
        shouldScrollToResultsRef.current = false;
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);

      if (secondFrame !== undefined) {
        cancelAnimationFrame(secondFrame);
      }
    };
  }, [loading, organizations, error, scrollToResults]);

  // Submit a search without losing the selected category.
  function handleSubmit(event) {
    event.preventDefault();

    const term = search.trim();

    const params = new URLSearchParams();

    if (term) {
      params.set("search", term);
    }

    if (categoryId) {
      params.set("categoryId", categoryId);
    }

    // Also scroll when submitting the same search again.
    shouldScrollToResultsRef.current = true;

    const nextParams = params.toString();
    const currentParams = searchParams.toString();

    if (nextParams === currentParams) {
      runSearch(term, categoryId);
      return;
    }

    setSearchParams(params);
  }

  // Clear the text search while retaining the selected category.
  function handleClearSearch() {
    setSearch("");

    const params = new URLSearchParams();

    if (categoryId) {
      params.set("categoryId", categoryId);
    }

    shouldScrollToResultsRef.current = true;
    setSearchParams(params);
  }

  // Retry the current search and category.
  function handleRetry() {
    shouldScrollToResultsRef.current = true;
    runSearch(query, categoryId);
  }

  const features = [
    {
      title: "Easy Booking",
      description: "Book at your convenience",
    },
    {
      title: "Queue Updates",
      description: "Stay informed about your turn",
    },
    {
      title: "Less Waiting",
      description: "Make better use of your time",
    },
  ];

  return (
    <>
      <Navbar />

      <main>
        {/* Premium dark hero */}
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#151C19] via-[#1C2923] to-[#26372D] px-4 py-16 sm:py-20 lg:py-24">
          {/* Decorative rings */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/[0.06] sm:h-96 sm:w-96"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full border border-[#D9AB3F]/10 sm:h-72 sm:w-72"
          />

          {/* Soft gold glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#D9AB3F]/[0.035] blur-3xl"
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium tracking-wide text-[#E8D5A4] sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-[#D9AB3F]" />
              Discover services near you
            </span>

            <h1 className="mx-auto mt-7 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
              Find the Right Service.
              <span className="mt-2 block text-[#E0B957]">
                Make Time for What Matters.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
              Discover organizations, book appointments, and join queues
              without unnecessary waiting. Your time deserves better.
            </p>

            {/* Organization search */}
            <form
              onSubmit={handleSubmit}
              role="search"
              className="mx-auto mt-9 max-w-3xl"
            >
              <label
                htmlFor="organization-search"
                className="sr-only"
              >
                Search organizations
              </label>

              <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white p-3 shadow-[0_24px_70px_rgba(0,0,0,0.25)] sm:flex-row sm:items-center sm:rounded-full sm:py-3 sm:pl-6 sm:pr-3">
                <div className="flex min-w-0 flex-1 items-center gap-3 px-2 sm:px-0">
                  <Search
                    size={22}
                    aria-hidden="true"
                    className="shrink-0 text-[#52695B]"
                  />

                  <input
                    id="organization-search"
                    type="search"
                    placeholder="Search pharmacies, hospitals, salons..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent py-3 text-sm text-[#1F2923] outline-none placeholder:text-[#969C96] focus:ring-0 sm:text-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="hero-search-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#103B2B] px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#154D38] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9AB3F] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                >
                  <Search size={17} aria-hidden="true" />
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>

              <p className="mt-4 text-xs text-white/60 sm:text-sm">
                Search by organization name or the type of service you need.
              </p>
            </form>

            {/* Feature highlights */}
            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-4 text-center transition-colors duration-200 hover:bg-white/[0.08] motion-reduce:transition-none"
                >
                  <h2 className="text-sm font-semibold text-[#E0B957]">
                    {feature.title}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-white/65">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Organization directory */}
        <section
          ref={resultsSectionRef}
          className="relative isolate scroll-mt-24 overflow-hidden border-t border-[#E6EAE4] bg-[#F7F8F5] px-4 py-12 sm:py-16"
          aria-labelledby="search-results-heading"
        >
          {/* Subtle background accents */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-36 left-1/2 -z-10 h-72 w-[38rem] max-w-full -translate-x-1/2 rounded-full bg-[#DDE9DE]/50 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-72 -z-10 h-64 w-64 rounded-full bg-[#E8E3D3]/30 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl">
            {/* Directory heading */}
            <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#47745A]">
                  Organization directory
                </p>

                <h2
                  id="search-results-heading"
                  className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#202923] sm:text-3xl"
                >
                  {query
                    ? "Search results"
                    : categoryId
                      ? "Organizations in this category"
                      : "Explore organizations"}
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#68736B]">
                  {query
                    ? `Organizations matching "${query}"${categoryId ? " in the selected category" : ""}`
                    : categoryId
                      ? "Browse organizations registered under the selected business category."
                      : "Find an organization and explore its available services."}
                </p>
              </div>

              {!loading && !error && organizations.length > 0 && (
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D7E6D9] bg-white/90 px-4 py-2 text-xs font-semibold text-[#28583D] shadow-sm">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[#3B8055]"
                  />

                  {organizations.length}{" "}
                  {organizations.length === 1
                    ? "organization"
                    : "organizations"}
                </span>
              )}
            </div>

            {/* Error state */}
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8"
              >
                <h3 className="font-semibold text-red-800">
                  Something went wrong
                </h3>

                <p className="mt-2 text-sm leading-6 text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-800 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <RefreshCw size={16} aria-hidden="true" />
                  Try again
                </button>
              </div>
            )}

            {/* Loading state */}
            {loading && !error && (
              <div
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                role="status"
                aria-label="Loading organizations"
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-[#E6F4EA]" />

                      <div className="flex-1 space-y-3 pt-1">
                        <div className="h-4 w-3/4 rounded bg-[#E5E7EB]" />
                        <div className="h-3 w-1/2 rounded bg-[#EEF0EC]" />
                      </div>
                    </div>

                    <div className="mt-6 h-3 w-full rounded bg-[#EEF0EC]" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-[#EEF0EC]" />
                  </div>
                ))}

                <span className="sr-only">
                  Loading organizations...
                </span>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && organizations.length === 0 && (
              <div className="mx-auto max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center shadow-[0_4px_18px_rgba(0,0,0,0.035)] sm:px-10 sm:py-14">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6F4EA] text-[#28583D]">
                  <Building2 size={30} aria-hidden="true" />
                </div>

                <h3 className="mt-6 font-display text-xl font-semibold text-[#202923] sm:text-2xl">
                  {query
                    ? "We couldn't find that organization"
                    : categoryId
                      ? "No organizations in this category yet"
                      : "Your next service starts here"}
                </h3>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#68736B]">
                  {query
                    ? "Try another search term, or help us bring your preferred organization onto the platform."
                    : categoryId
                      ? "There are no organizations registered under this category yet. You can explore all organizations or request registration for one you'd like to see here."
                      : "There are no organizations to display right now. You can request registration for an organization you'd like to see here."}
                </p>

                {(query || categoryId) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      shouldScrollToResultsRef.current = true;
                      setSearchParams({});
                    }}
                    className="mt-5 rounded-full border border-[#D8DFD8] px-5 py-2.5 text-sm font-semibold text-[#344239] transition-colors hover:bg-[#F2F6F1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28583D]"
                  >
                    Browse all organizations
                  </button>
                )}

                <div>
                  <Link
                    to="/request-registration"
                    className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#103B2B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#154D38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28583D] focus-visible:ring-offset-2"
                  >
                    Request Organization Registration
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}

            {/* Organization cards */}
            {!loading && !error && organizations.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org) => (
                  <Link
                    key={org.id}
                    to={`/book/${org.slug}`}
                    className="org-card group flex min-h-52 flex-col rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D1DDD2] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28583D] focus-visible:ring-offset-2 sm:p-6 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <div className="flex items-start gap-4">
                      {/* Organization icon */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EA] text-[#28583D] transition-colors duration-200 group-hover:bg-[#103B2B] group-hover:text-white">
                        <Building2 size={23} aria-hidden="true" />
                      </div>

                      {/* Organization details */}
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words font-display text-lg font-semibold leading-snug text-[#202923] transition-colors group-hover:text-[#28583D]">
                          {org.name}
                        </h3>

                        {org.businessType?.name && (
                          <span className="category-badge mt-2 inline-flex max-w-full rounded-full bg-[#E6F4EA] px-2.5 py-1 text-xs font-semibold text-[#103B2B]">
                            {org.businessType.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#EEF0EC] pt-5">
                      <span className="text-sm font-medium text-[#68736B] transition-colors group-hover:text-[#344239]">
                        Explore organization
                      </span>

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F0F5F0] text-[#28583D] transition-all duration-200 group-hover:bg-[#103B2B] group-hover:text-white">
                        <ArrowRight size={17} aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Registration callout */}
            {!loading && !error && organizations.length > 0 && (
              <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-[#DCE8DC] bg-white/80 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#202923]">
                    Don't see the organization you need?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[#68736B]">
                    Request registration and help bring more services onto
                    the platform.
                  </p>
                </div>

                <Link
                  to="/request-registration"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#103B2B] bg-white px-5 py-3 text-sm font-semibold text-[#103B2B] transition-colors hover:bg-[#103B2B] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28583D] focus-visible:ring-offset-2"
                >
                  Request Registration
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default OrganizationSearchPage;

