import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'
import type { HorarioDiaDTO } from '../../../../../services/dtos/HorarioDiaDTO'

/** Propiedades de DayStripComponent. */
export interface IDayStripProps {
  /** Lunes de la semana que se muestra. */
  inicio: Date;
  /** Día elegido en la agenda (se resalta). */
  dia: Date;
  /** Momento actual, para marcar hoy. */
  ahora: Date;
  /** Citas cargadas (se cuentan las de cada día). */
  citas: CitaDTO[];
  /** Horario de la semana, para atenuar los días cerrados; null mientras carga. */
  horario: HorarioDiaDTO[] | null;
  /** Se llama con el día tocado. */
  onElegir: (dia: Date) => void;
}
