import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'
import type { EstadoCitaEnum } from '../../../../../services/enums/EstadoCitaEnum'

/** Propiedades de AppointmentCardComponent. */
export interface IAppointmentCardProps {
  /** Cita que se pinta. */
  cita: CitaDTO;
  /** Momento actual, para marcar la cita en curso. */
  ahora: Date;
  /** Precio de cada servicio, por nombre. */
  precios: ReadonlyMap<string, number>;
  /** Cambia el estado de la cita; `texto` es el aviso que se muestra. */
  onEstado: (cita: CitaDTO, estado: EstadoCitaEnum, texto: string) => void;
  /** Abre la hoja para cambiar la cita de día u hora. */
  onMover: (cita: CitaDTO) => void;
}
