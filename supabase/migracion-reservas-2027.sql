-- ════════════════════════════════════════════════════════════
--  Migración: RESERVA ONLINE BLINDADA (26/10/2026)
--  Pega TODO esto en Supabase → SQL Editor → Run (una sola vez).
--  Se puede volver a ejecutar sin romper nada.
--
--  ⚠️ EJECUTARLA ANTES de publicar la web con la reserva online activa.
--
--  Qué arregla:
--   1. Los DÍAS LIBRES no contaban en la web: un cliente podía reservar en
--      plenas vacaciones. Ahora `citas_ocupadas` devuelve también los ratos
--      cerrados (solo las horas, sin el motivo).
--   2. El MOTIVO de los días libres ("Médico"…) lo podía leer cualquiera.
--      Ahora solo lo ve el barbero.
--   3. Cualquiera con la clave pública podía meter citas a cualquier hora (a
--      las 3 de la mañana, de 10 horas, en un día cerrado) o llenar la agenda
--      entera con un script. Ahora la BASE DE DATOS comprueba cada reserva de
--      la web: fecha mínima (2027), antelación, horario, días libres,
--      duración del servicio y máximo de citas pendientes por móvil.
--   4. Las citas guardan de dónde vienen (`origen`: web o panel) y si ya se
--      avisó por WhatsApp (`avisado_en`), para no mandar el aviso dos veces.
--
--  Los valores de la reserva (fecha de inicio, antelación…) están en la
--  función `reserva_ajustes()` de abajo. Si se cambian, cambiar también
--  src/data/features.js para que la web y la BD digan lo mismo.
-- ════════════════════════════════════════════════════════════

-- ─── 1. Columnas nuevas en citas ──────────────────────────
alter table citas add column if not exists origen text not null default 'panel';
alter table citas add column if not exists avisado_en timestamptz;

-- ─── 2. Ajustes de la reserva online (una sola fuente en la BD) ──
create or replace function reserva_ajustes()
returns table (
  desde          timestamptz, -- primer momento reservable
  antelacion_min int,         -- minutos mínimos desde ahora
  dias_max       int,         -- días vista (contados desde `desde` si aún no ha llegado)
  max_pendientes int          -- citas futuras pendientes por móvil
)
language sql stable as $$
  select
    timestamptz '2027-01-01 00:00 Europe/Madrid',
    60,
    60,
    2
$$;

-- ─── 3. Huecos ocupados = citas + días libres, sin datos personales ──
create or replace function citas_ocupadas(p_desde timestamptz, p_hasta timestamptz)
returns table (inicio timestamptz, fin timestamptz)
language sql stable security definer set search_path = public as $$
  select c.inicio, c.fin from citas c
   where c.estado <> 'cancelada' and c.inicio < p_hasta and c.fin > p_desde
  union all
  select b.inicio, b.fin from bloqueos b
   where b.inicio < p_hasta and b.fin > p_desde
$$;
grant execute on function citas_ocupadas(timestamptz, timestamptz) to anon, authenticated;

-- El motivo de los días libres deja de ser público (el panel, autenticado,
-- los sigue leyendo con su propia política).
drop policy if exists "lectura publica bloqueos" on bloqueos;

-- ─── 4. Validación de las reservas que llegan desde la WEB ──
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
  -- El barbero (panel, sesión iniciada) puede meter lo que quiera.
  if coalesce(auth.jwt() ->> 'role', 'anon') = 'authenticated' then
    return new;
  end if;

  select * into a from reserva_ajustes();

  new.origen     := 'web';
  new.estado     := 'pendiente';
  new.notas      := null;
  new.avisado_en := null;

  -- Datos del cliente
  if length(trim(coalesce(new.cliente_nombre, ''))) not between 2 and 60 then
    raise exception 'DATOS_NO_VALIDOS';
  end if;
  if new.cliente_movil !~ '^[6789][0-9]{8}$' then
    raise exception 'DATOS_NO_VALIDOS';
  end if;

  -- Fechas permitidas
  if new.inicio < a.desde then
    raise exception 'ANTES_DE_INICIO';
  end if;
  if new.inicio < now() + make_interval(mins => a.antelacion_min) then
    raise exception 'SIN_ANTELACION';
  end if;
  -- La ventana cuenta desde que se abre la reserva: en octubre de 2026 ya se
  -- puede coger cita para enero y febrero de 2027.
  if new.inicio > greatest(now(), a.desde) + make_interval(days => a.dias_max) then
    raise exception 'DEMASIADO_LEJOS';
  end if;

  -- El servicio existe, está activo y dura lo que dice
  dur_min := extract(epoch from (new.fin - new.inicio))::int / 60;
  if not exists (
    select 1 from servicios s
     where s.activo and s.nombre = new.servicio_nombre and s.duracion_min = dur_min
  ) then
    raise exception 'SERVICIO_NO_VALIDO';
  end if;

  -- Cabe entero dentro de un tramo del horario (en hora de España)
  if ini_local::date <> fin_local::date or not exists (
    select 1 from horario h
     where h.dia_semana = extract(dow from ini_local)::int
       and ini_local::time >= h.hora_inicio
       and fin_local::time <= h.hora_fin
  ) then
    raise exception 'FUERA_DE_HORARIO';
  end if;

  -- No cae en un día libre
  if exists (select 1 from bloqueos b where b.inicio < new.fin and b.fin > new.inicio) then
    raise exception 'DIA_CERRADO';
  end if;

  -- Freno a quien intenta llenar la agenda
  if (
    select count(*) from citas c
     where c.cliente_movil = new.cliente_movil
       and c.estado = 'pendiente'
       and c.inicio > now()
  ) >= a.max_pendientes then
    raise exception 'DEMASIADAS_CITAS';
  end if;

  return new;
end;
$$;

drop trigger if exists validar_cita_web on citas;
create trigger validar_cita_web
  before insert on citas
  for each row execute function validar_cita_web();

-- La política de alta pública se queda igual (cita futura y pendiente): el
-- trigger de arriba hace el resto de comprobaciones.
drop policy if exists "alta publica citas" on citas;
create policy "alta publica citas" on citas
  for insert to anon
  with check (inicio > now() and estado = 'pendiente');
