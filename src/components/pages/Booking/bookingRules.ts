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
import { horarioDelDia } from '../../../utils/schedule'
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

// #endregion

/** Primer y último día que se pueden elegir (fechas locales a medianoche). */
export const ventanaReserva = (ahora: Date = new Date()): VentanaReservaDTO => {
  const hoy = startOfDay(ahora)
  const inicio = inicioReservas()
  const primero = hoy > inicio ? hoy : inicio
  // "60 días vista" = 60 días naturales contando el primero (igual que la BD).
  const ultimo = new Date(primero)
  ultimo.setDate(primero.getDate() + RESERVA.diasMax - 1)
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
export const horasDelDia = ({ fecha, servicio, horario, ocupados, ahora = new Date(), aperturas = [] }: OpcionesHorasDiaDTO): HuecoDTO[] => {
  const result = generarRejilla({
    fecha,
    duracionMin: servicio.duracion,
    horario: horarioDelDia(fecha, horario, aperturas, RESERVA.zona),
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

/** Letras de un texto contando cada emoji o letra acentuada como una sola (como la BD). */
export const contarLetras = (texto: string): number => [...texto].length

/** Móvil español limpio (ver utils/phone.ts); se reexporta para los pasos de la reserva. */
export { limpiarMovil } from '../../../utils/phone'
