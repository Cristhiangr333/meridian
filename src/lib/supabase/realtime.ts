"use client";

import { useEffect, useId } from "react";
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
 *
 * Nota: el nombre del canal incluye un id único por instancia del hook,
 * porque Supabase Realtime no permite dos canales con el mismo nombre
 * activos a la vez (pasa cuando dos componentes distintos, como la Edge
 * Card y el Dashboard, usan la misma tabla al mismo tiempo).
 */
export function useRealtimeSync(table: string, queryKey: unknown[]) {
  const queryClient = useQueryClient();
  const instanceId = useId();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime:${table}:${JSON.stringify(queryKey)}:${instanceId}`)
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
  }, [table, JSON.stringify(queryKey), instanceId]);
}
