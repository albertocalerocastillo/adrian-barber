/** Resultado de guardar algo: bien, o el error para enseñar al usuario. */
export interface ResultadoOperacionDTO {
  /** Si se ha guardado. */
  ok: boolean;
  /** Mensaje de error para el usuario. */
  error?: string;
  /** En la reserva: el hueco ya no vale y hay que volver a elegir hora. */
  volverAHoras?: boolean;
}
