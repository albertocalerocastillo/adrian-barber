/** Rango de instantes que se pide a la base de datos. */
export interface RangoConsultaDTO {
  /** Inicio del rango. */
  desde: Date;
  /** Fin del rango. */
  hasta: Date;
}
