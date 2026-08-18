"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { TradeDirection } from "@/lib/types";

export interface NewTradeInput {
  account_id: string;
  asset: string;
  direction: TradeDirection;
  opened_at: string;
  entry_price: number;
  stop_price: number | null;
  target_price: number | null;
  rr_planned: number | null;
  pnl: number;
  confidence: number;
  setup_id: string | null;
  notes: string | null;
}

export function useCreateTrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: NewTradeInput) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa.");

      const { error } = await supabase.from("trades").insert({
        ...input,
        user_id: user.id,
        status: "closed",
      });

      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["trades", variables.account_id],
      });
      queryClient.invalidateQueries({ queryKey: ["account"] });
    },
  });
}
