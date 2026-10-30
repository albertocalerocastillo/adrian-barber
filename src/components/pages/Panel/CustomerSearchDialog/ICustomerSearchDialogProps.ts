/** Propiedades de CustomerSearchDialogComponent. */
export interface ICustomerSearchDialogProps {
  /** Cierra la hoja. */
  onClose: () => void;
  /** Lleva la agenda al día de la cita que se ha tocado. */
  onIrA: (fecha: Date) => void;
}
