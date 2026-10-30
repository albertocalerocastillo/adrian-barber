/** Propiedades de FloatingAddButtonComponent. */
export interface IFloatingAddButtonProps {
  /** Abre la hoja de nueva cita. */
  onCita: () => void;
  /** Abre la hoja para cerrar un rato (día libre). */
  onBloquear: () => void;
}
