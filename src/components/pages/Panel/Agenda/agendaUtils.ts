// #region Imports
import { atTime, addMinutes, MINUTES_PER_DAY } from '../../../../utils/availability'
import { formatShortDate, isSameDay } from '../../../../utils/dates'
import type { BloqueoDTO } from '../../../../services/dtos/BloqueoDTO'
import type { HorarioDiaDTO } from '../../../../services/dtos/HorarioDiaDTO'
// #endregion

// #region Constantes
// Huecos más cortos que esto no se ofrecen como "libre" (no cabe un corte).
const HUECO_MINIMO = 30

// Los huecos de hoy empiezan en el siguiente cuarto de hora.
const REDONDEO_HUECO_MIN = 15

// Milisegundos de un minuto.
const MS_MINUTO = 60000

// Días de una semana.
export const DIAS_SEMANA = 7

// Hora a la que el saludo pasa a "Buenas tardes" y a "Buenas noches".
const HORA_TARDE = 14
const HORA_NOCHE = 21

// Idioma de los nombres de los meses.
const IDIOMA = 'es-ES'
// #endregion

// #region Interfaces
/** Rato libre del horario en el que cabe una cita. */
export interface HuecoLibre {
  /** Inicio del rato libre. */
  inicio: Date;
  /** Fin del rato libre. */
  fin: Date;
}

/** Rato ocupado del día (cita o bloqueo), con las fechas en ISO. */
export interface RatoOcupado {
  /** Inicio (ISO). */
  inicio: string;
  /** Fin (ISO). */
  fin: string;
}
// #endregion

// #region Textos
/** Pone en mayúscula la primera letra. */
export const capital = (texto: string): string => {
  const result = texto.charAt(0).toUpperCase() + texto.slice(1)
  return result
}

/** "Buenos días", "Buenas tardes" o "Buenas noches" según la hora. */
export const saludo = (fecha: Date): string => {
  const hora = fecha.getHours()
  const result = hora < HORA_TARDE ? 'Buenos días' : hora < HORA_NOCHE ? 'Buenas tardes' : 'Buenas noches'
  return result
}

/** "Noviembre 2026" (o "Nov 2026" con `corto`, para el móvil). */
export const rotuloMes = (fecha: Date, corto = false): string => {
  const nombre = new Intl.DateTimeFormat(IDIOMA, { month: corto ? 'short' : 'long' }).format(fecha).replace('.', '')
  const result = `${capital(nombre)} ${fecha.getFullYear()}`
  return result
}

/** "3 – 9 nov" (o "27 oct – 2 nov" si la semana cambia de mes). */
export const rotuloSemana = (inicio: Date): string => {
  const fin = new Date(inicio)
  fin.setDate(inicio.getDate() + DIAS_SEMANA - 1)
  const a = formatShortDate(inicio)
  const b = formatShortDate(fin)
  const result = a.mes === b.mes ? `${a.dia} – ${b.dia} ${b.mes}` : `${a.dia} ${a.mes} – ${b.dia} ${b.mes}`
  return result
}

/** Precio en euros sin decimales si es entero ("15") o con coma ("12,50"). */
export const formatoEuros = (importe: number): string => {
  const result = Number.isInteger(importe) ? String(importe) : importe.toFixed(2).replace('.', ',')
  return result
}
// #endregion

// #region Fechas
/** Minutos que van de `a` a `b`. */
export const minutos = (a: Date, b: Date): number => {
  const result = Math.round((b.getTime() - a.getTime()) / MS_MINUTO)
  return result
}

/** Los 7 días de la semana que empieza en `inicio`. */
export const diasDeLaSemana = (inicio: Date): Date[] => {
  const result = Array.from({ length: DIAS_SEMANA }, (_, i) => {
    const dia = new Date(inicio)
    dia.setDate(inicio.getDate() + i)
    return dia
  })
  return result
}

/** ¿El bloqueo pisa algo del día `dia`? */
export const bloqueoEnDia = (bloqueo: BloqueoDTO, dia: Date): boolean => {
  const result = new Date(bloqueo.inicio) < addMinutes(dia, MINUTES_PER_DAY) && new Date(bloqueo.fin) > dia
  return result
}

/** Siguiente cuarto de hora a partir de `ahora` (copia). */
const siguienteCuarto = (ahora: Date): Date => {
  const result = new Date(ahora)
  result.setMinutes(Math.ceil(ahora.getMinutes() / REDONDEO_HUECO_MIN) * REDONDEO_HUECO_MIN, 0, 0)
  return result
}

/** Tramos de trabajo del día menos citas y bloqueos = huecos libres. */
export const huecosLibres = (dia: Date, horario: HorarioDiaDTO[], ocupados: RatoOcupado[], ahora: Date): HuecoLibre[] => {
  const result: HuecoLibre[] = []
  const horarioDia = horario.find((h) => h.dia === dia.getDay())
  if (!horarioDia?.tramos?.length) return result
  const ocupacion = ocupados
    .map((o) => ({ ini: new Date(o.inicio), fin: new Date(o.fin) }))
    .sort((a, b) => a.ini.getTime() - b.ini.getTime())

  // Hoy, lo que ya ha pasado no cuenta como libre (redondeado al cuarto).
  const desdeAhora = isSameDay(dia, ahora) ? siguienteCuarto(ahora) : null

  for (const [a, b] of horarioDia.tramos) {
    let cursor = atTime(dia, a)
    const finTramo = atTime(dia, b)
    if (desdeAhora && desdeAhora > cursor) cursor = desdeAhora
    for (const o of ocupacion) {
      if (o.fin <= cursor || o.ini >= finTramo) continue
      if (o.ini > cursor && minutos(cursor, o.ini) >= HUECO_MINIMO) result.push({ inicio: cursor, fin: o.ini })
      if (o.fin > cursor) cursor = o.fin
    }
    if (minutos(cursor, finTramo) >= HUECO_MINIMO) result.push({ inicio: cursor, fin: finTramo })
  }
  return result
}
// #endregion
