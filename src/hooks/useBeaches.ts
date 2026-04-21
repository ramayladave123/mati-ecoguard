import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Beach } from "@/components/BeachCard";

export function useBeaches() {
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("beaches")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (!active) return;
        setBeaches((data as Beach[]) || []);
        setLoading(false);
      });
    const channel = supabase
      .channel("beaches-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "beaches" }, (payload) => {
        setBeaches((prev) => {
          if (payload.eventType === "INSERT") return [...prev, payload.new as Beach];
          if (payload.eventType === "DELETE") return prev.filter((b) => b.id !== (payload.old as Beach).id);
          return prev.map((b) => (b.id === (payload.new as Beach).id ? (payload.new as Beach) : b));
        });
      })
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { beaches, loading };
}
