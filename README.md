# Meridian — Sistema de inteligencia de trading

## Estado de este paquete

Contiene el esqueleto base del proyecto (Paso 2 + ajuste de tiempo real):
- Next.js 14 (App Router) + TypeScript configurado
- Tailwind con los tokens exactos de la identidad Meridian (violeta, oro, tipografías)
- Clientes de Supabase (navegador y servidor) listos para el Paso 3
- **React Query** como capa de estado/cache
- **Hook de sincronización en tiempo real** (`useRealtimeSync`) — cualquier pantalla que lo use se actualiza sola cuando cambian los datos desde otro dispositivo, sin refrescar

## Responsive por diseño

No hay una app separada para móvil. Cada pantalla se construye mobile-first con clases responsive de Tailwind (`grid-cols-1 md:grid-cols-[...]`). Este es un principio del proyecto, no un paso aparte — se aplica en cada archivo que construyamos de aquí en adelante.

## Paso extra en Supabase — activar Realtime

Antes del Paso 3, corre esto también en el SQL Editor de Supabase (el Paso 1 crea las tablas, esto activa la transmisión de cambios en vivo):

```sql
alter publication supabase_realtime add table public.trades;
alter publication supabase_realtime add table public.psychology_logs;
alter publication supabase_realtime add table public.accounts;
```

## Cómo subir esto a GitHub

1. Sube todo el contenido de esta carpeta a la raíz de tu repositorio (respetando las rutas de carpetas: `src/app/...`, `src/lib/...`, `src/components/...`).
2. **No subas ningún archivo `.env.local`** — las llaves de Supabase se configuran directo en Vercel más adelante, nunca en el repo.
3. Cuando conectes el repo a Vercel, en **Settings → Environment Variables** añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Siguiente paso

Paso 3: autenticación (login/registro), middleware de sesión, y la topbar + Edge Card conectadas a datos reales de Supabase — ya responsive y con sincronización en vivo desde el primer componente.
