import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convierte un timestamp (ISO, con o sin zona) a la fecha calendario LOCAL
 * del navegador, en formato "YYYY-MM-DD".
 *
 * Postgres/Supabase guarda `opened_at` como timestamptz en UTC. Truncar ese
 * string con `.slice(0, 10)` da la fecha en UTC, no la del trader — para
 * cualquiera fuera de UTC+0, una operación cerrada de noche aparece en el
 * Calendario, el Heatmap y la racha como si hubiera sido al día siguiente.
 * Esta función es la única forma correcta de obtener la "fecha de trading"
 * de un timestamp en toda la app.
 */
export function toLocalDateKey(timestamp: string | Date): string {
  const d = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Valor por defecto para un <input type="datetime-local">: la fecha/hora
 * LOCAL actual en formato "YYYY-MM-DDTHH:mm" (sin segundos, sin zona —
 * es justo lo que ese input espera). Complementa a toLocalDateKey: aquí
 * también incluimos la hora porque el formulario de operaciones permite
 * elegir el momento exacto en el que se abrió el trade.
 */
export function toDatetimeLocalValue(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
