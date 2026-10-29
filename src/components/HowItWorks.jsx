import {
Search,
CalendarCheck,
Radio,
CheckCircle2,
ArrowRight,
Sparkles,
} from "lucide-react";

const STEPS = [
{
num: "01",
icon: Search,
title: "Find",
text: "Search for the hospital, bank, salon or office you need — no account required to browse.",
},
{
num: "02",
icon: CalendarCheck,
title: "Book",
text: "Choose a service, then book an appointment or join the queue right away.",
},
{
num: "03",
icon: Radio,
title: "Track",
text: "Follow your queue position and estimated wait from your phone as the queue moves.",
},
{
num: "04",
icon: CheckCircle2,
title: "Get served",
text: "Arrive when your turn is approaching instead of waiting around for hours.",
},
];

function HowItWorks() {
return ( <section
   className="relative overflow-hidden border-t border-stone-200 bg-stone-50/70"
   aria-labelledby="how-heading"
 > <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
{/* Section heading */} <div className="mx-auto max-w-2xl text-center"> <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-800"> <Sparkles className="h-3.5 w-3.5" />
Simple by design </div>


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

    {/* Steps */}
    <ol className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-5">
      {STEPS.map(({ num, icon: Icon, title, text }, index) => (
        <li key={num} className="relative flex">
          {/* Connecting line on desktop */}
          {index < STEPS.length - 1 && (
            <div
              aria-hidden="true"
              className="absolute left-[calc(50%+2rem)] right-[-1.25rem] top-9 hidden h-px bg-gradient-to-r from-emerald-200 to-amber-200 lg:block"
            />
          )}

          <article className="group relative flex w-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5 sm:p-7">
            {/* Number and icon */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-bold tracking-widest text-amber-600">
                STEP {num}
              </span>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 transition duration-300 group-hover:bg-emerald-800 group-hover:text-white">
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

            {/* Step indicator */}
            <div className="mt-6 flex items-center gap-2 border-t border-stone-100 pt-4">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-stone-500">
                {index === 0
                  ? "Discover services"
                  : index === 1
                  ? "Choose your service"
                  : index === 2
                  ? "Stay up to date"
                  : "Enjoy a smoother visit"}
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

    {/* Closing message */}
    <div className="mt-10 flex flex-col items-center justify-center gap-2 text-center sm:flex-row">
      <CheckCircle2 className="h-5 w-5 text-emerald-700" />
      <p className="text-sm text-stone-600">
        Browse first. Book when you're ready. Track your turn with ease.
      </p>
    </div>
  </div>
</section>


);
}

export default HowItWorks;
