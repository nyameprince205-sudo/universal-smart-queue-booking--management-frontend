
import {
  Search,
  CalendarCheck,
  Radio,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Find",
    text: "Search for the hospital, bank, salon or office you need — no account required to browse.",
    footer: "Discover services",
  },
  {
    icon: CalendarCheck,
    title: "Book",
    text: "Choose a service, then book an appointment or join the queue right away.",
    footer: "Choose your service",
  },
  {
    icon: Radio,
    title: "Track",
    text: "Follow your queue position and estimated wait from your phone as the queue moves.",
    footer: "Stay up to date",
  },
  {
    icon: CheckCircle2,
    title: "Get served",
    text: "Arrive when your turn is approaching instead of waiting around for hours.",
    footer: "Enjoy a smoother visit",
  },
];

const CARD_INTERACTION =
  "touch-manipulation transition-[transform,box-shadow,border-color] duration-200 ease-out active:scale-[0.97] active:shadow-md [@media(hover:hover)]:hover:scale-[0.97] [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:shadow-lg motion-reduce:transition-none";

function HowItWorks() {
  return (
    <section
      className="relative overflow-hidden border-t border-stone-200 bg-stone-50/70"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">

        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="how-heading"
            className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl"
          >
            How{" "}
            <span className="text-emerald-800">SmartQueue</span>{" "}
            works
          </h2>

          <p className="mt-4 text-base leading-7 text-stone-600 sm:text-lg">
            Four simple steps to spend less time waiting and more time doing
            what matters.
          </p>
        </div>

        {/* Information cards */}
        <ol
          className="
            relative mt-10
            flex snap-x snap-mandatory gap-4
            overflow-x-auto overscroll-x-contain
            scroll-smooth touch-pan-x
            pb-5
            [-webkit-overflow-scrolling:touch]
            sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-6
            sm:overflow-visible sm:pb-0
            lg:mt-16 lg:grid-cols-4 lg:gap-5
          "
          aria-label="Four steps explaining how SmartQueue works. Swipe horizontally on mobile."
        >
          {STEPS.map(({ icon: Icon, title, text, footer }, index) => (
            <li
              key={title}
              className="relative flex w-[82vw] max-w-[20rem] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink"
            >
              {/* Connecting line on desktop */}
              {index < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute left-[calc(50%+2rem)] right-[-1.25rem] top-9 hidden h-px bg-gradient-to-r from-emerald-200 to-amber-200 lg:block"
                />
              )}

              {/* Information card */}
              <article
                className={`group relative flex w-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:border-emerald-200 sm:p-7 ${CARD_INTERACTION}`}
              >
                {/* Step number and icon */}
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-800">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 transition-colors duration-200 group-hover:bg-emerald-800 group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="mt-7 text-xl font-bold tracking-tight text-stone-900">
                  {title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">
                  {text}
                </p>

                {/* Descriptive footer */}
                <div className="mt-6 flex items-center gap-2 border-t border-stone-100 pt-4">
                  <span className="text-xs font-medium text-stone-500">
                    {footer}
                  </span>

                  {index < STEPS.length - 1 && (
                    <ArrowRight
                      className="ml-auto h-4 w-4 text-stone-300 transition group-hover:translate-x-1 group-hover:text-emerald-700"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </article>
            </li>
          ))}
        </ol>

        {/* Mobile swipe hint */}
        <p className="mt-2 text-center text-xs text-stone-400 sm:hidden">
          Swipe left to explore all four steps →
        </p>

        {/* Closing message */}
        <div className="mt-10 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
          <CheckCircle2
            className="h-5 w-5 text-emerald-700"
            aria-hidden="true"
          />

          <p className="text-sm text-stone-600">
            Browse first. Book when you're ready. Track your turn with ease.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;

