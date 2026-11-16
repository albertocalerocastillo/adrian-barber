-- ════════════════════════════════════════════════════════════
--  Migración: REVISIÓN DE CALIDAD DE LA RESERVA WEB (16/11/2026)
--  Pega TODO esto en Supabase → SQL Editor → Run. Se puede repetir.
--
--  1. `creado_en` lo pone siempre la base de datos. Antes lo podía mandar
--     quien llamara a la API: con una fecha vieja se saltaba el freno de 20
--     reservas por hora, y con una fecha futura bloqueaba la reserva web.
--  2. El nombre del cliente se guarda limpio (sin espacios de sobra) y no
--     admite saltos de línea ni caracteres de control: con ellos se podían
--     colar líneas falsas (y enlaces) en el WhatsApp que recibe Adrián.
--  3. "60 días vista" se cuenta en días naturales de España, igual que en la
--     web: del primer día reservable se pueden elegir 60 días seguidos, a
--     cualquier hora. Antes la BD contaba 60 × 24 h desde este instante y
--     rechazaba horas del último día que la web sí ofrecía.
--  Todo lo demás de la función queda igual que en migracion-ajustes-adrian.sql.
-- ════════════════════════════════════════════════════════════

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

-- Citas que ya pudieran tener una fecha de alta en el futuro (no deberían existir):
-- se igualan a ahora para que no bloqueen el freno de reservas.
update citas set creado_en = now() where creado_en > now();

-- Comprobación: debe salir 0.
select count(*) as citas_con_alta_futura from citas where creado_en > now();

-- ─── 4. Guardar horario y servicios de una vez ───────────────
-- El panel guardaba borrando todo y escribiendo después: si la conexión se
-- cortaba entre medias, la web se quedaba sin horario o sin servicios. Ahora
-- es una sola operación: o se guarda entera o no cambia nada.
create or replace function guardar_horario(p_filas jsonb)
returns void
language plpgsql security invoker set search_path = public as $$
begin
  if not es_barbero() then
    raise exception 'SIN_PERMISO';
  end if;
  delete from horario where true;
  insert into horario (dia_semana, hora_inicio, hora_fin)
  select (f->>'dia_semana')::int, (f->>'hora_inicio')::time, (f->>'hora_fin')::time
    from jsonb_array_elements(p_filas) f;
end;
$$;

create or replace function guardar_servicios(p_filas jsonb)
returns void
language plpgsql security invoker set search_path = public as $$
begin
  if not es_barbero() then
    raise exception 'SIN_PERMISO';
  end if;
  delete from servicios where true;
  insert into servicios (nombre, descripcion, duracion_min, precio, icono, destacado, activo, reserva_online, orden)
  select nombre, descripcion, duracion_min, precio, icono, destacado, activo, reserva_online, orden
    from jsonb_populate_recordset(null::servicios, p_filas);
end;
$$;

revoke execute on function guardar_horario(jsonb) from public, anon;
revoke execute on function guardar_servicios(jsonb) from public, anon;
grant execute on function guardar_horario(jsonb) to authenticated;
grant execute on function guardar_servicios(jsonb) to authenticated;

-- ─── 5. El aviso a Adrián lo lanza también la base de datos ──
-- Antes solo lo pedía el navegador del cliente: si cerraba la página justo al
-- reservar, Adrián no se enteraba. Ahora, al guardarse una cita de la web, la
-- propia BD llama a la función del aviso (con pg_net, cuando la cita ya está
-- guardada). La función marca la cita antes de mandar el WhatsApp, así que
-- aunque la llamen la BD y el navegador a la vez, el aviso sale una sola vez.
-- ⚠️ Para que funcione hay que DESACTIVAR "Enforce JWT verification" en
-- Edge Functions → aviso-cita → Settings (la función no necesita sesión: solo
-- avisa de citas de la web que existen y aún no se han avisado).
create extension if not exists pg_net;

create or replace function avisar_cita_web()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.origen = 'web' then
    perform net.http_post(
      url     := 'https://ydzeqcujmohupzcmhrbk.supabase.co/functions/v1/aviso-cita',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body    := jsonb_build_object(
        'clienteMovil', new.cliente_movil,
        'inicio', to_char(new.inicio at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists avisar_cita_web on citas;
create trigger avisar_cita_web
  after insert on citas
  for each row execute function avisar_cita_web();
