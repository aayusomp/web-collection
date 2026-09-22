-- =========================================================================
-- Base de datos de la colección de chapas.
--
-- Cópialo entero y pégalo en Supabase → SQL Editor → Run.
-- Se puede ejecutar más de una vez sin romper nada.
-- =========================================================================

-- 1) La tabla de chapas -----------------------------------------------------

create table if not exists public.caps (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  type         text not null default 'beer' check (type in ('beer', 'soda')),
  country_code text not null,
  producer     text,
  city         text,
  style        text,
  abv          text,
  year         text,
  notes        text,
  image        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists caps_created_at_idx on public.caps (created_at desc);
create index if not exists caps_country_idx    on public.caps (country_code);

-- Mantener updated_at al día
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists caps_touch_updated_at on public.caps;
create trigger caps_touch_updated_at
  before update on public.caps
  for each row execute function public.touch_updated_at();

-- 2) Quién puede hacer qué (esto es lo importante) --------------------------
-- Todo el mundo puede LEER: es una web pública.
-- Solo quien ha iniciado sesión puede AÑADIR, EDITAR o BORRAR.

alter table public.caps enable row level security;

drop policy if exists "caps lectura publica"  on public.caps;
drop policy if exists "caps alta con sesion"  on public.caps;
drop policy if exists "caps edicion con sesion" on public.caps;
drop policy if exists "caps borrado con sesion" on public.caps;

create policy "caps lectura publica"
  on public.caps for select to anon, authenticated using (true);

create policy "caps alta con sesion"
  on public.caps for insert to authenticated with check (true);

create policy "caps edicion con sesion"
  on public.caps for update to authenticated using (true) with check (true);

create policy "caps borrado con sesion"
  on public.caps for delete to authenticated using (true);

-- 3) El almacén de fotos ----------------------------------------------------

insert into storage.buckets (id, name, public)
values ('caps', 'caps', true)
on conflict (id) do update set public = true;

drop policy if exists "fotos lectura publica"   on storage.objects;
drop policy if exists "fotos alta con sesion"   on storage.objects;
drop policy if exists "fotos edicion con sesion" on storage.objects;
drop policy if exists "fotos borrado con sesion" on storage.objects;

create policy "fotos lectura publica"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'caps');

create policy "fotos alta con sesion"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'caps');

create policy "fotos edicion con sesion"
  on storage.objects for update to authenticated
  using (bucket_id = 'caps') with check (bucket_id = 'caps');

create policy "fotos borrado con sesion"
  on storage.objects for delete to authenticated
  using (bucket_id = 'caps');
