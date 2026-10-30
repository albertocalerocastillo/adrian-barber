/** Rato cerrado de la agenda: día libre, vacaciones o descanso (tabla `bloqueos`). */
export interface BloqueoDTO {
  /** Identificador del bloqueo. */
  id: number | string;
  /** Inicio del rato cerrado (ISO). */
  inicio: string;
  /** Fin del rato cerrado (ISO). */
  fin: string;
  /** Motivo que apunta Adrián. */
  motivo: string | null;
}
