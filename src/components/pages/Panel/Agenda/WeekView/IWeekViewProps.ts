import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'
import type { BloqueoDTO } from '../../../../../services/dtos/BloqueoDTO'
import type { HorarioDiaDTO } from '../../../../../services/dtos/HorarioDiaDTO'

/** Propiedades de WeekViewComponent. */
export interface IWeekViewProps {
  /** Lunes de la semana que se muestra. */
  inicio: Date;
  /** Citas cargadas (se muestran las de la semana). */
  citas: CitaDTO[];
  /** Ratos cerrados cargados. */
  bloqueos: BloqueoDTO[];
  /** Horario de la semana, para marcar los días cerrados. */
  horario: HorarioDiaDTO[];
  /** Momento actual, para marcar hoy. */
  ahora: Date;
  /** Se llama con el día tocado. */
  onDia: (dia: Date) => void;
}
