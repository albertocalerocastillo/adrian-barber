/** Propiedades de SaveBarComponent. */
export interface ISaveBarProps {
  /** Si la barra se muestra (hay cambios sin guardar). */
  visible: boolean;
  /** Si se está guardando (spinner y botones desactivados). */
  saving: boolean;
  /** Se llama al tocar "Guardar". */
  onSave: () => void;
  /** Se llama al tocar "Descartar". */
  onDiscard: () => void;
  /** Texto de la barra. */
  text?: string;
}
