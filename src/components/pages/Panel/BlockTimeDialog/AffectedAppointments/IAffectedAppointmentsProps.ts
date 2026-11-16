import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'

/** Propiedades de AffectedAppointmentsComponent. */
export interface IAffectedAppointmentsProps {
  /** Citas que caen en el rato que se cierra. */
  citas: CitaDTO[];
  /** Si es true, cada cita lleva su botón para avisar al cliente por WhatsApp. */
  conAviso?: boolean;
}
