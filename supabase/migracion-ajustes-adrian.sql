-- ════════════════════════════════════════════════════════════
--  Migración: AJUSTES DE ADRIÁN (29/10/2026)
--  Pega TODO esto en Supabase → SQL Editor → Run. Se puede repetir.
--
--  1. Servicios que solo se piden por WhatsApp (mechas y tinte): siguen
--     saliendo en la web con su precio, pero no se pueden reservar online.
--     Desde el panel se cambia con el interruptor "Se reserva online".
--  2. Horario: lunes a viernes de 9:00 a 22:00, comida de 14:00 a 14:30.
--  3. La base de datos también rechaza reservar online un servicio que
--     no lo permite (por si alguien se salta la web).
-- ════════════════════════════════════════════════════════════

-- ─── 1. Servicios ─────────────────────────────────────────
alter table servicios add column if not exists reserva_online boolean not null default true;

update servicios set reserva_online = false
 where nombre ilike '%mechas%' or nombre ilike '%tinte%';

update servicios set duracion_min = 30 where nombre = 'Corte';

-- ─── 2. Horario ───────────────────────────────────────────
delete from horario;
insert into horario (dia_semana, hora_inicio, hora_fin)
select d, t.ini, t.fin
  from generate_series(1, 5) d
 cross join (values ('09:00'::time, '14:00'::time), ('14:30'::time, '22:00'::time)) t(ini, fin);

-- ─── 3. Las reservas web solo para servicios con reserva online ──
create or replace function validar_cita_web()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  a record;
  zona constant text := 'Europe/Madrid';
  ini_local timestamp := new.inicio at time zone zona;
  fin_local timestamp := new.fin    at time zone zona;
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

  if length(trim(coalesce(new.cliente_nombre, ''))) not between 2 and 60 then
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
  if new.inicio > greatest(now(), a.desde) + make_interval(days => a.dias_max) then
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

  if ini_local::date <> fin_local::date or not exists (
    select 1 from horario h
     where h.dia_semana = extract(dow from ini_local)::int
       and ini_local::time >= h.hora_inicio
       and fin_local::time <= h.hora_fin
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

-- Comprobación: deberías ver Corte con reserva_online = true y los otros dos false.
select nombre, duracion_min, precio, activo, reserva_online from servicios order by orden;
