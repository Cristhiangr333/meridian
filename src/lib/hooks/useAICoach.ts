"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useAICoach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (summary: string): Promise<string> => {
      const supabase = createClient();

      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: { summary },
      });

      if (error) throw error;
      const insight: string = data?.insight ?? "No se pudo generar un análisis.";

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("ai_insights").insert({
          user_id: user.id,
          kind: "coach",
          content: insight,
        });
      }

      return insight;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}
