/** Rato que se trabaja aunque el horario de la semana diga que se cierra (tabla `aperturas`). */
export interface AperturaDTO {
  /** Identificador de la apertura. */
  id: number | string;
  /** Inicio del rato abierto (ISO). */
  inicio: string;
  /** Fin del rato abierto (ISO). */
  fin: string;
}
