import type { HorarioDiaDTO } from '../../../../services/dtos/HorarioDiaDTO'
import type { ServicioDTO } from '../../../../services/dtos/ServicioDTO'

/** Propiedades de TimeStepComponent. */
export interface ITimeStepProps {
  /** Servicio elegido (su duración decide qué horas caben). */
  servicio: ServicioDTO;
  /** Día elegido. */
  fecha: Date;
  /** Horario de la semana. */
  horario: HorarioDiaDTO[];
  /** Hora elegida hasta ahora (null si aún no hay). */
  hora: Date | null;
  /** Aviso en rojo encima de las horas (p. ej. cuando la hora elegida se acaba de coger). */
  aviso: string;
  /** Se llama al pulsar una hora libre. */
  onElegir: (hora: Date) => void;
}
