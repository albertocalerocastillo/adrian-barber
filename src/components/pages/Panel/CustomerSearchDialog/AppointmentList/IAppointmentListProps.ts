import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'

/** Propiedades de AppointmentListComponent. */
export interface IAppointmentListProps {
  /** Título de la lista ("Próximas", "Anteriores"). */
  titulo: string;
  /** Citas a mostrar, en el orden en que se pintan. */
  citas: CitaDTO[];
  /** Lleva la agenda al día de la cita que se toca. */
  onIrA: (fecha: Date) => void;
  /** Fondo dorado, para las próximas. */
  destacar?: boolean;
}
