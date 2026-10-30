// Horario de trabajo de A.S Barbería (fallback estático).
// Datos REALES tomados de la ficha de Google de Adrián. La fuente de verdad en
// producción es la tabla `horario` de Supabase (editable desde el panel); esto
// solo se usa si no hay Supabase configurado.
//
// dia: 0=domingo ... 6=sábado (igual que Date.getDay()).
// tramos: array de [horaInicio, horaFin] en formato "HH:MM" (24h).
//         Varios tramos = jornada partida (mañana y tarde).
//         Array vacío = cerrado ese día.

// Confirmado por Adrián el 29/10/2026: lunes a viernes de 9:00 a 22:00 con
// media hora para comer (14:00–14:30); sábado y domingo cerrado.
export const HORARIO = [
  { dia: 1, nombre: 'Lunes',     tramos: [['09:00', '14:00'], ['14:30', '22:00']] },
  { dia: 2, nombre: 'Martes',    tramos: [['09:00', '14:00'], ['14:30', '22:00']] },
  { dia: 3, nombre: 'Miércoles', tramos: [['09:00', '14:00'], ['14:30', '22:00']] },
  { dia: 4, nombre: 'Jueves',    tramos: [['09:00', '14:00'], ['14:30', '22:00']] },
  { dia: 5, nombre: 'Viernes',   tramos: [['09:00', '14:00'], ['14:30', '22:00']] },
  { dia: 6, nombre: 'Sábado',    tramos: [] },
  { dia: 0, nombre: 'Domingo',   tramos: [] },
]
