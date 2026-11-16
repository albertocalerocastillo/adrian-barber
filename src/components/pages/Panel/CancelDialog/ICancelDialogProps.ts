import type { CitaDTO } from '../../../../services/dtos/CitaDTO'

/** Propiedades de CancelDialogComponent. */
export interface ICancelDialogProps {
  /** Cita que se va a cancelar. */
  cita: CitaDTO;
  /** Cierra la hoja sin cancelar nada. */
  onClose: () => void;
  /** Cancela la cita (se puede deshacer desde el aviso de abajo). */
  onCancelar: () => void;
}
