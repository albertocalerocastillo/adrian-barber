/** Días que se pueden elegir en la reserva (fechas locales a medianoche). */
export interface VentanaReservaDTO {
  /** Primer día reservable. */
  primero: Date;
  /** Último día reservable. */
  ultimo: Date;
}
