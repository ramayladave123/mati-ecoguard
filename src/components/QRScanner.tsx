import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onResult: (text: string) => void;
  onClose?: () => void;
}

export const QRScanner = ({ onResult, onClose }: Props) => {
  const elementId = "ecolog-qr-reader";
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(elementId, { verbose: false });
    scannerRef.current = scanner;
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (text) => {
          onResult(text);
          scanner.stop().catch(() => {});
        },
        () => {}
      )
      .catch((e) => setError(e?.message || "Camera unavailable"));
    return () => {
      scanner.stop().catch(() => {});
      scanner.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="pointer-events-none absolute inset-x-8 top-1/2 h-56 -translate-y-1/2 rounded-2xl border-2 border-primary-glow/80 shadow-[0_0_40px_hsl(var(--primary-glow)/0.6)] animate-pulse" />
      {error && (
        <div className="bg-destructive/20 p-3 text-center text-sm text-destructive-foreground">
          {error}. Pick a site below instead.
        </div>
      )}
    </div>
  );
};
