import type { CitaDTO } from '../../../../services/dtos/CitaDTO'

/** Propiedades de RescheduleDialogComponent. */
export interface IRescheduleDialogProps {
  /** Cita que se cambia de día u hora. */
  cita: CitaDTO;
  /** Cierra la hoja. */
  onClose: () => void;
  /** Se llama al guardar el cambio, con la cita y la hora que tenía antes. */
  onMovida: (cita: CitaDTO, inicioAnterior: Date, finAnterior: Date) => void;
}
