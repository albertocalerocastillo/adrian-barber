/** Datos para cerrar un rato de la agenda. */
export interface PeticionCrearBloqueoDTO {
  /** Inicio del rato cerrado. */
  inicio: Date;
  /** Fin del rato cerrado. */
  fin: Date;
  /** Motivo (día libre, vacaciones…). */
  motivo?: string | null;
}
