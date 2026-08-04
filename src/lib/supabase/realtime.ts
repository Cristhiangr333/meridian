"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

/**
 * Suscribe una tabla de Supabase a cambios en tiempo real (insert/update/delete)
 * y refresca automáticamente el cache de React Query correspondiente.
 *
 * Úsalo una vez por pantalla, por cada tabla que esa pantalla necesite
 * mantener sincronizada entre dispositivos.
 *
 * Ejemplo: useRealtimeSync("trades", ["trades", accountId]);
 */
export function useRealtimeSync(table: string, queryKey: unknown[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime:${table}:${JSON.stringify(queryKey)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, JSON.stringify(queryKey)]);
}
