import type { HorarioDiaDTO } from '../../../services/dtos/HorarioDiaDTO'
import type { OcupadoDTO } from '../../../services/dtos/OcupadoDTO'
import type { ServicioDTO } from '../../../services/dtos/ServicioDTO'

/** Datos para calcular las horas de un día en la reserva. */
export interface OpcionesHorasDiaDTO {
  /** Día a calcular. */
  fecha: Date;
  /** Servicio elegido (su duración marca qué horas caben). */
  servicio: ServicioDTO;
  /** Horario de la semana. */
  horario: HorarioDiaDTO[];
  /** Ratos ocupados (citas y días libres). */
  ocupados: OcupadoDTO[];
  /** Momento actual, para descartar el pasado. */
  ahora?: Date;
}
