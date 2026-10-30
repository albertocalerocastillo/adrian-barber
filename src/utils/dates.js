// Utilidades de fecha para la reserva (en español, hora local).

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DIAS_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** "Lunes 6 de julio". */
export const formatLongDate = (d) => {
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`
}

/** { diaSemana:'Lun', dia:6, mes:'jul' } para tarjetas compactas. */
export const formatShortDate = (d) => {
  return {
    diaSemana: DIAS_CORTO[d.getDay()],
    dia: d.getDate(),
    mes: MESES[d.getMonth()].slice(0, 3),
  }
}

/** "12:30". */
export const formatTime = (d) => {
  return d.toTimeString().slice(0, 5)
}

/** "YYYY-MM-DD" en hora local, para los <input type="date">. */
export const toInputDate = (d) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** "10:30" del instante `d` en la zona horaria dada (la del negocio). */
export const formatTimeInZone = (d, zona) => {
  return new Intl.DateTimeFormat('es-ES', { timeZone: zona, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d)
}

/** Medianoche del día de `d` (copia). */
export const startOfDay = (d) => {
  const result = new Date(d)
  result.setHours(0, 0, 0, 0)
  return result
}

/** Devuelve un array con los próximos `n` días a partir de hoy. */
export const nextDays = (n, desde = new Date()) => {
  const base = startOfDay(desde)
  return Array.from({ length: n }, (_, i) => {
    const result = new Date(base)
    result.setDate(base.getDate() + i)
    return result
  })
}

/** Lunes 00:00 de la semana que contiene a `d`. */
export const startOfWeek = (d) => {
  const result = startOfDay(d)
  // 0 = lunes.
  const lunes = (result.getDay() + 6) % 7
  result.setDate(result.getDate() - lunes)
  return result
}

/** ¿Mismo día natural? */
export const isSameDay = (a, b) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** ¿Ese día tiene algún tramo de trabajo? (para activar/desactivar en el selector). */
export const diaAbierto = (fecha, horario) => {
  const def = horario.find((h) => h.dia === fecha.getDay())
  return !!(def && def.tramos && def.tramos.length)
}
