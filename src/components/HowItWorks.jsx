import { Search, CalendarCheck, Radio, CheckCircle2 } from "lucide-react";
const STEPS = [{
  num: "01",
  icon: Search,
  title: "Find",
  text: "Search for the hospital, bank, salon or office you need — no account required to browse."
}, {
  num: "02",
  icon: CalendarCheck,
  title: "Book",
  text: "Pick a service, then book an appointment or join the queue right away."
}, {
  num: "03",
  icon: Radio,
  title: "Track",
  text: "Follow your position and estimated wait from your phone as the queue moves."
}, {
  num: "04",
  icon: CheckCircle2,
  title: "Get served",
  text: "Turn up when it's nearly your turn instead of waiting around for hours."
}];
function HowItWorks() {
  return <section className="border-t border-warm-border" aria-labelledby="how-heading">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 id="how-heading" className="font-display text-2xl sm:text-3xl font-semibold text-warm-ink">
          How SmartQueue works
        </h2>
        <p className="mt-3 text-warm-muted-2 max-w-2xl">
          Four steps between deciding you need something and actually being served.
        </p>

        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({
          num,
          icon: Icon,
          title,
          text
        }) => <li key={num}>
              
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-semibold text-gold-600">{num}</span>
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-forest-600/10 text-forest-600">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-warm-ink">{title}</h3>
              <p className="mt-2 text-sm text-warm-muted-2 leading-relaxed">{text}</p>
            </li>)}
        </ol>
      </div>
    </section>;
}
export default HowItWorks;