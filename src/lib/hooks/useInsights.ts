"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeSync } from "@/lib/supabase/realtime";

export interface AIInsight {
  id: string;
  kind: string;
  content: string;
  created_at: string;
}

export function useInsights(limit = 10) {
  useRealtimeSync("ai_insights", ["insights", limit]);

  return useQuery({
    queryKey: ["insights", limit],
    queryFn: async (): Promise<AIInsight[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    },
  });
}
