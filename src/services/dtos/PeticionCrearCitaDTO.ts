/** Datos para crear una cita desde la web pública. */
export interface PeticionCrearCitaDTO {
  /** Identificador del servicio elegido. */
  servicioId: number | string;
  /** Nombre del servicio elegido. */
  servicioNombre: string;
  /** Nombre del cliente. */
  clienteNombre: string;
  /** Móvil del cliente (9 cifras). */
  clienteMovil: string;
  /** Inicio de la cita. */
  inicio: Date;
  /** Fin de la cita. */
  fin: Date;
}
