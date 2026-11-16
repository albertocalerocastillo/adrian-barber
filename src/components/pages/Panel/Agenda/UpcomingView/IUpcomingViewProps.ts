/** Propiedades de UpcomingViewComponent. */
export interface IUpcomingViewProps {
  /** Momento actual: solo salen las citas que aún no han terminado. */
  ahora: Date;
  /** Cambia cada vez que hay que volver a pedir las citas (tras crear o cancelar). */
  recarga: number;
  /** Se llama con el día de la cita tocada. */
  onDia: (dia: Date) => void;
}
