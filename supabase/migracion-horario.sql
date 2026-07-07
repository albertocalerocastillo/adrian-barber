-- ════════════════════════════════════════════════════════════
--  Migración puntual: horario REAL de Adrián (de su ficha de Google).
--  Pega esto en Supabase → SQL Editor → Run (una sola vez).
--  Lunes 15:00–22:00 · Martes a Viernes 10:00–22:00 (seguido) ·
--  Sábado 10:00–16:00 · Domingo cerrado.
--  (dia_semana: 0=domingo … 6=sábado)
--  Alternativa sin SQL: editarlo desde el panel → Horario.
-- ════════════════════════════════════════════════════════════
delete from horario;
insert into horario (dia_semana, hora_inicio, hora_fin) values
  (1, '15:00', '22:00'),
  (2, '10:00', '22:00'),
  (3, '10:00', '22:00'),
  (4, '10:00', '22:00'),
  (5, '10:00', '22:00'),
  (6, '10:00', '16:00');
