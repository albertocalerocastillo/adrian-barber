import type { HorarioDiaDTO } from '../../../../services/dtos/HorarioDiaDTO'
import type { ServicioDTO } from '../../../../services/dtos/ServicioDTO'

/** Propiedades de DateStepComponent. */
export interface IDateStepProps {
  /** Servicio elegido (su duración decide qué días tienen hueco). */
  servicio: ServicioDTO;
  /** Día elegido hasta ahora (null si aún no hay). */
  fecha: Date | null;
  /** Horario de la semana. */
  horario: HorarioDiaDTO[];
  /** Se llama al pulsar un día con hueco (a medianoche). */
  onElegir: (fecha: Date) => void;
}
