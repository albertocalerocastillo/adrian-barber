/** Si la barbería está abierta ahora y cuándo abre o cierra. */
export interface EstadoNegocioDTO {
  /** Si está abierta en este momento. */
  abierto: boolean;
  /** Hora "HH:MM" a la que cierra, si está abierta. */
  cierraA: string | null;
  /** Hora "HH:MM" a la que abre, si está cerrada. */
  abreA: string | null;
  /** Si abre más tarde hoy mismo. */
  hoy?: boolean;
  /** Nombre del próximo día que abre, si hoy ya no. */
  proximoDia?: string;
}
