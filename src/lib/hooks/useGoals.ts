"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeSync } from "@/lib/supabase/realtime";
import type { Goal } from "@/lib/types";

export function useGoals() {
  useRealtimeSync("goals", ["goals"]);

  return useQuery({
    queryKey: ["goals"],
    queryFn: async (): Promise<Goal[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}
