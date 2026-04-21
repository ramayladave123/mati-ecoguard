import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScanLine, Shield, Activity, Leaf, ArrowRight, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-mati.jpg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BeachCard } from "@/components/BeachCard";
import { useBeaches } from "@/hooks/useBeaches";
import { useCheckins } from "@/hooks/useCheckins";

const Index = () => {
  const { beaches, loading } = useBeaches();
  const { checkins } = useCheckins(1);
  const totalCount = beaches.reduce((s, b) => s + b.current_count, 0);
  const totalCap = beaches.reduce((s, b) => s + b.capacity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Aerial view of Dahican Beach, Mati City at sunset" className="h-full w-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-transparent" />
        </div>
        <div className="container relative grid min-h-[88vh] grid-cols-1 items-center gap-10 py-20 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              Live · Powered by tamper-proof ledger
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Protect the beaches of <span className="text-gradient-ocean">Mati</span>,
              one scan at a time.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              EcoLog-Mati uses an autonomous, immutable ledger to monitor visitor density across
              Davao Oriental's most fragile coastlines — keeping Dahican, Pujada Bay and beyond within ecological capacity.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/checkin"><ScanLine className="mr-1.5 h-5 w-5" /> Scan a site QR</Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/admin">CTO Dashboard <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>

            {/* Live counters */}
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              <Stat icon={<Activity className="h-4 w-4" />} label="Visitors today" value={totalCount} />
              <Stat icon={<MapPin className="h-4 w-4" />} label="Sites monitored" value={beaches.length || "—"} />
              <Stat icon={<Shield className="h-4 w-4" />} label="Latest block" value={checkins[0]?.block_number ?? "—"} />
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative lg:col-span-5"
          >
            <div className="glass relative mx-auto max-w-md rounded-3xl p-6 shadow-deep animate-float">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mati District</span>
                <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-success">
                  {totalCap > 0 ? Math.round((totalCount / totalCap) * 100) : 0}% capacity
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {beaches.slice(0, 4).map((b) => {
                  const pct = b.capacity ? (b.current_count / b.capacity) * 100 : 0;
                  return (
                    <Link key={b.id} to={`/checkin/${b.slug}`} className="block">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{b.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{b.current_count}/{b.capacity}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-success"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-foreground/5 p-3 text-xs text-muted-foreground">
                <Leaf className="h-4 w-4 text-secondary" />
                Each check-in offsets ~0.8g CO₂e via efficient ledger anchoring.
              </div>
            </div>
          </motion.aside>
        </div>
        <div className="wave-divider absolute inset-x-0 bottom-0 h-12 opacity-90" />
      </section>

      {/* Sites grid */}
      <section className="container py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">Live capacity</div>
            <h2 className="mt-1 font-display text-4xl font-bold">Mati's protected sites</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">Tap any site to scan its QR and mint your visit on-chain.</p>
          </div>
        </div>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {beaches.map((b, i) => <BeachCard key={b.id} beach={b} index={i} />)}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="bg-gradient-sand py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-semibold uppercase tracking-widest text-primary">Scan → Verify → Mint</div>
            <h2 className="mt-2 font-display text-4xl font-bold">A 3-second flow that protects ecosystems</h2>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Scan the site QR", d: "Posted at every entry point. Works without an app.", icon: <ScanLine className="h-5 w-5" /> },
              { n: "02", t: "Smart capacity check", d: "If the site is at ecological capacity, entry is gracefully delayed.", icon: <Shield className="h-5 w-5" /> },
              { n: "03", t: "Visit minted on-chain", d: "An immutable, hash-chained record + a shareable digital badge.", icon: <Leaf className="h-5 w-5" /> },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-card p-7 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{s.icon}</div>
                  <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="glass rounded-2xl p-3">
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon}{label}</div>
    <div className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</div>
  </div>
);

export default Index;
