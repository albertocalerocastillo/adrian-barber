// Utilidades de horario: estado de apertura en tiempo real y formato.
// Trabaja sobre la estructura de src/data/horarios.js (dia + tramos "HH:MM").

/** Convierte "HH:MM" a minutos desde medianoche. */
function aMinutos(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/**
 * Calcula el estado de apertura para una fecha dada (por defecto, ahora).
 * Devuelve:
 *  - abierto: boolean
 *  - cierraA / abreA: "HH:MM" relevante según el estado (puede ser null)
 *  - proximoDia: nombre del próximo día con horario (si hoy ya cerró/cerrado)
 */
export function estadoNegocio(horario, fecha = new Date()) {
  const dia = fecha.getDay()
  const ahora = fecha.getHours() * 60 + fecha.getMinutes()
  const hoy = horario.find((h) => h.dia === dia)

  if (hoy) {
    for (const [ini, fin] of hoy.tramos) {
      const desde = aMinutos(ini)
      const hasta = aMinutos(fin)
      if (ahora >= desde && ahora < hasta) {
        return { abierto: true, cierraA: fin, abreA: null }
      }
      if (ahora < desde) {
        // Aún no ha abierto este tramo de hoy
        return { abierto: false, cierraA: null, abreA: ini, hoy: true }
      }
    }
  }

  // Cerrado el resto del día: buscar el próximo día con tramos
  for (let i = 1; i <= 7; i++) {
    const d = (dia + i) % 7
    const prox = horario.find((h) => h.dia === d && h.tramos.length > 0)
    if (prox) {
      return {
        abierto: false,
        cierraA: null,
        abreA: prox.tramos[0][0],
        proximoDia: prox.nombre,
      }
    }
  }

  return { abierto: false, cierraA: null, abreA: null }
}

/** Devuelve el índice (getDay) del día de hoy, para resaltarlo en la lista. */
export function diaHoy(fecha = new Date()) {
  return fecha.getDay()
}

/** Formatea los tramos de un día: "10:00–14:00 · 17:00–21:00" o "Cerrado". */
export function formatoTramos(tramos) {
  if (!tramos || tramos.length === 0) return 'Cerrado'
  return tramos.map(([i, f]) => `${i}–${f}`).join('  ·  ')
}
