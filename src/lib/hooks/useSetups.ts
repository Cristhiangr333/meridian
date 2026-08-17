"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeSync } from "@/lib/supabase/realtime";
import type { Setup } from "@/lib/types";

export function useSetups() {
  useRealtimeSync("setups", ["setups"]);

  return useQuery({
    queryKey: ["setups"],
    queryFn: async (): Promise<Setup[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("setups")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}
