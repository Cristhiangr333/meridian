"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeSync } from "@/lib/supabase/realtime";
import type { Account } from "@/lib/types";

export function useAccount() {
  useRealtimeSync("accounts", ["account"]);

  return useQuery({
    queryKey: ["account"],
    queryFn: async (): Promise<Account | null> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}
