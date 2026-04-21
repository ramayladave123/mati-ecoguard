import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Checkin {
  id: string;
  beach_id: string;
  visitor_handle: string;
  block_number: number;
  tx_hash: string;
  prev_hash: string;
  payload_hash: string;
  carbon_grams: number;
  created_at: string;
}

export function useCheckins(limit = 50, beachId?: string) {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let q = supabase.from("checkins").select("*").order("block_number", { ascending: false }).limit(limit);
    if (beachId) q = q.eq("beach_id", beachId);
    q.then(({ data }) => {
      if (!active) return;
      setCheckins((data as Checkin[]) || []);
      setLoading(false);
    });
    const channel = supabase
      .channel(`checkins-live-${beachId ?? "all"}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "checkins" }, (payload) => {
        const row = payload.new as Checkin;
        if (beachId && row.beach_id !== beachId) return;
        setCheckins((prev) => [row, ...prev].slice(0, limit));
      })
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [limit, beachId]);

  return { checkins, loading };
}
