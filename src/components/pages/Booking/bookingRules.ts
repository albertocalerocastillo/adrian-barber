// Reglas de la reserva online en un solo sitio: qué días se pueden coger y
// qué horas quedan libres. Las usan el calendario, la rejilla de horas y la
// confirmación, para que nunca digan cosas distintas.
//
// La base de datos vuelve a comprobar todo al guardar (trigger
// validar_cita_web): esto es para que el cliente vea solo lo que de verdad
// puede reservar.
// #region Imports
import { RESERVA, inicioReservas } from '../../../data/features'
import { generarRejilla, addMinutes, MINUTES_PER_DAY } from '../../../utils/availability'
import { startOfDay } from '../../../utils/dates'
import { EstadoHuecoEnum } from '../../../services/enums/EstadoHuecoEnum'
import type { HuecoDTO } from '../../../services/dtos/HuecoDTO'
import type { VentanaReservaDTO } from './VentanaReservaDTO'
import type { RangoConsultaDTO } from './RangoConsultaDTO'
import type { OpcionesHorasDiaDTO } from './OpcionesHorasDiaDTO'
// #endregion

// #region Constantes
// Días de margen que se piden antes y después del rango (así da igual el huso del navegador).
const DIAS_MARGEN_ANTES = 1
const DIAS_MARGEN_DESPUES = 2

// Móvil español: 6/7/8/9 + 8 cifras, sin prefijo.
const PATRON_MOVIL = /^[6789]\d{8}$/
// Separadores que se aceptan al escribir el móvil (espacios, puntos y guiones).
const PATRON_SEPARADORES_MOVIL = /[\s.-]/g
// Prefijo de España que se quita (+34 o 0034).
const PATRON_PREFIJO_ESPANA = /^(\+34|0034)/
// #endregion

/** Primer y último día que se pueden elegir (fechas locales a medianoche). */
export const ventanaReserva = (ahora: Date = new Date()): VentanaReservaDTO => {
  const hoy = startOfDay(ahora)
  const inicio = inicioReservas()
  const primero = hoy > inicio ? hoy : inicio
  const ultimo = new Date(primero)
  ultimo.setDate(primero.getDate() + RESERVA.diasMax)
  const result: VentanaReservaDTO = { primero, ultimo }
  return result
}

/** Rango de instantes a pedir a la BD para cubrir los días [desde, hasta]. */
export const rangoConsulta = (desde: Date, hasta: Date): RangoConsultaDTO => {
  // Un día de margen a cada lado: así da igual el huso del navegador.
  const result: RangoConsultaDTO = {
    desde: addMinutes(startOfDay(desde), -DIAS_MARGEN_ANTES * MINUTES_PER_DAY),
    hasta: addMinutes(startOfDay(hasta), DIAS_MARGEN_DESPUES * MINUTES_PER_DAY),
  }
  return result
}

/** Horas del día (libres y ocupadas) para un servicio. */
export const horasDelDia = ({ fecha, servicio, horario, ocupados, ahora = new Date() }: OpcionesHorasDiaDTO): HuecoDTO[] => {
  const result = generarRejilla({
    fecha,
    duracionMin: servicio.duracion,
    horario,
    citas: ocupados,
    ahora,
    granularidadMin: RESERVA.pasoMin,
    margenMin: RESERVA.antelacionMin,
    zona: RESERVA.zona,
  })
  return result
}

/** ¿Cuántas horas libres quedan ese día? (0 = completo o cerrado). */
export const libresDelDia = (opciones: OpcionesHorasDiaDTO): number => {
  const result = horasDelDia(opciones).filter((hueco) => hueco.estado === EstadoHuecoEnum.Libre).length
  return result
}

/** Móvil español (6/7/8/9 + 8 cifras), aceptando +34, 0034 y espacios. */
export const limpiarMovil = (movil: string): string | null => {
  const solo = movil.replace(PATRON_SEPARADORES_MOVIL, '').replace(PATRON_PREFIJO_ESPANA, '')
  const result = PATRON_MOVIL.test(solo) ? solo : null
  return result
}
