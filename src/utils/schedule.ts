// Utilidades de horario: estado de apertura en tiempo real y formato.
// Trabaja sobre la estructura de src/data/openingHours.ts (dia + tramos "HH:MM").
import type { HorarioDiaDTO } from '../services/dtos/HorarioDiaDTO'
import type { EstadoNegocioDTO } from '../services/dtos/EstadoNegocioDTO'
import type { EspecificacionHorarioDTO } from '../services/dtos/EspecificacionHorarioDTO'
import type { OcupadoDTO } from '../services/dtos/OcupadoDTO'
import { formatTime, formatTimeInZone, toInputDate } from './dates'

// #region Constantes
// Minutos de una hora y días de una semana.
const MINUTOS_HORA = 60
const DIAS_SEMANA = 7

// Última hora de un día, para un tramo que acaba a medianoche.
const FIN_DEL_DIA = '23:59'

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

/** "AAAA-MM-DD" del instante, en la zona dada (o en la del navegador). */
const claveDia = (instante: Date, zona?: string): string =>
  zona
    ? new Intl.DateTimeFormat('en-CA', { timeZone: zona, year: 'numeric', month: '2-digit', day: '2-digit' }).format(instante)
    : toInputDate(instante)

/** Junta los tramos que se pisan o se tocan ("10:00–14:00" + "13:00–16:00" → "10:00–16:00"). */
const juntarTramos = (tramos: HorarioDiaDTO['tramos']): HorarioDiaDTO['tramos'] => {
  const result: HorarioDiaDTO['tramos'] = []
  for (const [ini, fin] of [...tramos].sort((a, b) => a[0].localeCompare(b[0]))) {
    const ultimo = result[result.length - 1]
    if (ultimo && ini <= ultimo[1]) ultimo[1] = fin > ultimo[1] ? fin : ultimo[1]
    else result.push([ini, fin])
  }
  return result
}

/**
 * Horario de la semana con las APERTURAS EXTRA del día `dia` añadidas a su día
 * de la semana. Se usa en todo lo que mira un día concreto (huecos libres, día
 * abierto o cerrado): así un sábado abierto de forma excepcional cuenta como
 * abierto ese sábado, y solo ese. `zona` es la del negocio en la web pública
 * (las horas se leen con el reloj de España); el panel usa la del navegador.
 */
export const horarioDelDia = (dia: Date, horario: HorarioDiaDTO[], aperturas: OcupadoDTO[] = [], zona?: string): HorarioDiaDTO[] => {
  const clave = toInputDate(dia)
  const hora = (instante: Date) => (zona ? formatTimeInZone(instante, zona) : formatTime(instante))
  const extra = aperturas
    .filter((a) => claveDia(new Date(a.inicio), zona) === clave)
    .map((a): [string, string] => {
      const fin = new Date(a.fin)
      // Si acaba otro día (a medianoche), el tramo llega hasta el final de este.
      return [hora(new Date(a.inicio)), claveDia(fin, zona) === clave ? hora(fin) : FIN_DEL_DIA]
    })
  if (extra.length === 0) return horario

  const diaSemana = dia.getDay()
  const base = horario.some((h) => h.dia === diaSemana) ? horario : [...horario, { dia: diaSemana, nombre: '', tramos: [] }]
  const result = base.map((h) => (h.dia === diaSemana ? { ...h, tramos: juntarTramos([...h.tramos, ...extra]) } : h))
  return result
}
