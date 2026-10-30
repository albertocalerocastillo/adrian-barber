// #region Imports
import { generarRejilla, addMinutes, MINUTES_PER_DAY } from '../../../utils/availability'
import { startOfDay } from '../../../utils/dates'
import { EstadoCitaEnum } from '../../../services/enums/EstadoCitaEnum'
import { EstadoHuecoEnum } from '../../../services/enums/EstadoHuecoEnum'
import { AgendaService } from '../../../services/AgendaService'
import type { CitaDTO } from '../../../services/dtos/CitaDTO'
import type { HorarioDiaDTO } from '../../../services/dtos/HorarioDiaDTO'
import type { HuecoDTO } from '../../../services/dtos/HuecoDTO'
// #endregion

// #region Constantes
// En el panel las horas van de cuarto en cuarto.
const GRANULARIDAD_PANEL_MIN = 15

// En el panel se puede apuntar una cita también hoy más temprano: el "ahora" es el origen de los tiempos.
const AHORA_PANEL = 0

// Móvil español: 9 cifras que empiezan por 6, 7, 8 o 9.
const PATRON_MOVIL = /^[6789]\d{8}$/

// Todo lo que no sea una cifra (espacios, guiones, prefijo con +).
const PATRON_NO_CIFRAS = /\D/g

// Enlace de WhatsApp con el prefijo de España.
const URL_WHATSAPP = 'https://wa.me/34'
// #endregion

/** Parámetros de huecosDelDia. */
interface OpcionesHuecosDelDia {
  /** Día a calcular. */
  fecha: Date;
  /** Duración del servicio en minutos. */
  duracion: number;
  /** Horario de la semana. */
  horario: HorarioDiaDTO[];
  /** Cita que se está moviendo: su propio hueco cuenta como libre. */
  excluirId?: CitaDTO['id'];
}

/**
 * Horas libres de un día para un servicio de `duracion` minutos, de cuarto en
 * cuarto. `excluirId` es la cita que se está moviendo: su propio hueco cuenta
 * como libre. En el panel se permite también hoy más temprano (ahora = 0).
 */
export const huecosDelDia = async ({ fecha, duracion, horario, excluirId }: OpcionesHuecosDelDia): Promise<HuecoDTO[]> => {
  const desde = startOfDay(fecha)
  const hasta = addMinutes(desde, MINUTES_PER_DAY)
  const [citas, bloqueos] = await Promise.all([AgendaService.listarCitas(desde, hasta), AgendaService.listarBloqueos(desde, hasta)])
  const result = generarRejilla({
    fecha,
    duracionMin: duracion,
    horario,
    citas: citas.filter((c) => c.estado !== EstadoCitaEnum.Cancelada && c.id !== excluirId),
    bloqueos,
    ahora: new Date(AHORA_PANEL),
    granularidadMin: GRANULARIDAD_PANEL_MIN,
  }).filter((s) => s.estado === EstadoHuecoEnum.Libre)
  return result
}

/** Enlace de WhatsApp para mandar `texto` al cliente; null si el móvil no es válido. */
export const buildWhatsappLink = (movil: string | null | undefined, texto: string): string | null => {
  const limpio = (movil || '').replace(PATRON_NO_CIFRAS, '')
  if (!PATRON_MOVIL.test(limpio)) return null
  const result = `${URL_WHATSAPP}${limpio}?text=${encodeURIComponent(texto)}`
  return result
}
