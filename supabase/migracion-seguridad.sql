-- ════════════════════════════════════════════════════════════
--  Migración: SOLO EL BARBERO ENTRA AL PANEL (26/10/2026)
--  Pega TODO esto en Supabase → SQL Editor → Run. Se puede repetir.
--
--  El fallo: las normas daban permiso total a CUALQUIER usuario con sesión
--  iniciada ("to authenticated using (true)"), y el registro de Supabase
--  estaba abierto. Cualquiera podía crearse una cuenta con su email y leer
--  los nombres y móviles de todos los clientes, borrar citas o cambiar
--  precios.
--
--  El arreglo: una lista de cuentas autorizadas (`barberos`). Solo esas
--  pueden tocar citas, horario, servicios y días libres. Una cuenta que no
--  esté en la lista, aunque inicie sesión, no ve ni toca nada.
--
--  ⚠️ DESPUÉS de ejecutar esto, añade tu cuenta (y luego la de Adrián) con
--     el bloque "AÑADIR UN BARBERO" del final, o el panel se quedará vacío.
-- ════════════════════════════════════════════════════════════

-- ─── 1. Lista de cuentas autorizadas ──────────────────────
create table if not exists barberos (
  user_id   uuid primary key references auth.users (id) on delete cascade,
  creado_en timestamptz default now()
);
alter table barberos enable row level security;
-- Sin políticas: nadie la lee ni la escribe desde la web; solo desde aquí.

-- ¿La sesión actual es de un barbero autorizado?
create or replace function es_barbero()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from barberos where user_id = auth.uid())
$$;
grant execute on function es_barbero() to anon, authenticated;

-- ─── 2. Las normas del panel pasan a exigir ser barbero ──
drop policy if exists "barbero gestiona citas" on citas;
create policy "barbero gestiona citas" on citas
  for all to authenticated using (es_barbero()) with check (es_barbero());

drop policy if exists "barbero gestiona servicios" on servicios;
create policy "barbero gestiona servicios" on servicios
  for all to authenticated using (es_barbero()) with check (es_barbero());

drop policy if exists "barbero gestiona horario" on horario;
create policy "barbero gestiona horario" on horario
  for all to authenticated using (es_barbero()) with check (es_barbero());

drop policy if exists "barbero gestiona bloqueos" on bloqueos;
create policy "barbero gestiona bloqueos" on bloqueos
  for all to authenticated using (es_barbero()) with check (es_barbero());

-- ─── 3. Las reservas: solo el barbero se salta las comprobaciones ──
-- (Antes bastaba con tener sesión. Ahora un usuario cualquiera con sesión se
--  trata igual que un cliente de la web.) Además, freno global: como mucho
--  20 reservas desde la web por hora, para que un programa no pueda llenar
--  la agenda cambiando de móvil.
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
     where s.activo and s.nombre = new.servicio_nombre and s.duracion_min = dur_min
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

-- Las reservas de la web también puede hacerlas alguien con sesión que no
-- sea barbero: que pase por las mismas comprobaciones que un cliente.
drop policy if exists "alta publica citas" on citas;
create policy "alta publica citas" on citas
  for insert to anon, authenticated
  with check (inicio > now() and estado = 'pendiente');

-- ════════════════════════════════════════════════════════════
--  VER QUIÉN TIENE CUENTA (ejecútalo aparte si quieres revisarlo):
--
--    select email, created_at, last_sign_in_at from auth.users order by created_at;
--
--  Si sale algún email que no conoces, alguien se registró: bórralo en
--  Authentication → Users.
-- ════════════════════════════════════════════════════════════
--  AÑADIR UN BARBERO (cambia el email y ejecútalo; uno por cuenta):
--
--    insert into barberos (user_id)
--    select id from auth.users where email = 'TU-EMAIL@ejemplo.com'
--    on conflict do nothing;
-- ════════════════════════════════════════════════════════════
