-- ════════════════════════════════════════════════════════════
--  Migración: APERTURAS EXTRA (17/11/2026)
--  Pega TODO esto en Supabase → SQL Editor → Run. Se puede repetir.
--  Requiere haber ejecutado antes migracion-calidad.sql.
--
--  Un día que normalmente se cierra (un sábado, por ejemplo) se puede abrir
--  de forma excepcional, con su horario, desde el panel ("Abrir este día").
--  La tabla `aperturas` es lo contrario de `bloqueos`: ratos que se trabaja
--  aunque el horario de la semana diga que no.
--   - La web los lee (solo horas, sin datos personales) para ofrecer esas
--     horas al reservar online.
--   - La base de datos acepta las reservas que caen dentro de una apertura.
-- ════════════════════════════════════════════════════════════

create table if not exists aperturas (
  id        bigint generated always as identity primary key,
  inicio    timestamptz not null,
  fin       timestamptz not null,
  creado_en timestamptz not null default now(),
  constraint aperturas_fin_despues check (fin > inicio)
);

alter table aperturas enable row level security;

drop policy if exists "lectura publica aperturas" on aperturas;
create policy "lectura publica aperturas" on aperturas
  for select to anon, authenticated using (true);

drop policy if exists "barbero gestiona aperturas" on aperturas;
create policy "barbero gestiona aperturas" on aperturas
  for all to authenticated using (es_barbero()) with check (es_barbero());

create or replace function validar_cita_web()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  a record;
  zona constant text := 'Europe/Madrid';
  ini_local timestamp := new.inicio at time zone zona;
  fin_local timestamp := new.fin    at time zone zona;
  ultimo_dia date;
  dur_min int;
begin
  if es_barbero() then
    return new;
  end if;

  select * into a from reserva_ajustes();

  new.origen     := 'web';
  new.estado     := 'pendiente';
  new.notas      := null;
  new.avisado_en := null;
  new.creado_en  := now();

  if coalesce(new.cliente_nombre, '') ~ '[[:cntrl:]]' then
    raise exception 'DATOS_NO_VALIDOS';
  end if;
  new.cliente_nombre := regexp_replace(trim(coalesce(new.cliente_nombre, '')), '\s+', ' ', 'g');
  if length(new.cliente_nombre) not between 2 and 60 then
    raise exception 'DATOS_NO_VALIDOS';
  end if;
  if new.cliente_movil !~ '^[6789][0-9]{8}$' then
    raise exception 'DATOS_NO_VALIDOS';
  end if;

  if new.inicio < a.desde then
    raise exception 'ANTES_DE_INICIO';
  end if;
  if new.inicio < now() + make_interval(mins => a.antelacion_min) then
    raise exception 'SIN_ANTELACION';
  end if;
  ultimo_dia := (greatest(now(), a.desde) at time zone zona)::date + (a.dias_max - 1);
  if ini_local::date > ultimo_dia then
    raise exception 'DEMASIADO_LEJOS';
  end if;

  dur_min := extract(epoch from (new.fin - new.inicio))::int / 60;
  if not exists (
    select 1 from servicios s
     where s.activo and s.reserva_online
       and s.nombre = new.servicio_nombre and s.duracion_min = dur_min
  ) then
    raise exception 'SERVICIO_NO_VALIDO';
  end if;

  -- Vale si cabe en el horario de la semana O en una apertura extra de ese día.
  if not (
    (ini_local::date = fin_local::date and exists (
      select 1 from horario h
       where h.dia_semana = extract(dow from ini_local)::int
         and ini_local::time >= h.hora_inicio
         and fin_local::time <= h.hora_fin
    ))
    or exists (select 1 from aperturas ap where ap.inicio <= new.inicio and ap.fin >= new.fin)
  ) then
    raise exception 'FUERA_DE_HORARIO';
  end if;

  if exists (select 1 from bloqueos b where b.inicio < new.fin and b.fin > new.inicio) then
    raise exception 'DIA_CERRADO';
  end if;

  if (
    select count(*) from citas c
     where c.cliente_movil = new.cliente_movil
       and c.estado = 'pendiente'
       and c.inicio > now()
  ) >= a.max_pendientes then
    raise exception 'DEMASIADAS_CITAS';
  end if;

  if (
    select count(*) from citas c
     where c.origen = 'web' and c.creado_en > now() - interval '1 hour'
  ) >= 20 then
    raise exception 'DEMASIADAS_RESERVAS';
  end if;

  return new;
end;
$$;
