"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface SetupInput {
  name: string;
  description: string | null;
}

export function useCreateSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SetupInput) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay sesión activa.");

      const { error } = await supabase
        .from("setups")
        .insert({ ...input, user_id: user.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setups"] });
    },
  });
}

export function useUpdateSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: SetupInput & { id: string }) => {
      const supabase = createClient();
      const { error } = await supabase.from("setups").update(input).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setups"] });
    },
  });
}

export function useDeleteSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("setups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setups"] });
      // Un trade que apuntaba a este setup ahora tiene setup_id = null
      // (ON DELETE SET NULL en el esquema) — refrescamos también trades.
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}
