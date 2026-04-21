import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Save, ShieldAlert, Power, RotateCcw, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useBeaches } from "@/hooks/useBeaches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { beachImage } from "@/lib/beachImages";
import { capacityState } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminSites = () => {
  const { beaches } = useBeaches();
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [qrSlug, setQrSlug] = useState<string | null>(null);

  const save = async (id: string) => {
    const cap = edits[id];
    if (!cap || cap < 1) return;
    setSavingId(id);
    const { error } = await supabase.from("beaches").update({ capacity: cap }).eq("id", id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Capacity updated");
    setEdits((e) => ({ ...e, [id]: 0 }));
  };

  const toggleHalt = async (id: string, current: string) => {
    const next = current === "halted" ? "open" : "halted";
    const { error } = await supabase.from("beaches").update({ status: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(next === "halted" ? "Site halted" : "Site reopened");
  };

  const reset = async (id: string) => {
    const { error } = await supabase.from("beaches").update({ current_count: 0 }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Live count reset");
  };

  const qrBeach = beaches.find((b) => b.slug === qrSlug);
  const qrUrl = qrBeach ? `${window.location.origin}/checkin/${qrBeach.slug}` : "";

  return (
    <div className="space-y-8 p-6 md:p-10">
      <header>
        <div className="text-sm font-semibold uppercase tracking-widest text-primary">Site management</div>
        <h1 className="mt-1 font-display text-3xl font-bold">Capacities, QR codes & emergency controls</h1>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {beaches.map((b, i) => {
          const { tone, pct } = capacityState(b.current_count, b.capacity);
          const editVal = edits[b.id] ?? b.capacity;
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="overflow-hidden rounded-3xl bg-card shadow-card"
            >
              <div className="relative h-32">
                <img src={beachImage(b.image_url)} alt={b.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-between p-5 text-primary-foreground">
                  <div>
                    <h3 className="font-display text-2xl font-bold">{b.name}</h3>
                    <div className="text-xs opacity-85">{b.location}</div>
                  </div>
                  {b.status === "halted" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold">
                      <ShieldAlert className="h-3 w-3" /> Halted
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-5 p-5">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Live density</span>
                    <span className="font-mono">{b.current_count}/{b.capacity}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full",
                      tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-warning" : "bg-success"
                    )} style={{ width: `${Math.min(pct * 100, 100)}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-end gap-2">
                  <div>
                    <Label className="text-xs">Ecological capacity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={editVal}
                      onChange={(e) => setEdits((s) => ({ ...s, [b.id]: parseInt(e.target.value || "0", 10) }))}
                      className="mt-1 h-11 rounded-xl"
                    />
                  </div>
                  <Button variant="hero" size="lg" onClick={() => save(b.id)} disabled={savingId === b.id || editVal === b.capacity}>
                    {savingId === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant={b.status === "halted" ? "secondary" : "destructive"} size="sm" onClick={() => toggleHalt(b.id, b.status)}>
                    <Power className="mr-1.5 h-3.5 w-3.5" /> {b.status === "halted" ? "Reopen site" : "Emergency halt"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => reset(b.id)}>
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset count
                  </Button>
                  <Button variant="glass" size="sm" onClick={() => setQrSlug(b.slug)}>
                    <QrCode className="mr-1.5 h-3.5 w-3.5" /> Show QR
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={!!qrSlug} onOpenChange={(o) => !o && setQrSlug(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{qrBeach?.name} — Site QR</DialogTitle></DialogHeader>
          {qrBeach && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="rounded-2xl bg-white p-4 shadow-card">
                <QRCodeSVG value={qrUrl} size={220} fgColor="#0c1f3b" />
              </div>
              <div className="font-mono text-xs text-muted-foreground break-all text-center">{qrUrl}</div>
              <Button variant="hero" size="sm" onClick={() => { navigator.clipboard.writeText(qrUrl); toast.success("URL copied"); }}>
                Copy check-in URL
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSites;
