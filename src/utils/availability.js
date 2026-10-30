// ════════════════════════════════════════════════════════════
//  MOTOR DE HUECOS LIBRES — el corazón de la reserva.
//  Calcula los huecos disponibles para un servicio en una fecha,
//  cruzando: horario de trabajo − citas ocupadas − bloqueos − pasado.
//
//  Regla de oro: NUNCA ofrecer un hueco que solape con otro ni que
//  caiga en el pasado. (El seguro definitivo contra dobles reservas
//  vive además en la BD: exclusion constraint — ver supabase/schema.sql.)
// ════════════════════════════════════════════════════════════

// Minutos que tiene un día.
export const MINUTES_PER_DAY = 24 * 60

/** Devuelve un Date en el día `fecha` a la hora "HH:MM" (hora local). */
export const atTime = (fecha, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  const result = new Date(fecha)
  result.setHours(h, m, 0, 0)
  return result
}

/** Suma minutos a un Date (devuelve uno nuevo). */
export const addMinutes = (fecha, min) => {
  return new Date(fecha.getTime() + min * 60000)
}

/** ¿Se solapan los intervalos [aIni,aFin) y [bIni,bFin)? */
export const overlaps = (aIni, aFin, bIni, bFin) => {
  return aIni < bFin && bIni < aFin
}

/**
 * Minutos que la zona `zona` va por delante de UTC en el instante dado
 * (60 en invierno en España, 120 en verano).
 */
const desfaseMin = (zona, instante) => {
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
  const comoUtc = Date.UTC(partes.year, partes.month - 1, partes.day, partes.hour, partes.minute)
  return Math.round((comoUtc - Math.floor(instante.getTime() / 60000) * 60000) / 60000)
}

/**
 * Como aHora, pero la hora "HH:MM" es la del reloj de `zona` (p. ej. las
 * 10:00 de Sevilla), sea cual sea el huso del navegador. El día se toma de
 * `fecha` (año/mes/día locales, que es lo que el cliente pulsó).
 */
export const atTimeInZone = (fecha, hhmm, zona) => {
  const [h, m] = hhmm.split(':').map(Number)
  const comoUtc = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), h, m)
  let t = comoUtc - desfaseMin(zona, new Date(comoUtc)) * 60000
  // Segunda pasada por si justo ese día cambia la hora (marzo/octubre).
  t = comoUtc - desfaseMin(zona, new Date(t)) * 60000
  return new Date(t)
}

/**
 * Genera los huecos de inicio disponibles para una fecha.
 *
 * Las horas candidatas son las de la rejilla (cada `granularidadMin`) MÁS el
 * momento exacto en que acaba cada cita o rato cerrado: si unas mechas acaban
 * a las 11:15, se ofrece justo las 11:15 en vez de dejar un hueco perdido
 * hasta las 11:30.
 *
 * @param {Object} opts
 * @param {Date}   opts.fecha          Día a calcular (la hora se ignora).
 * @param {number} opts.duracionMin    Duración del servicio en minutos.
 * @param {Array}  opts.horario        Estructura de src/data/openingHours.js.
 * @param {Array}  opts.citas          Ocupado: [{inicio, fin}] (ISO o Date).
 * @param {Array}  opts.bloqueos       Ratos cerrados: [{inicio, fin}].
 * @param {Date}   opts.ahora          Momento actual (para descartar pasado).
 * @param {number} opts.granularidadMin Paso de la rejilla de inicios (def. 15).
 * @param {number} opts.margenMin      Antelación mínima para reservar (def. 0).
 * @param {string} opts.zona           Si se pasa, el horario se lee en esa
 *                                     zona horaria (la web pública usa la de
 *                                     España). Sin ella, en la del navegador.
 * @returns {Array<{inicio:Date, estado:'libre'|'ocupado'}>} Rejilla de horas.
 *   Se EXCLUYEN las horas en pasado (no tiene sentido mostrarlas). Las que
 *   solapan con una cita/bloqueo salen como 'ocupado' (para mostrarlas en gris
 *   y dar sensación de agenda llena), el resto como 'libre'.
 */
export const generarRejilla = ({
  fecha,
  duracionMin,
  horario,
  citas = [],
  bloqueos = [],
  ahora = new Date(),
  granularidadMin = 15,
  margenMin = 0,
  zona,
}) => {
  const def = horario.find((h) => h.dia === fecha.getDay())
  if (!def || !def.tramos || def.tramos.length === 0) return []

  const enHora = (hhmm) => (zona ? atTimeInZone(fecha, hhmm, zona) : atTime(fecha, hhmm))

  // Normaliza citas/bloqueos a {ini:Date, fin:Date} una sola vez.
  const ocupados = [...citas, ...bloqueos].map((o) => ({
    ini: new Date(o.inicio),
    fin: new Date(o.fin),
  }))

  const limite = addMinutes(ahora, margenMin)
  const result = []

  for (const [horaIni, horaFin] of def.tramos) {
    const apertura = enHora(horaIni)
    const cierre = enHora(horaFin)

    // Candidatas: la rejilla + el final de cada cita/bloqueo dentro del tramo.
    const candidatas = new Set()
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
      result.push({ inicio, estado: chocaOcupado ? 'ocupado' : 'libre' })
    }
  }

  return result
}

const minutosDesde = (a, b) => Math.round((b - a) / 60000)

/**
 * Solo las horas LIBRES (atajo sobre generarRejilla). Mismos parámetros.
 * @returns {Date[]}.
 */
export const generarHuecos = (opts) => {
  return generarRejilla(opts)
    .filter((s) => s.estado === 'libre')
    .map((s) => s.inicio)
}
