/**
 * Estado real de la sesión de Nueva York (referencia estándar en forex/futuros:
 * 08:00–17:00 hora de Nueva York, lunes a viernes). Usa Intl con timeZone
 * "America/New_York" para que el cálculo sea correcto sin importar en qué
 * zona horaria esté el navegador del usuario, y respeta el cambio de
 * horario de verano automáticamente (lo resuelve el propio motor de Intl).
 *
 * Antes de esto, el TopBar mostraba el texto fijo "Sesión NY abierta"
 * siempre, sin importar la hora real — un dato falso en una plataforma
 * cuya filosofía es "el dato es un activo, no un registro".
 */
export interface MarketSessionStatus {
  isOpen: boolean;
  label: string;
}

export function getNySessionStatus(date: Date = new Date()): MarketSessionStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    hour12: false,
    weekday: "short",
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";

  const isWeekday = !["Sat", "Sun"].includes(weekday);
  const isOpen = isWeekday && hour >= 8 && hour < 17;

  return {
    isOpen,
    label: isOpen ? "Sesión NY abierta" : "Sesión NY cerrada",
  };
}
