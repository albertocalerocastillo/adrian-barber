// Horario de trabajo de A.S Barbería.
// ⚠️ DATOS DE EJEMPLO (Fase 1) — pendientes de confirmar con Adrián.
//    En la Fase 2 pasarán a la tabla `horario` de Supabase y serán la base
//    del cálculo de huecos libres para la reserva online.
//
// dia: 0=domingo ... 6=sábado (igual que Date.getDay()).
// tramos: array de [horaInicio, horaFin] en formato "HH:MM" (24h).
//         Varios tramos = jornada partida (mañana y tarde).
//         Array vacío = cerrado ese día.

export const HORARIO = [
  { dia: 1, nombre: 'Lunes',     tramos: [['10:00', '14:00'], ['17:00', '21:00']] },
  { dia: 2, nombre: 'Martes',    tramos: [['10:00', '14:00'], ['17:00', '21:00']] },
  { dia: 3, nombre: 'Miércoles', tramos: [['10:00', '14:00'], ['17:00', '21:00']] },
  { dia: 4, nombre: 'Jueves',    tramos: [['10:00', '14:00'], ['17:00', '21:00']] },
  { dia: 5, nombre: 'Viernes',   tramos: [['10:00', '14:00'], ['17:00', '21:00']] },
  { dia: 6, nombre: 'Sábado',    tramos: [['10:00', '14:00']] },
  { dia: 0, nombre: 'Domingo',   tramos: [] },
]
