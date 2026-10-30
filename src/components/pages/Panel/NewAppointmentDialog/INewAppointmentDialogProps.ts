/** Propiedades de NewAppointmentDialogComponent. */
export interface INewAppointmentDialogProps {
  /** Día que sale elegido al abrir (por defecto, hoy). */
  fechaInicial?: Date;
  /** Hora ("HH:MM") que sale marcada al abrir; viene de pulsar un hueco libre. */
  horaInicial?: string;
  /** Cierra la hoja. */
  onClose: () => void;
  /** Se llama al guardar, con el texto del aviso. */
  onCreada: (texto: string) => void;
}
