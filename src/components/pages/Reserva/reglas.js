// Reglas de la reserva online en un solo sitio: qué días se pueden coger y
// qué horas quedan libres. Las usan el calendario, la rejilla de horas y la
// confirmación, para que nunca digan cosas distintas.
//
// La base de datos vuelve a comprobar todo al guardar (trigger
// validar_cita_web): esto es para que el cliente vea solo lo que de verdad
// puede reservar.
import { RESERVA, inicioReservas } from '../../../data/features'
import { generarRejilla, sumarMin } from '../../../utils/disponibilidad'
import { inicioDia } from '../../../utils/fechas'

/** Primer y último día que se pueden elegir (fechas locales a medianoche). */
export function ventanaReserva(ahora = new Date()) {
  const hoy = inicioDia(ahora)
  const inicio = inicioReservas()
  const primero = hoy > inicio ? hoy : inicio
  const ultimo = new Date(primero)
  ultimo.setDate(primero.getDate() + RESERVA.diasMax)
  return { primero, ultimo }
}

/** Rango de instantes a pedir a la BD para cubrir los días [desde, hasta]. */
export function rangoConsulta(desde, hasta) {
  // Un día de margen a cada lado: así da igual el huso del navegador.
  return { desde: sumarMin(inicioDia(desde), -24 * 60), hasta: sumarMin(inicioDia(hasta), 48 * 60) }
}

/** Horas del día (libres y ocupadas) para un servicio. */
export function horasDelDia({ fecha, servicio, horario, ocupados, ahora = new Date() }) {
  return generarRejilla({
    fecha,
    duracionMin: servicio.duracion,
    horario,
    citas: ocupados,
    ahora,
    granularidadMin: RESERVA.pasoMin,
    margenMin: RESERVA.antelacionMin,
    zona: RESERVA.zona,
  })
}

/** ¿Cuántas horas libres quedan ese día? (0 = completo o cerrado) */
export function libresDelDia(opciones) {
  return horasDelDia(opciones).filter((h) => h.estado === 'libre').length
}

/** Móvil español (6/7/8/9 + 8 cifras), aceptando +34, 0034 y espacios. */
export function limpiarMovil(v) {
  const solo = v.replace(/[\s.-]/g, '').replace(/^(\+34|0034)/, '')
  return /^[6789]\d{8}$/.test(solo) ? solo : null
}
