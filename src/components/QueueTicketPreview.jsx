import { Radio, Clock, Users, MapPin } from "lucide-react";
const AHEAD = ["A-018", "A-019", "A-020", "A-021", "A-022", "A-023"];
function QueueTicketPreview() {
  return <section className="mt-14 text-left" aria-labelledby="preview-heading">
      <div className="bg-warm-card rounded-xl border border-warm-border p-6 sm:p-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-forest-600">
              Live queue tracking
            </p>
            <h2 id="preview-heading" className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-warm-ink leading-tight">
              Know exactly when it's your turn.
            </h2>
            <p className="mt-3 text-warm-muted-2 leading-relaxed">
              Join a queue and follow it from your phone. Arrive when it's nearly your turn —
              not an hour early.
            </p>

            <ul className="mt-6 space-y-3">
              {[{
              icon: Users,
              text: "See how many people are ahead of you"
            }, {
              icon: Clock,
              text: "Estimated wait that updates as the queue moves"
            }, {
              icon: Radio,
              text: "No account needed — track from a link"
            }].map(({
              icon: Icon,
              text
            }) => <li key={text} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-forest-600/10 text-forest-600 shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </span>
                  <span className="text-sm text-warm-muted-2">{text}</span>
                </li>)}
            </ul>
          </div>

          
          <div role="img" aria-label="Example queue ticket: number A-024, currently serving A-017, 7 people ahead, about 32 minutes estimated wait.">
            <div className="bg-warm-ink rounded-xl p-6 sm:p-8 relative overflow-hidden">
              
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-warm-card rounded-full" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-warm-card rounded-full" />

              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-gold-600 font-medium">
                  Your ticket
                </p>
                <span className="flex items-center gap-1.5 text-xs text-white/70">
                  
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Waiting
                </span>
              </div>

              <p className="font-display text-5xl sm:text-6xl font-semibold text-white mt-2 leading-none">
                A-024
              </p>

              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-white/50">Now serving</p>
                  <p className="font-display text-xl text-gold-600 mt-0.5">A-017</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Ahead of you</p>
                  <p className="font-display text-xl text-white mt-0.5">7</p>
                </div>
                <div>
                  <p className="text-xs text-white/50">Est. wait</p>
                  <p className="font-display text-xl text-white mt-0.5">32m</p>
                </div>
              </div>

              
              <div className="mt-6 flex items-center gap-1.5 flex-wrap">
                {AHEAD.map(n => <span key={n} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">
                    {n}
                  </span>)}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold-600 text-warm-ink font-mono font-semibold">
                  A-024
                </span>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 space-y-1.5">
                <p className="text-sm text-white/80">General Consultation</p>
                <p className="text-xs text-white/50 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  Accra Central Branch
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
}
export default QueueTicketPreview;