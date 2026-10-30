// Utilidades de horario: estado de apertura en tiempo real y formato.
// Trabaja sobre la estructura de src/data/openingHours.ts (dia + tramos "HH:MM").
import type { HorarioDiaDTO } from '../services/dtos/HorarioDiaDTO'
import type { EstadoNegocioDTO } from '../services/dtos/EstadoNegocioDTO'

// #region Constantes
// Minutos de una hora y días de una semana.
const MINUTOS_HORA = 60
const DIAS_SEMANA = 7
// #endregion

/** Convierte "HH:MM" a minutos desde medianoche. */
const aMinutos = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * MINUTOS_HORA + m
}

/**
 * Calcula el estado de apertura para una fecha dada (por defecto, ahora).
 * Devuelve si está abierto y la hora a la que cierra o abre.
 */
export const estadoNegocio = (horario: HorarioDiaDTO[], fecha: Date = new Date()): EstadoNegocioDTO => {
  const dia = fecha.getDay()
  const ahora = fecha.getHours() * MINUTOS_HORA + fecha.getMinutes()
  const hoy = horario.find((h) => h.dia === dia)

  if (hoy) {
    for (const [ini, fin] of hoy.tramos) {
      const desde = aMinutos(ini)
      const hasta = aMinutos(fin)
      if (ahora >= desde && ahora < hasta) {
        return { abierto: true, cierraA: fin, abreA: null }
      }
      if (ahora < desde) {
        // Aún no ha abierto este tramo de hoy.
        return { abierto: false, cierraA: null, abreA: ini, hoy: true }
      }
    }
  }

  // Cerrado el resto del día: buscar el próximo día con tramos.
  for (let i = 1; i <= DIAS_SEMANA; i++) {
    const d = (dia + i) % DIAS_SEMANA
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
export const diaHoy = (fecha: Date = new Date()): number => {
  return fecha.getDay()
}

/** Formatea los tramos de un día: "10:00–14:00 · 17:00–21:00" o "Cerrado". */
export const formatoTramos = (tramos: HorarioDiaDTO['tramos']): string => {
  if (!tramos || tramos.length === 0) return 'Cerrado'
  return tramos.map(([i, f]) => `${i}–${f}`).join('  ·  ')
}
