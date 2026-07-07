-- ════════════════════════════════════════════════════════════
--  Datos iniciales — A.S Barbería (opcional)
--  Ejecutar DESPUÉS de schema.sql + policies.sql.
--  ⚠️ Precios REALES; DURACIONES y HORARIO son de EJEMPLO: ajústalos
--     a los reales de Adrián (o edítalos luego desde el panel en Fase 3).
-- ════════════════════════════════════════════════════════════

-- ── Servicios ──
insert into servicios (nombre, descripcion, duracion_min, precio, icono, destacado, orden) values
  ('Corte', 'Incluye cejas, barba y diseños.', 30, 6, 'Scissors', true, 1),
  ('Mechas + Corte', 'Mechas y corte con acabado y peinado.', 75, 17, 'Paintbrush', false, 2),
  ('Tinte blanco + Corte', 'Coloración en blanco más corte completo.', 60, 20, 'PaintBucket', false, 3);

-- ── Horario (0=domingo … 6=sábado) ──
insert into horario (dia_semana, hora_inicio, hora_fin) values
  (1, '10:00', '14:00'), (1, '17:00', '21:00'),
  (2, '10:00', '14:00'), (2, '17:00', '21:00'),
  (3, '10:00', '14:00'), (3, '17:00', '21:00'),
  (4, '10:00', '14:00'), (4, '17:00', '21:00'),
  (5, '10:00', '14:00'), (5, '17:00', '21:00'),
  (6, '10:00', '14:00');
