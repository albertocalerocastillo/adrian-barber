/** Horario de un día de la semana. */
export interface HorarioDiaDTO {
  /** Día de la semana, igual que Date.getDay() (0 = domingo). */
  dia: number;
  /** Nombre del día ("Lunes"). */
  nombre: string;
  /** Tramos de trabajo [inicio, fin] en "HH:MM"; vacío si cierra. */
  tramos: [string, string][];
}
