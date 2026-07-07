-- ════════════════════════════════════════════════════════════
--  Migración puntual: iconos más claros para los servicios combinados.
--  Pega esto en Supabase → SQL Editor → Run (una sola vez).
--  Mechas + Corte  → Paintbrush   (se "pintan" las mechas)
--  Tinte + Corte   → PaintBucket  (bañar de color)
--  El "Corte" se queda con Scissors.
-- ════════════════════════════════════════════════════════════
update servicios set icono = 'Paintbrush'  where nombre = 'Mechas + Corte';
update servicios set icono = 'PaintBucket' where nombre = 'Tinte blanco + Corte';
