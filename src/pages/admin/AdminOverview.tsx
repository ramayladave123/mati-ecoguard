import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, Layers, Leaf, Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { useBeaches } from "@/hooks/useBeaches";
import { useCheckins } from "@/hooks/useCheckins";
import { CapacityGauge } from "@/components/CapacityGauge";
import { capacityState, formatRelative, shortHash } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const AdminOverview = () => {
  const { beaches } = useBeaches();
  const { checkins } = useCheckins(80);

  const totals = useMemo(() => {
    const visitors = beaches.reduce((s, b) => s + b.current_count, 0);
    const cap = beaches.reduce((s, b) => s + b.capacity, 0);
    const alerts = beaches.filter((b) => b.current_count / Math.max(b.capacity, 1) >= 0.9 || b.status === "halted").length;
    const carbon = checkins.reduce((s, c) => s + Number(c.carbon_grams ?? 0.8), 0);
    return { visitors, cap, alerts, carbon };
  }, [beaches, checkins]);

  // Bucket check-ins by hour for the chart
  const series = useMemo(() => {
    const buckets = new Map<string, number>();
    checkins.forEach((c) => {
      const d = new Date(c.created_at);
      const k = `${d.getHours()}:00`;
      buckets.set(k, (buckets.get(k) || 0) + 1);
    });
    return Array.from(buckets.entries())
      .reverse()
      .map(([h, v]) => ({ h, v }));
  }, [checkins]);

  return (
    <div className="space-y-8 p-6 md:p-10">
      <header>
        <div className="text-sm font-semibold uppercase tracking-widest text-primary">CTO Command Center</div>
        <h1 className="mt-1 font-display text-3xl font-bold">Mati City — live overview</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Kpi icon={<Activity className="h-4 w-4" />} label="Visitors right now" value={totals.visitors} accent="primary" />
        <Kpi icon={<Layers className="h-4 w-4" />} label="Total ecological cap" value={totals.cap} accent="secondary" />
        <Kpi icon={<AlertTriangle className="h-4 w-4" />} label="Sites in alert" value={totals.alerts} accent={totals.alerts ? "danger" : "success"} />
        <Kpi icon={<Leaf className="h-4 w-4" />} label="Carbon today (g CO₂e)" value={totals.carbon.toFixed(1)} accent="success" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-card p-6 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold">Check-in activity</h2>
              <p className="text-sm text-muted-foreground">Last {checkins.length} ledger blocks</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
              <TrendingUp className="h-3 w-3" /> Live
            </span>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="h" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={28} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-card p-6 shadow-card">
          <h2 className="font-display text-xl font-bold">Latest blocks</h2>
          <p className="text-sm text-muted-foreground">Tamper-evident ledger</p>
          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-2">
            {checkins.slice(0, 8).map((c) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between rounded-xl bg-muted/40 p-3"
              >
                <div>
                  <div className="font-mono text-xs text-muted-foreground">#{c.block_number}</div>
                  <div className="text-sm font-medium">{c.visitor_handle}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[11px] text-muted-foreground">{shortHash(c.tx_hash)}</div>
                  <div className="text-[11px] text-muted-foreground">{formatRelative(c.created_at)}</div>
                </div>
              </motion.li>
            ))}
            {checkins.length === 0 && <li className="text-sm text-muted-foreground">No activity yet.</li>}
          </ul>
        </div>
      </section>

      {/* Heatmap: site density grid */}
      <section className="rounded-3xl bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Density heatmap</h2>
            <p className="text-sm text-muted-foreground">All sites at a glance</p>
          </div>
          <Legend />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {beaches.map((b) => {
            const { tone, pct, label } = capacityState(b.current_count, b.capacity);
            const halted = b.status === "halted";
            return (
              <div key={b.id} className={cn(
                "relative overflow-hidden rounded-2xl border p-5 transition-all",
                halted || tone === "danger" ? "border-destructive/40 bg-destructive/5" :
                tone === "warning" ? "border-warning/40 bg-warning/5" :
                "border-success/40 bg-success/5"
              )}>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">{b.name}</h3>
                  <CapacityGauge count={b.current_count} capacity={b.capacity} size={72} showLabel={false} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{halted ? "Halted" : label}</span>
                  <span className="font-mono">{Math.round(pct * 100)}%</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1">
                  <div className={cn("h-full",
                    halted || tone === "danger" ? "bg-destructive" :
                    tone === "warning" ? "bg-warning" : "bg-success"
                  )} style={{ width: `${Math.min(pct * 100, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

const Kpi = ({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent: "primary" | "secondary" | "success" | "danger" }) => (
  <div className="rounded-3xl bg-card p-5 shadow-card">
    <div className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", {
      "bg-primary/10 text-primary": accent === "primary",
      "bg-secondary/15 text-secondary": accent === "secondary",
      "bg-success/15 text-success": accent === "success",
      "bg-destructive/15 text-destructive": accent === "danger",
    })}>{icon}{label}</div>
    <div className="mt-3 font-display text-3xl font-bold tabular-nums">{value}</div>
  </div>
);

const Legend = () => (
  <div className="flex items-center gap-3 text-xs text-muted-foreground">
    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> Open</span>
    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Filling</span>
    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Capacity</span>
  </div>
);

export default AdminOverview;
