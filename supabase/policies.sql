-- ════════════════════════════════════════════════════════════
--  Seguridad (RLS) — A.S Barbería
--  Ejecutar DESPUÉS de schema.sql.
--  Idea: el público puede ver el catálogo/horario y CREAR una cita,
--  pero NO puede leer los datos de las citas de otros clientes.
--  El barbero (autenticado, Fase 3) gestiona todo.
-- ════════════════════════════════════════════════════════════

alter table servicios enable row level security;
alter table horario   enable row level security;
alter table bloqueos  enable row level security;
alter table citas     enable row level security;

-- ── Lectura pública del catálogo, horario y bloqueos ──
drop policy if exists "lectura publica servicios" on servicios;
create policy "lectura publica servicios" on servicios
  for select using (true);

drop policy if exists "lectura publica horario" on horario;
create policy "lectura publica horario" on horario
  for select using (true);

drop policy if exists "lectura publica bloqueos" on bloqueos;
create policy "lectura publica bloqueos" on bloqueos
  for select using (true);

-- ── Citas: el público puede CREAR (reservar), no leer ──
-- Solo se permite alta de citas futuras y en estado 'pendiente'.
drop policy if exists "alta publica citas" on citas;
create policy "alta publica citas" on citas
  for insert
  with check (inicio > now() and estado = 'pendiente');

-- ── El barbero autenticado gestiona TODO (Fase 3: panel) ──
drop policy if exists "barbero gestiona citas" on citas;
create policy "barbero gestiona citas" on citas
  for all to authenticated using (true) with check (true);

drop policy if exists "barbero gestiona servicios" on servicios;
create policy "barbero gestiona servicios" on servicios
  for all to authenticated using (true) with check (true);

drop policy if exists "barbero gestiona horario" on horario;
create policy "barbero gestiona horario" on horario
  for all to authenticated using (true) with check (true);

drop policy if exists "barbero gestiona bloqueos" on bloqueos;
create policy "barbero gestiona bloqueos" on bloqueos
  for all to authenticated using (true) with check (true);

-- ── Permiso para llamar a la función de huecos ocupados ──
grant execute on function citas_ocupadas(timestamptz, timestamptz) to anon, authenticated;
