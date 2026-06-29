// ════════════════════════════════════════════════════════════
//  MOTOR DE HUECOS LIBRES — el corazón de la reserva.
//  Calcula los huecos disponibles para un servicio en una fecha,
//  cruzando: horario de trabajo − citas ocupadas − bloqueos − pasado.
//
//  Regla de oro: NUNCA ofrecer un hueco que solape con otro ni que
//  caiga en el pasado. (El seguro definitivo contra dobles reservas
//  vive además en la BD: exclusion constraint — ver supabase/schema.sql.)
// ════════════════════════════════════════════════════════════

/** Devuelve un Date en el día `fecha` a la hora "HH:MM" (hora local). */
export function aHora(fecha, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(fecha)
  d.setHours(h, m, 0, 0)
  return d
}

/** Suma minutos a un Date (devuelve uno nuevo). */
export function sumarMin(fecha, min) {
  return new Date(fecha.getTime() + min * 60000)
}

/** ¿Se solapan los intervalos [aIni,aFin) y [bIni,bFin)? */
export function solapan(aIni, aFin, bIni, bFin) {
  return aIni < bFin && bIni < aFin
}

/**
 * Genera los huecos de inicio disponibles para una fecha.
 *
 * @param {Object} opts
 * @param {Date}   opts.fecha          Día a calcular (la hora se ignora).
 * @param {number} opts.duracionMin    Duración del servicio en minutos.
 * @param {Array}  opts.horario        Estructura de src/data/horarios.js.
 * @param {Array}  opts.citas          Citas activas: [{inicio, fin}] (ISO o Date).
 * @param {Array}  opts.bloqueos       Bloqueos: [{inicio, fin}] (ISO o Date).
 * @param {Date}   opts.ahora          Momento actual (para descartar pasado).
 * @param {number} opts.granularidadMin Paso del rejilla de inicios (def. 15).
 * @param {number} opts.margenMin      Antelación mínima para reservar (def. 0).
 * @returns {Date[]} Lista de horas de inicio libres, ordenadas.
 */
export function generarHuecos({
  fecha,
  duracionMin,
  horario,
  citas = [],
  bloqueos = [],
  ahora = new Date(),
  granularidadMin = 15,
  margenMin = 0,
}) {
  const def = horario.find((h) => h.dia === fecha.getDay())
  if (!def || !def.tramos || def.tramos.length === 0) return []

  // Normaliza citas/bloqueos a {ini:Date, fin:Date} una sola vez.
  const ocupados = [...citas, ...bloqueos].map((o) => ({
    ini: new Date(o.inicio),
    fin: new Date(o.fin),
  }))

  const limite = sumarMin(ahora, margenMin)
  const huecos = []

  for (const [horaIni, horaFin] of def.tramos) {
    const apertura = aHora(fecha, horaIni)
    const cierre = aHora(fecha, horaFin)

    let cursor = new Date(apertura)
    while (true) {
      const fin = sumarMin(cursor, duracionMin)
      if (fin > cierre) break // el servicio no cabe entero en el tramo

      const enPasado = cursor < limite
      const chocaOcupado = ocupados.some((o) =>
        solapan(cursor, fin, o.ini, o.fin)
      )

      if (!enPasado && !chocaOcupado) huecos.push(new Date(cursor))
      cursor = sumarMin(cursor, granularidadMin)
    }
  }

  return huecos
}
