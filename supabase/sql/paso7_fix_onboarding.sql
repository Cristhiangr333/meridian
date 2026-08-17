-- Meridian — Fix de onboarding (post Paso 7)
-- Ejecutar en Supabase → SQL Editor → New query → Run.
-- Seguro de correr aunque el trigger ya exista: CREATE OR REPLACE reemplaza
-- la función sin duplicar el trigger que ya está enganchado a auth.users.

-- 1) El trigger de "nuevo usuario" ahora también crea su cuenta de trading
--    y siembra 3 setups iniciales — antes solo creaba la fila en `profiles`,
--    dejando /trades atascado en "Cargando tu cuenta..." para siempre.
--    De paso, usa el nombre real que el usuario escribió en /register
--    (antes se ignoraba y siempre se guardaba el email como display_name).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.email)
  );

  insert into public.accounts (user_id, name, starting_balance, current_balance, tier_label)
  values (new.id, 'Cuenta principal', 0, 0, 'Obsidian');

  insert into public.setups (user_id, name, description)
  values
    (new.id, 'Ruptura de rango', 'Entrada en ruptura de un rango de consolidación con confirmación de volumen.'),
    (new.id, 'Retroceso a media móvil', 'Entrada en pullback a una media móvil clave dentro de una tendencia establecida.'),
    (new.id, 'Reversión en soporte/resistencia', 'Entrada en rechazo de un nivel clave de soporte o resistencia.');

  return new;
end;
$$ language plpgsql security definer;

-- 2) Backfill: si ya te registraste (u otros usuarios se registraron) antes
--    de este fix, esto les crea la cuenta y los setups que les faltan, sin
--    duplicar nada si ya los tienen.
insert into public.accounts (user_id, name, starting_balance, current_balance, tier_label)
select p.id, 'Cuenta principal', 0, 0, 'Obsidian'
from public.profiles p
where not exists (select 1 from public.accounts a where a.user_id = p.id);

insert into public.setups (user_id, name, description)
select p.id, s.name, s.description
from public.profiles p
cross join (values
  ('Ruptura de rango', 'Entrada en ruptura de un rango de consolidación con confirmación de volumen.'),
  ('Retroceso a media móvil', 'Entrada en pullback a una media móvil clave dentro de una tendencia establecida.'),
  ('Reversión en soporte/resistencia', 'Entrada en rechazo de un nivel clave de soporte o resistencia.')
) as s(name, description)
where not exists (select 1 from public.setups st where st.user_id = p.id);
