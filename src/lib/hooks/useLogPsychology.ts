"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface PsychologyInput {
  log_date: string;
  sleep_hours: number | null;
  confidence: number;
  stress: number;
  focus: number;
  motivation: number;
  notes: string | null;
}

export function useLogPsychology() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PsychologyInput) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa.");

      const { error } = await supabase
        .from("psychology_logs")
        .upsert({ ...input, user_id: user.id }, { onConflict: "user_id,log_date" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psychology_logs"] });
    },
  });
}
