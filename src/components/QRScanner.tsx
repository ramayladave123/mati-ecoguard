import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  onResult: (text: string) => void;
  onClose?: () => void;
}

export const QRScanner = ({ onResult, onClose }: Props) => {
  const elementId = "ecolog-qr-reader";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const runningRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(elementId, { verbose: false });
    scannerRef.current = scanner;

    const start = async () => {
      try {
        // Check camera support upfront for clearer error messaging
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (text) => {
            if (cancelled) return;
            onResult(text);
            scanner.stop().then(() => {
              runningRef.current = false;
            }).catch(() => {});
          },
          () => {}
        );
        runningRef.current = true;
      } catch (e: any) {
        if (!cancelled) {
          const msg = e?.message || String(e);
          if (msg.toLowerCase().includes("permission") || msg.toLowerCase().includes("notallowed")) {
            setError("Camera permission denied. Allow camera access in your browser, or paste the QR link below.");
          } else if (msg.toLowerCase().includes("notfound") || msg.toLowerCase().includes("no camera")) {
            setError("No camera detected on this device. Paste the QR link below instead.");
          } else {
            setError("Camera unavailable in this preview (iframe restriction). Open the app in a new tab, or paste the QR link below.");
          }
        }
      }
    };
    start();

    return () => {
      cancelled = true;
      const cleanup = async () => {
        try {
          if (runningRef.current) {
            await scanner.stop();
            runningRef.current = false;
          }
        } catch {}
        try {
          scanner.clear();
        } catch {}
      };
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitManual = () => {
    const v = manual.trim();
    if (v) onResult(v);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-foreground/95 shadow-deep">
      <div className="flex items-center justify-between p-4 text-primary-foreground">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Camera className="h-4 w-4" /> Point camera at site QR
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-white/10">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div id={elementId} className="aspect-square w-full bg-black [&_video]:rounded-none" />
      {!error && (
        <div className="pointer-events-none absolute inset-x-8 top-[42%] h-56 -translate-y-1/2">
          <div className="absolute inset-0 rounded-2xl border-2 border-primary-glow/70 shadow-[0_0_40px_hsl(var(--primary-glow)/0.6)]" />
          <span className="absolute -left-1 -top-1 h-6 w-6 rounded-tl-2xl border-l-4 border-t-4 border-primary-glow animate-corner-pulse" />
          <span className="absolute -right-1 -top-1 h-6 w-6 rounded-tr-2xl border-r-4 border-t-4 border-primary-glow animate-corner-pulse" />
          <span className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-2xl border-b-4 border-l-4 border-primary-glow animate-corner-pulse" />
          <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-2xl border-b-4 border-r-4 border-primary-glow animate-corner-pulse" />
          <div className="absolute inset-x-3 top-0 h-full overflow-hidden rounded-xl">
            <div className="h-1 w-full animate-scan-line bg-gradient-to-r from-transparent via-primary-glow to-transparent shadow-[0_0_18px_hsl(var(--primary-glow))]" />
          </div>
        </div>
      )}
      {error && (
        <div className="space-y-3 bg-destructive/20 p-4 text-sm text-primary-foreground">
          <p className="text-center">{error}</p>
          <div className="flex items-center gap-2 rounded-xl bg-background/10 p-2">
            <Keyboard className="ml-1 h-4 w-4 shrink-0 opacity-80" />
            <Input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Paste QR link or site slug"
              className="border-0 bg-transparent text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:ring-0"
              onKeyDown={(e) => e.key === "Enter" && submitManual()}
            />
            <Button size="sm" onClick={submitManual} disabled={!manual.trim()}>
              Go
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
