-- ════════════════════════════════════════════════════════════
--  Migración puntual: horario CORREGIDO (18/09/2026).
--  Pega esto en Supabase → SQL Editor → Run (una sola vez).
--
--  Verificado contra la ficha de Google de Adrián:
--      Lunes a Viernes 10:00–22:00 · Sábado y Domingo CERRADO
--
--  Corrige dos errores que tenía la web:
--    · Lunes: decía que abría a las 15:00 (abre a las 10:00) → se perdían
--      5 horas de clientes cada lunes.
--    · Sábado: decía 10:00–16:00 cuando está CERRADO → alguien podía
--      plantarse en la puerta un sábado.
--
--  (dia_semana: 0=domingo … 6=sábado)
--  Alternativa sin SQL: panel → Horario, y marcar el sábado como "Día libre".
-- ════════════════════════════════════════════════════════════
delete from horario;
insert into horario (dia_semana, hora_inicio, hora_fin) values
  (1, '10:00', '22:00'),
  (2, '10:00', '22:00'),
  (3, '10:00', '22:00'),
  (4, '10:00', '22:00'),
  (5, '10:00', '22:00');
