// Utilidades de horario: estado de apertura en tiempo real y formato.
// Trabaja sobre la estructura de src/data/openingHours.ts (dia + tramos "HH:MM").
import type { HorarioDiaDTO } from '../services/dtos/HorarioDiaDTO'
import type { EstadoNegocioDTO } from '../services/dtos/EstadoNegocioDTO'
import type { EspecificacionHorarioDTO } from '../services/dtos/EspecificacionHorarioDTO'

// #region Constantes
// Minutos de una hora y días de una semana.
const MINUTOS_HORA = 60
const DIAS_SEMANA = 7

// Nombres de los días para schema.org (índice = Date.getDay(), 0 = domingo).
const DIAS_SCHEMA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
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

/**
 * Horario en el formato de schema.org para los datos estructurados de Google:
 * un elemento por tramo, con todos los días que lo comparten (de lunes a
 * domingo). Así Google lee el mismo horario que enseña la web.
 */
export const especificacionHorario = (horario: HorarioDiaDTO[]): EspecificacionHorarioDTO[] => {
  const result: EspecificacionHorarioDTO[] = []
  const ordenados = [...horario].sort((a, b) => ((a.dia + DIAS_SEMANA - 1) % DIAS_SEMANA) - ((b.dia + DIAS_SEMANA - 1) % DIAS_SEMANA))
  for (const { dia, tramos } of ordenados) {
    for (const [opens, closes] of tramos) {
      const igual = result.find((e) => e.opens === opens && e.closes === closes)
      if (igual) igual.dayOfWeek.push(DIAS_SCHEMA[dia])
      else result.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: [DIAS_SCHEMA[dia]], opens, closes })
    }
  }
  return result
}

/** Formatea los tramos de un día: "10:00–14:00 · 17:00–21:00" o "Cerrado". */
export const formatoTramos = (tramos: HorarioDiaDTO['tramos']): string => {
  if (!tramos || tramos.length === 0) return 'Cerrado'
  return tramos.map(([i, f]) => `${i}–${f}`).join('  ·  ')
}
