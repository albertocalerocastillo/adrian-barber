/** Datos para crear una cita desde el panel (teléfono, en persona…). */
export interface PeticionCrearCitaManualDTO {
  /** Nombre del servicio. */
  servicioNombre: string;
  /** Nombre del cliente. */
  clienteNombre: string;
  /** Móvil del cliente, si lo dio. */
  clienteMovil?: string;
  /** Inicio de la cita. */
  inicio: Date;
  /** Fin de la cita. */
  fin: Date;
  /** Notas de Adrián. */
  notas?: string;
}
