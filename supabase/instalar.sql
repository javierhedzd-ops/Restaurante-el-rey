-- Panel del dueño de Carnitas El Rey: precios y fotos que edita el dueño.
-- Se pega completo en Supabase → SQL Editor → Run. Se puede correr más de una vez.
--
-- Quién puede editar: los correos de la tabla `editores` (abajo). Para agregar
-- a alguien: insert into public.editores (email) values ('correo@ejemplo.com');
-- y crearle su usuario en Authentication → Users. Para quitarlo: delete ... where email = '...'.

create table if not exists public.editores (
  email text primary key check (email = lower(email))
);
alter table public.editores enable row level security;   -- sin políticas: nadie la lee desde la página

insert into public.editores (email) values ('javierhedzd@gmail.com') on conflict do nothing;

-- ¿El usuario que hace la petición es editor? (security definer: puede leer `editores`)
create or replace function public.es_dueno() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.editores where email = lower(coalesce(auth.jwt() ->> 'email', '')))
$$;

-- Precios que cambió el dueño (id = id del platillo en MENU de index.html).
-- precio vacío (null) = "precio por confirmar".
create table if not exists public.precios (
  id text primary key,
  precio integer check (precio is null or (precio > 0 and precio < 100000)),
  actualizado timestamptz not null default now()
);

-- Fotos que subió el dueño (clave = nombre de la foto, p. ej. taco-maciza, portada).
create table if not exists public.fotos (
  clave text primary key check (clave ~ '^[a-z0-9-]+$'),
  url text not null,
  actualizado timestamptz not null default now()
);

alter table public.precios enable row level security;
alter table public.fotos enable row level security;

drop policy if exists "todos leen precios" on public.precios;
drop policy if exists "dueño escribe precios" on public.precios;
create policy "todos leen precios" on public.precios for select using (true);
create policy "dueño escribe precios" on public.precios for all to authenticated
  using (public.es_dueno()) with check (public.es_dueno());

drop policy if exists "todos leen fotos" on public.fotos;
drop policy if exists "dueño escribe fotos" on public.fotos;
create policy "todos leen fotos" on public.fotos for select using (true);
create policy "dueño escribe fotos" on public.fotos for all to authenticated
  using (public.es_dueno()) with check (public.es_dueno());

-- Carpeta pública para las fotos (máx. 5 MB, solo imágenes).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "dueño ve fotos" on storage.objects;
drop policy if exists "dueño sube fotos" on storage.objects;
drop policy if exists "dueño cambia fotos" on storage.objects;
drop policy if exists "dueño borra fotos" on storage.objects;
create policy "dueño ve fotos" on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and public.es_dueno());
create policy "dueño sube fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and public.es_dueno());
create policy "dueño cambia fotos" on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and public.es_dueno()) with check (bucket_id = 'fotos' and public.es_dueno());
create policy "dueño borra fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and public.es_dueno());
