// ════════════════════════════════════════════════════════════
//  MOTOR DE HUECOS LIBRES — el corazón de la reserva.
//  Calcula los huecos disponibles para un servicio en una fecha,
//  cruzando: horario de trabajo − citas ocupadas − bloqueos − pasado.
//
//  Regla de oro: NUNCA ofrecer un hueco que solape con otro ni que
//  caiga en el pasado. (El seguro definitivo contra dobles reservas
//  vive además en la BD: exclusion constraint — ver supabase/schema.sql.)
// ════════════════════════════════════════════════════════════
import { EstadoHuecoEnum } from '../services/enums/EstadoHuecoEnum'
import type { HorarioDiaDTO } from '../services/dtos/HorarioDiaDTO'
import type { HuecoDTO } from '../services/dtos/HuecoDTO'
import type { OcupadoDTO } from '../services/dtos/OcupadoDTO'

// #region Constantes
/** Minutos que tiene un día. */
export const MINUTES_PER_DAY = 24 * 60

// Milisegundos de un minuto.
const MS_MINUTO = 60000

// Paso por defecto de la rejilla de horas, en minutos.
const GRANULARIDAD_POR_DEFECTO = 15
// #endregion

/** Opciones para calcular la rejilla de horas de un día. */
export interface OpcionesRejilla {
  /** Día a calcular (la hora se ignora). */
  fecha: Date;
  /** Duración del servicio en minutos. */
  duracionMin: number;
  /** Horario de la semana. */
  horario: HorarioDiaDTO[];
  /** Ratos ocupados por citas. */
  citas?: OcupadoDTO[];
  /** Ratos cerrados (días libres, descansos). */
  bloqueos?: OcupadoDTO[];
  /** Momento actual, para descartar el pasado. */
  ahora?: Date;
  /** Paso de la rejilla de inicios, en minutos. */
  granularidadMin?: number;
  /** Antelación mínima para reservar, en minutos. */
  margenMin?: number;
  /** Zona horaria en la que se lee el horario (la web pública usa la de España). */
  zona?: string;
}

/** Devuelve un Date en el día `fecha` a la hora "HH:MM" (hora local). */
export const atTime = (fecha: Date, hhmm: string): Date => {
  const [h, m] = hhmm.split(':').map(Number)
  const result = new Date(fecha)
  result.setHours(h, m, 0, 0)
  return result
}

/** Suma minutos a un Date (devuelve uno nuevo). */
export const addMinutes = (fecha: Date, min: number): Date => {
  return new Date(fecha.getTime() + min * MS_MINUTO)
}

/** ¿Se solapan los intervalos [aIni,aFin) y [bIni,bFin)? */
export const overlaps = (aIni: Date, aFin: Date, bIni: Date, bFin: Date): boolean => {
  return aIni < bFin && bIni < aFin
}

/**
 * Minutos que la zona `zona` va por delante de UTC en el instante dado
 * (60 en invierno en España, 120 en verano).
 */
const desfaseMin = (zona: string, instante: Date): number => {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: zona,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(instante)
      .map((p) => [p.type, p.value])
  )
  const comoUtc = Date.UTC(Number(partes.year), Number(partes.month) - 1, Number(partes.day), Number(partes.hour), Number(partes.minute))
  return Math.round((comoUtc - Math.floor(instante.getTime() / MS_MINUTO) * MS_MINUTO) / MS_MINUTO)
}

/**
 * Como atTime, pero la hora "HH:MM" es la del reloj de `zona` (p. ej. las
 * 10:00 de Sevilla), sea cual sea el huso del navegador. El día se toma de
 * `fecha` (año/mes/día locales, que es lo que el cliente pulsó).
 */
export const atTimeInZone = (fecha: Date, hhmm: string, zona: string): Date => {
  const [h, m] = hhmm.split(':').map(Number)
  const comoUtc = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), h, m)
  const primeraPasada = comoUtc - desfaseMin(zona, new Date(comoUtc)) * MS_MINUTO
  // Segunda pasada por si justo ese día cambia la hora (marzo/octubre).
  return new Date(comoUtc - desfaseMin(zona, new Date(primeraPasada)) * MS_MINUTO)
}

/**
 * Genera los huecos de inicio disponibles para una fecha.
 *
 * Las horas candidatas son las de la rejilla (cada `granularidadMin`) MÁS el
 * momento exacto en que acaba cada cita o rato cerrado: si unas mechas acaban
 * a las 11:15, se ofrece justo las 11:15 en vez de dejar un hueco perdido
 * hasta las 11:30.
 *
 * Se EXCLUYEN las horas en pasado (no tiene sentido mostrarlas). Las que
 * solapan con una cita o un bloqueo salen como ocupadas (para mostrarlas en
 * gris y dar sensación de agenda llena), el resto como libres.
 */
export const generarRejilla = ({
  fecha,
  duracionMin,
  horario,
  citas = [],
  bloqueos = [],
  ahora = new Date(),
  granularidadMin = GRANULARIDAD_POR_DEFECTO,
  margenMin = 0,
  zona,
}: OpcionesRejilla): HuecoDTO[] => {
  const def = horario.find((h) => h.dia === fecha.getDay())
  if (!def || def.tramos.length === 0) return []

  const enHora = (hhmm: string) => (zona ? atTimeInZone(fecha, hhmm, zona) : atTime(fecha, hhmm))

  // Normaliza citas/bloqueos a {ini:Date, fin:Date} una sola vez.
  const ocupados = [...citas, ...bloqueos].map((o) => ({
    ini: new Date(o.inicio),
    fin: new Date(o.fin),
  }))

  const limite = addMinutes(ahora, margenMin)
  const result: HuecoDTO[] = []

  for (const [horaIni, horaFin] of def.tramos) {
    const apertura = enHora(horaIni)
    const cierre = enHora(horaFin)

    // Candidatas: la rejilla + el final de cada cita/bloqueo dentro del tramo.
    const candidatas = new Set<number>()
    for (let c = apertura; c < cierre; c = addMinutes(c, granularidadMin)) candidatas.add(c.getTime())
    for (const o of ocupados) {
      if (o.fin > apertura && o.fin < cierre) candidatas.add(o.fin.getTime())
    }

    for (const t of [...candidatas].sort((a, b) => a - b)) {
      const inicio = new Date(t)
      const fin = addMinutes(inicio, duracionMin)
      // El servicio no cabe entero en el tramo.
      if (fin > cierre) continue
      // No mostramos el pasado.
      if (inicio < limite) continue
      const chocaOcupado = ocupados.some((o) => overlaps(inicio, fin, o.ini, o.fin))
      // Las horas "pegadas" solo se ofrecen si están libres: ocupadas no
      // aportan nada y desordenarían la rejilla.
      const deRejilla = minutosDesde(apertura, inicio) % granularidadMin === 0
      if (chocaOcupado && !deRejilla) continue
      result.push({ inicio, estado: chocaOcupado ? EstadoHuecoEnum.Ocupado : EstadoHuecoEnum.Libre })
    }
  }

  return result
}

const minutosDesde = (a: Date, b: Date): number => Math.round((b.getTime() - a.getTime()) / MS_MINUTO)

/**
 * Solo las horas LIBRES (atajo sobre generarRejilla). Mismos parámetros.
 */
export const generarHuecos = (opts: OpcionesRejilla): Date[] => {
  return generarRejilla(opts)
    .filter((s) => s.estado === EstadoHuecoEnum.Libre)
    .map((s) => s.inicio)
}
