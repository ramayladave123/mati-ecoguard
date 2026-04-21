import { motion } from "framer-motion";
import { Shield, Hash } from "lucide-react";
import { shortHash } from "@/lib/format";

interface Props {
  txHash: string;
  blockNumber: number;
  beachName: string;
  visitor: string;
}

export const BlockchainBadge = ({ txHash, blockNumber, beachName, visitor }: Props) => (
  <motion.div
    initial={{ scale: 0.85, opacity: 0, rotateX: -20 }}
    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
    transition={{ type: "spring", stiffness: 180, damping: 18 }}
    className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-ocean p-6 text-primary-foreground shadow-deep"
  >
    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary-glow/40 blur-3xl" />
    <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-secondary/30 blur-3xl" />
    <div className="relative">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur">
          <Shield className="h-3 w-3" /> Verified On-Chain
        </span>
        <span className="font-mono text-xs opacity-80">#{blockNumber.toString().padStart(6, "0")}</span>
      </div>
      <div className="mt-6">
        <div className="text-xs uppercase tracking-widest opacity-70">Visit NFT</div>
        <div className="mt-1 font-display text-2xl font-bold leading-tight">{beachName}</div>
        <div className="mt-0.5 text-sm opacity-85">Visitor: {visitor}</div>
      </div>
      <div className="mt-6 rounded-xl bg-white/10 p-3 backdrop-blur">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider opacity-80">
          <Hash className="h-3 w-3" /> Transaction Hash
        </div>
        <div className="mt-1 font-mono text-xs break-all">{shortHash(txHash, 14, 10)}</div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs opacity-80">
        <span>EcoLog-Mati Ledger</span>
        <span>{new Date().toLocaleDateString("en-PH", { day: "2-digit", month: "short", year: "numeric" })}</span>
      </div>
    </div>
  </motion.div>
);
