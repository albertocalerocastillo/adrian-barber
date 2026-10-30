/** Rato ocupado que ve la web pública: solo horas, sin datos de clientes. */
export interface OcupadoDTO {
  /** Inicio del rato ocupado (ISO o fecha). */
  inicio: string | Date;
  /** Fin del rato ocupado (ISO o fecha). */
  fin: string | Date;
}
