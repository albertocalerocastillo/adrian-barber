import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'
import type { EstadoCitaEnum } from '../../../../../services/enums/EstadoCitaEnum'

/** Propiedades de NextAppointmentComponent. */
export interface INextAppointmentProps {
  /** Citas de hoy. */
  citas: CitaDTO[];
  /** Momento actual, para saber cuál es la siguiente y si ya está en curso. */
  ahora: Date;
  /** Precio de cada servicio, por nombre. */
  precios: ReadonlyMap<string, number>;
  /** Cambia el estado de una cita; `texto` es el aviso que se muestra. */
  onEstado: (cita: CitaDTO, estado: EstadoCitaEnum, texto: string) => void;
}
