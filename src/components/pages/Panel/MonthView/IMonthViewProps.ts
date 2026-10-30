import type { CitaDTO } from '../../../../services/dtos/CitaDTO'
import type { BloqueoDTO } from '../../../../services/dtos/BloqueoDTO'
import type { HorarioDiaDTO } from '../../../../services/dtos/HorarioDiaDTO'

/** Propiedades de MonthViewComponent. */
export interface IMonthViewProps {
  /** Cualquier día del mes que se muestra. */
  mes: Date;
  /** Día elegido en la agenda (se resalta). */
  dia: Date;
  /** Momento actual, para marcar hoy y atenuar lo pasado. */
  ahora: Date;
  /** Citas del mes. */
  citas: CitaDTO[];
  /** Ratos cerrados del mes. */
  bloqueos: BloqueoDTO[];
  /** Horario de la semana, para calcular lo lleno que va cada día. */
  horario: HorarioDiaDTO[];
  /** Se llama con el día tocado. */
  onDia: (dia: Date) => void;
}
