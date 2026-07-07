-- ════════════════════════════════════════════════════════════
--  SETUP COMPLETO — A.S Barbería (Supabase / PostgreSQL)
--  Pega TODO este archivo en: Supabase → SQL Editor → New query → Run.
--  Crea tablas + seguridad (RLS) + datos de ejemplo, todo de una vez.
--  (Equivale a schema.sql + policies.sql + seed.sql juntos.)
-- ════════════════════════════════════════════════════════════

-- ─── EXTENSIÓN para el seguro anti-doble-reserva ──────────
create extension if not exists btree_gist;

-- ─── TABLAS ───────────────────────────────────────────────
create table if not exists servicios (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  descripcion text,
  duracion_min int  not null check (duracion_min > 0),
  precio      numeric(10,2) not null default 0,
  icono       text,
  destacado   boolean default false,
  activo      boolean default true,
  orden       int     default 0,
  creado_en   timestamptz default now()
);

create table if not exists horario (
  id          bigint generated always as identity primary key,
  dia_semana  int  not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin    time not null,
  check (hora_fin > hora_inicio)
);

create table if not exists bloqueos (
  id        bigint generated always as identity primary key,
  inicio    timestamptz not null,
  fin       timestamptz not null,
  motivo    text,
  creado_en timestamptz default now(),
  check (fin > inicio)
);

create table if not exists citas (
  id             bigint generated always as identity primary key,
  servicio_id    bigint references servicios(id),
  servicio_nombre text,
  cliente_nombre text not null,
  cliente_movil  text not null,
  cliente_email  text,
  inicio         timestamptz not null,
  fin            timestamptz not null,
  estado         text not null default 'pendiente'
                 check (estado in ('pendiente', 'atendida', 'cancelada')),
  notas          text,
  creado_en      timestamptz default now(),
  check (fin > inicio)
);

-- 🔒 Dos citas no canceladas no pueden solaparse (a nivel de BD).
alter table citas drop constraint if exists citas_sin_solape;
alter table citas add constraint citas_sin_solape
  exclude using gist (tstzrange(inicio, fin) with &&)
  where (estado <> 'cancelada');

create index if not exists idx_citas_inicio on citas (inicio);

-- ─── FUNCIÓN: huecos ocupados SIN datos personales ────────
create or replace function citas_ocupadas(p_desde timestamptz, p_hasta timestamptz)
returns table (inicio timestamptz, fin timestamptz)
language sql security definer set search_path = public as $$
  select c.inicio, c.fin from citas c
  where c.estado <> 'cancelada' and c.inicio < p_hasta and c.fin > p_desde
$$;

-- ─── SEGURIDAD (RLS) ──────────────────────────────────────
alter table servicios enable row level security;
alter table horario   enable row level security;
alter table bloqueos  enable row level security;
alter table citas     enable row level security;

drop policy if exists "lectura publica servicios" on servicios;
create policy "lectura publica servicios" on servicios for select using (true);
drop policy if exists "lectura publica horario" on horario;
create policy "lectura publica horario" on horario for select using (true);
drop policy if exists "lectura publica bloqueos" on bloqueos;
create policy "lectura publica bloqueos" on bloqueos for select using (true);

drop policy if exists "alta publica citas" on citas;
create policy "alta publica citas" on citas for insert
  with check (inicio > now() and estado = 'pendiente');

drop policy if exists "barbero gestiona citas" on citas;
create policy "barbero gestiona citas" on citas for all to authenticated using (true) with check (true);
drop policy if exists "barbero gestiona servicios" on servicios;
create policy "barbero gestiona servicios" on servicios for all to authenticated using (true) with check (true);
drop policy if exists "barbero gestiona horario" on horario;
create policy "barbero gestiona horario" on horario for all to authenticated using (true) with check (true);
drop policy if exists "barbero gestiona bloqueos" on bloqueos;
create policy "barbero gestiona bloqueos" on bloqueos for all to authenticated using (true) with check (true);

grant execute on function citas_ocupadas(timestamptz, timestamptz) to anon, authenticated;

-- ─── DATOS DE EJEMPLO (precios reales; duración/horario a ajustar) ──
insert into servicios (nombre, descripcion, duracion_min, precio, icono, destacado, orden) values
  ('Corte', 'Incluye cejas, barba y diseños.', 30, 6, 'Scissors', true, 1),
  ('Mechas + Corte', 'Mechas y corte con acabado y peinado.', 75, 17, 'Paintbrush', false, 2),
  ('Tinte blanco + Corte', 'Coloración en blanco más corte completo.', 60, 20, 'PaintBucket', false, 3);

insert into horario (dia_semana, hora_inicio, hora_fin) values
  (1, '10:00', '14:00'), (1, '17:00', '21:00'),
  (2, '10:00', '14:00'), (2, '17:00', '21:00'),
  (3, '10:00', '14:00'), (3, '17:00', '21:00'),
  (4, '10:00', '14:00'), (4, '17:00', '21:00'),
  (5, '10:00', '14:00'), (5, '17:00', '21:00'),
  (6, '10:00', '14:00');
