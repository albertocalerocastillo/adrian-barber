import { generarRejilla, sumarMin, MINUTOS_DIA } from '../../../utils/disponibilidad'
import { inicioDia } from '../../../utils/fechas'
import { listarCitas, listarBloqueos } from '../../../lib/panel'
import { EstadoCitaEnum } from '../../../enums/EstadoCitaEnum'

/**
 * Horas libres de un día para un servicio de `duracion` minutos, de cuarto en
 * cuarto. `excluirId` es la cita que se está moviendo: su propio hueco cuenta
 * como libre. En el panel se permite también hoy más temprano (ahora = 0).
 */
export const huecosDelDia = async ({ fecha, duracion, horario, excluirId }) => {
  const desde = inicioDia(fecha)
  const hasta = sumarMin(desde, MINUTOS_DIA)
  const [citas, bloqueos] = await Promise.all([listarCitas(desde, hasta), listarBloqueos(desde, hasta)])
  return generarRejilla({
    fecha,
    duracionMin: duracion,
    horario,
    citas: citas.filter((c) => c.estado !== EstadoCitaEnum.Cancelada && c.id !== excluirId),
    bloqueos,
    ahora: new Date(0),
    granularidadMin: 15,
  }).filter((s) => s.estado === 'libre')
}

/** Texto para mandar al cliente por WhatsApp. */
export const enlaceWhatsapp = (movil, texto) => {
  const limpio = (movil || '').replace(/\D/g, '')
  if (!/^[6789]\d{8}$/.test(limpio)) return null
  return `https://wa.me/34${limpio}?text=${encodeURIComponent(texto)}`
}
