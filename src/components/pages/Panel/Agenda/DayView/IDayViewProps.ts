import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'
import type { BloqueoDTO } from '../../../../../services/dtos/BloqueoDTO'
import type { HorarioDiaDTO } from '../../../../../services/dtos/HorarioDiaDTO'
import type { EstadoCitaEnum } from '../../../../../services/enums/EstadoCitaEnum'

/** Propiedades de DayViewComponent. */
export interface IDayViewProps {
  /** Día que se muestra. */
  dia: Date;
  /** Momento actual, para los huecos de hoy y la cita en curso. */
  ahora: Date;
  /** Horario de la semana, para calcular los huecos libres. */
  horario: HorarioDiaDTO[];
  /** Citas del día (también las canceladas, que van aparte). */
  citas: CitaDTO[];
  /** Ratos cerrados que pisan el día. */
  bloqueos: BloqueoDTO[];
  /** Precio de cada servicio, por nombre. */
  precios: ReadonlyMap<string, number>;
  /** Cambia el estado de una cita; `texto` es el aviso que se muestra. */
  onEstado: (cita: CitaDTO, estado: EstadoCitaEnum, texto: string) => void;
  /** Abre la hoja para cambiar una cita de día u hora. */
  onMover: (cita: CitaDTO) => void;
  /** Vuelve a abrir un rato cerrado. */
  onQuitarBloqueo: (bloqueo: BloqueoDTO) => void;
  /** Abre la hoja de nueva cita, a la hora `hora` ("HH:MM") si se pasa. */
  onNuevaEn: (hora?: string) => void;
}
