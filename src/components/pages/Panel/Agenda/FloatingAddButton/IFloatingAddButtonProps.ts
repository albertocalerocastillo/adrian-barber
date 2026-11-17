/** Propiedades de FloatingAddButtonComponent. */
export interface IFloatingAddButtonProps {
  /** Abre la hoja de nueva cita. */
  onCita: () => void;
  /** Abre la hoja para cerrar un rato (día libre). */
  onBloquear: () => void;
  /** Abre la hoja para abrir un día que normalmente se cierra. */
  onAbrir: () => void;
}
