-- ════════════════════════════════════════════════════════════
--  Esquema de base de datos — A.S Barbería (Supabase / PostgreSQL)
--  Fase 2: reserva de citas.
--  Cómo usarlo: Supabase → SQL Editor → pegar y ejecutar este archivo,
--  luego policies.sql y (opcional) seed.sql.
-- ════════════════════════════════════════════════════════════

-- Necesario para la exclusion constraint con tipos no-rango (btree) + rango (gist).
create extension if not exists btree_gist;

-- ─── SERVICIOS ────────────────────────────────────────────
create table if not exists servicios (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  descripcion text,
  duracion_min int  not null check (duracion_min > 0), -- clave para los huecos
  precio      numeric(10,2) not null default 0,
  icono       text,                                     -- nombre icono lucide
  destacado   boolean default false,
  activo      boolean default true,
  orden       int     default 0,
  creado_en   timestamptz default now()
);

-- ─── HORARIO DE TRABAJO (semanal recurrente) ──────────────
-- Varias filas por día = jornada partida (mañana y tarde).
create table if not exists horario (
  id          bigint generated always as identity primary key,
  dia_semana  int  not null check (dia_semana between 0 and 6), -- 0=domingo
  hora_inicio time not null,
  hora_fin    time not null,
  check (hora_fin > hora_inicio)
);

-- ─── BLOQUEOS (descansos, vacaciones, huecos puntuales) ───
create table if not exists bloqueos (
  id        bigint generated always as identity primary key,
  inicio    timestamptz not null,
  fin       timestamptz not null,
  motivo    text,
  creado_en timestamptz default now(),
  check (fin > inicio)
);

-- ─── CITAS ────────────────────────────────────────────────
create table if not exists citas (
  id             bigint generated always as identity primary key,
  servicio_id    bigint references servicios(id),
  servicio_nombre text,                 -- copia legible (histórico aunque cambie el servicio)
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

-- 🔒 SEGURO ANTI-DOBLE-RESERVA (a nivel de BD):
-- dos citas NO canceladas no pueden solaparse en el tiempo. Aunque dos
-- clientes confirmen el mismo segundo, la BD rechaza la segunda.
alter table citas drop constraint if exists citas_sin_solape;
alter table citas add constraint citas_sin_solape
  exclude using gist (tstzrange(inicio, fin) with &&)
  where (estado <> 'cancelada');

create index if not exists idx_citas_inicio on citas (inicio);

-- ─── FUNCIÓN: huecos ocupados SIN datos personales ────────
-- El público necesita saber qué franjas están pille para calcular huecos,
-- pero NO debe ver nombres/teléfonos. Esta función devuelve solo inicio/fin.
create or replace function citas_ocupadas(p_desde timestamptz, p_hasta timestamptz)
returns table (inicio timestamptz, fin timestamptz)
language sql
security definer
set search_path = public
as $$
  select c.inicio, c.fin
  from citas c
  where c.estado <> 'cancelada'
    and c.inicio < p_hasta
    and c.fin > p_desde
$$;
