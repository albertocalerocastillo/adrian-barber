import type { CitaDTO } from '../../../../../services/dtos/CitaDTO'

/** Propiedades de RescheduleDoneComponent. */
export interface IRescheduleDoneProps {
  /** Cita que se ha cambiado. */
  cita: CitaDTO;
  /** Hora que tenía antes del cambio. */
  inicioOriginal: Date;
  /** Hora nueva, ya guardada. */
  inicioNuevo: Date;
  /** Cierra la hoja. */
  onClose: () => void;
}
