import { Radio, Clock, Users, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";

const AHEAD = ["A-018", "A-019", "A-020", "A-021", "A-022", "A-023"];

const FEATURES = [
{
icon: Users,
title: "Know your position",
text: "See how many people are ahead of you in the queue.",
},
{
icon: Clock,
title: "Track your waiting time",
text: "View an estimated wait time as the queue progresses.",
},
{
icon: Radio,
title: "Track from anywhere",
text: "Open your ticket link on your phone. No account required.",
},
];

function QueueTicketPreview() {
return ( <section
   className="relative mt-16 overflow-hidden text-left"
   aria-labelledby="preview-heading"
 > <div className="absolute inset-0 -z-10 rounded-[2rem] bg-emerald-50/60" />


  <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm sm:p-10 lg:p-12">
    {/* Decorative background */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl"
    />
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl"
    />

    <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
      {/* Feature information */}
      <div className="max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
          </span>

          <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
            Live queue tracking
          </span>
        </div>

        <h2
          id="preview-heading"
          className="mt-5 font-display text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
        >
          Your time matters.
          <span className="mt-1 block text-emerald-700">
            Know when it’s your turn.
          </span>
        </h2>

        <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
          Join a queue and follow your progress from your phone. Spend less
          time waiting and more time doing what matters.
        </p>

        <div className="mt-8 space-y-5">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>

              <div className="pt-0.5">
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Less uncertainty. Better queue experiences.
        </div>
      </div>

      {/* Sample ticket */}
      <div
        role="img"
        aria-label="Illustrative queue ticket A-024. Ticket A-017 is being served, seven people are ahead, and the estimated wait is 32 minutes."
        className="mx-auto w-full max-w-md"
      >
        <div className="relative">
          {/* Card shadow */}
          <div
            aria-hidden="true"
            className="absolute inset-3 translate-y-3 rounded-[2rem] bg-emerald-900/10 blur-xl"
          />

          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950 shadow-2xl">
            {/* Ticket header */}
            <div className="relative overflow-hidden bg-emerald-800 px-6 pb-7 pt-6 sm:px-8 sm:pt-8">
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-16 h-48 w-48 rounded-full border-[28px] border-white/5"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-16 right-24 h-36 w-36 rounded-full bg-emerald-500/20 blur-2xl"
              />

              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/80">
                    Your queue ticket
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    Keep this number handy
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-emerald-50">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                  Waiting
                </span>
              </div>

              <div className="relative mt-7 flex items-end justify-between gap-3">
                <p className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
                  A-024
                </p>

                <div className="mb-1 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-amber-200">
                    Ticket status
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-amber-100">
                    In queue
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket metrics */}
            <div className="px-6 pt-6 sm:px-8">
              <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] py-4">
                <div className="px-2 text-center">
                  <p className="text-[11px] font-medium text-slate-400 sm:text-xs">
                    Now serving
                  </p>
                  <p className="mt-2 font-display text-xl font-bold text-amber-400 sm:text-2xl">
                    A-017
                  </p>
                </div>

                <div className="px-2 text-center">
                  <p className="text-[11px] font-medium text-slate-400 sm:text-xs">
                    Ahead of you
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    7
                  </p>
                </div>

                <div className="px-2 text-center">
                  <p className="text-[11px] font-medium text-slate-400 sm:text-xs">
                    Est. wait
                  </p>
                  <p className="mt-2 font-display text-2xl font-bold text-white">
                    32m
                  </p>
                </div>
              </div>

              {/* Queue progression */}
              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-slate-300">
                    Queue progression
                  </p>
                  <p className="text-xs text-slate-500">
                    Example positions
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {AHEAD.map((number) => (
                    <span
                      key={number}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 font-mono text-[11px] text-slate-400"
                    >
                      {number}
                    </span>
                  ))}

                  <span className="rounded-lg border border-amber-300/30 bg-amber-400 px-2 py-1.5 font-mono text-[11px] font-bold text-slate-950 shadow-sm shadow-amber-400/20">
                    A-024
                  </span>
                </div>
              </div>

              {/* Branch details */}
              <div className="mt-6 border-t border-white/10 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      General Consultation
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                      Accra Central Branch
                    </p>
                  </div>

                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* Ticket footer */}
            <div className="border-t border-white/10 bg-white/[0.03] px-6 py-3.5 sm:px-8">
              <p className="text-center text-xs leading-5 text-slate-400">
                This is a sample ticket for demonstration purposes.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          Your actual position and estimated wait depend on the live queue.
        </p>
      </div>
    </div>
  </div>
</section>


);
}

export default QueueTicketPreview;
