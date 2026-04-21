import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Loader2, ShieldAlert, Sparkles, ArrowRight, Share2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CapacityGauge } from "@/components/CapacityGauge";
import { BlockchainBadge } from "@/components/BlockchainBadge";
import { QRScanner } from "@/components/QRScanner";
import { BeachCard, type Beach } from "@/components/BeachCard";
import { beachImage } from "@/lib/beachImages";
import { supabase } from "@/integrations/supabase/client";
import { useBeaches } from "@/hooks/useBeaches";
import { toast } from "sonner";

type MintResult = {
  status: "minted" | "blocked" | "error";
  reason?: string;
  block_number?: number;
  tx_hash?: string;
  prev_hash?: string;
  beach?: Beach;
};

const Checkin = () => {
  const { beachId } = useParams<{ beachId?: string }>();
  const navigate = useNavigate();
  const { beaches } = useBeaches();
  const [showScanner, setShowScanner] = useState(false);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<MintResult | null>(null);

  const beach = useMemo(() => beaches.find((b) => b.slug === beachId) ?? null, [beaches, beachId]);

  useEffect(() => { setResult(null); }, [beachId]);

  const handleQR = (text: string) => {
    setShowScanner(false);
    // Accept either raw slug or URL containing /checkin/<slug>
    try {
      const url = new URL(text);
      const parts = url.pathname.split("/").filter(Boolean);
      const slug = parts[parts.indexOf("checkin") + 1] || parts.pop();
      if (slug) navigate(`/checkin/${slug}`);
    } catch {
      navigate(`/checkin/${text.trim()}`);
    }
  };

  const mint = async () => {
    if (!beach) return;
    setSubmitting(true);
    const handle = name.trim() || `Visitor ${Math.floor(1000 + Math.random() * 9000)}`;
    const { data, error } = await supabase.rpc("perform_checkin", {
      _beach_slug: beach.slug,
      _visitor_handle: handle,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't mint visit", { description: error.message });
      return;
    }
    const r = data as unknown as MintResult;
    setResult(r);
    if (r.status === "minted") toast.success("Visit minted on-chain ✨");
    if (r.status === "blocked") toast.warning(r.reason === "halted" ? "Site is on emergency halt" : "Site at ecological capacity");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {!beach ? (
        <section className="container py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold">Check in to a Mati site</h1>
            <p className="mt-2 text-muted-foreground">Scan the QR code at any monitored site, or pick one below.</p>

            <div className="mt-8">
              {showScanner ? (
                <QRScanner onResult={handleQR} onClose={() => setShowScanner(false)} />
              ) : (
                <Button variant="hero" size="xl" onClick={() => setShowScanner(true)}>
                  <ScanLine className="mr-2 h-5 w-5" /> Open camera scanner
                </Button>
              )}
            </div>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {beaches.map((b, i) => <BeachCard key={b.id} beach={b} index={i} />)}
          </div>
        </section>
      ) : (
        <section className="container py-10">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl shadow-deep">
              <img src={beachImage(beach.image_url)} alt={beach.name} className="h-full w-full object-cover" width={1280} height={896} />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-primary-foreground">
                <div className="text-xs font-semibold uppercase tracking-widest opacity-80">{beach.location}</div>
                <h1 className="mt-1 font-display text-4xl font-bold drop-shadow">{beach.name}</h1>
                <p className="mt-2 max-w-md text-sm opacity-90">{beach.description}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live capacity</div>
                    <h2 className="font-display text-2xl font-bold">{beach.name}</h2>
                  </div>
                  {beach.status === "halted" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive">
                      <ShieldAlert className="h-3 w-3" /> Emergency halt
                    </span>
                  )}
                </div>
                <div className="mt-6 flex items-center gap-8">
                  <CapacityGauge count={beach.current_count} capacity={beach.capacity} />
                  <div className="space-y-3 text-sm">
                    <Row label="Ecological cap" value={beach.capacity} />
                    <Row label="Currently inside" value={beach.current_count} />
                    <Row label="Available" value={Math.max(0, beach.capacity - beach.current_count)} />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-card p-6 shadow-card">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Your name (optional)</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria S."
                  className="mt-2 h-12 rounded-xl"
                />
                <Button
                  variant="hero"
                  size="xl"
                  className="mt-4 w-full"
                  onClick={mint}
                  disabled={submitting || beach.status === "halted"}
                >
                  {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  {submitting ? "Minting on ledger…" : "Mint my visit"}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Free • Carbon-neutral • No wallet required
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-14"
              >
                {result.status === "minted" && result.tx_hash ? (
                  <div className="mx-auto max-w-3xl">
                    <BlockchainBadge
                      txHash={result.tx_hash}
                      blockNumber={result.block_number!}
                      beachName={beach.name}
                      visitor={name.trim() || "Anonymous Visitor"}
                    />
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <Button variant="glass" onClick={() => navigator.clipboard.writeText(result.tx_hash!)}>
                        <Share2 className="mr-1.5 h-4 w-4" /> Copy TX hash
                      </Button>
                      <Button variant="hero" onClick={() => navigate("/")}>Explore more sites <ArrowRight className="ml-1 h-4 w-4" /></Button>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto max-w-md rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                    <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
                    <h3 className="mt-3 font-display text-2xl font-bold">Entry temporarily delayed</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {result.reason === "halted"
                        ? "This site is on emergency halt by the City Tourism Office."
                        : "This site has reached its ecological capacity. Please try again shortly or visit another site."}
                    </p>
                    <Button variant="hero" className="mt-5" onClick={() => navigate("/")}>See other sites</Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}

      <Footer />
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-6">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-display text-lg font-bold tabular-nums">{value}</span>
  </div>
);

export default Checkin;
