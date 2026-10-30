/** Propiedades de BlockTimeDialogComponent. */
export interface IBlockTimeDialogProps {
  /** Día que sale elegido al abrir (por defecto, hoy). */
  fechaInicial?: Date;
  /** Cierra la hoja. */
  onClose: () => void;
  /** Se llama al cerrar el rato, con el texto del aviso. */
  onCreado: (texto: string) => void;
}
