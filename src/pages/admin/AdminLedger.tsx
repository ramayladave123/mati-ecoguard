import { useMemo } from "react";
import { motion } from "framer-motion";
import { Database, ExternalLink, ShieldCheck } from "lucide-react";
import { useCheckins } from "@/hooks/useCheckins";
import { useBeaches } from "@/hooks/useBeaches";
import { formatRelative, shortHash } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminLedger = () => {
  const { checkins } = useCheckins(200);
  const { beaches } = useBeaches();
  const beachMap = useMemo(() => Object.fromEntries(beaches.map((b) => [b.id, b])), [beaches]);

  const exportCsv = () => {
    const header = ["block", "tx_hash", "prev_hash", "beach", "visitor", "carbon_g", "timestamp"].join(",");
    const rows = checkins.map((c) =>
      [c.block_number, c.tx_hash, c.prev_hash, beachMap[c.beach_id]?.name || c.beach_id, c.visitor_handle, c.carbon_grams, c.created_at].join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ecolog-mati-ledger-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Ledger exported");
  };

  return (
    <div className="space-y-8 p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-widest text-primary">Tamper-evident ledger</div>
          <h1 className="mt-1 font-display text-3xl font-bold">EcoLog-Mati blockchain explorer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every check-in is hash-chained to the previous block. Any tampering breaks the chain.
          </p>
        </div>
        <Button variant="hero" onClick={exportCsv}><Database className="mr-2 h-4 w-4" /> Export CSV</Button>
      </header>

      <div className="overflow-hidden rounded-3xl bg-card shadow-card">
        <div className="grid grid-cols-[80px_1fr_1.4fr_1fr_120px] items-center gap-4 border-b bg-muted/40 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Block</span><span>Site & visitor</span><span>TX hash</span><span>Prev hash</span><span className="text-right">When</span>
        </div>
        <ul className="divide-y">
          {checkins.map((c, i) => (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.01, 0.2) }}
              className="grid grid-cols-[80px_1fr_1.4fr_1fr_120px] items-center gap-4 px-5 py-4 text-sm hover:bg-muted/30"
            >
              <span className="font-mono text-xs">
                <span className="rounded-md bg-primary/10 px-2 py-1 font-semibold text-primary">#{c.block_number}</span>
              </span>
              <div className="min-w-0">
                <div className="truncate font-medium">{beachMap[c.beach_id]?.name ?? "—"}</div>
                <div className="truncate text-xs text-muted-foreground">{c.visitor_handle}</div>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                <span className="truncate">{shortHash(c.tx_hash, 18, 8)}</span>
              </div>
              <div className="truncate font-mono text-xs text-muted-foreground">{shortHash(c.prev_hash, 14, 6)}</div>
              <div className="text-right text-xs text-muted-foreground">{formatRelative(c.created_at)}</div>
            </motion.li>
          ))}
          {checkins.length === 0 && (
            <li className="p-8 text-center text-sm text-muted-foreground">No blocks yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminLedger;
