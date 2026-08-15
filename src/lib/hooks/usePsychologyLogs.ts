"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeSync } from "@/lib/supabase/realtime";
import type { PsychologyLog } from "@/lib/coachSummary";

export function usePsychologyLogs(limit = 30) {
  useRealtimeSync("psychology_logs", ["psychology_logs", limit]);

  return useQuery({
    queryKey: ["psychology_logs", limit],
    queryFn: async (): Promise<PsychologyLog[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("psychology_logs")
        .select("*")
        .order("log_date", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data ?? [];
    },
  });
}
