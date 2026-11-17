/** Propiedades de OpenDayDialogComponent. */
export interface IOpenDayDialogProps {
  /** Día que sale elegido al abrir la hoja. */
  fechaInicial: Date;
  /** Cierra la hoja. */
  onClose: () => void;
  /** Se llama al guardar, con el texto del aviso ("Sábado 20 de marzo: abierto de 9:00 a 14:00"). */
  onAbierto: (texto: string) => void;
}
