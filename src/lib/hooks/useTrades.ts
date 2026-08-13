"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeSync } from "@/lib/supabase/realtime";
import type { Trade } from "@/lib/types";

export function useTrades(accountId: string | undefined) {
  useRealtimeSync("trades", ["trades", accountId]);

  return useQuery({
    queryKey: ["trades", accountId],
    enabled: !!accountId,
    queryFn: async (): Promise<Trade[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("account_id", accountId!)
        .order("opened_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}
