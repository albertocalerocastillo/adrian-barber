/** Un tramo del horario en el formato de schema.org que lee Google. */
export interface EspecificacionHorarioDTO {
  /** Tipo de schema.org; siempre "OpeningHoursSpecification". */
  '@type': 'OpeningHoursSpecification';
  /** Días en inglés ("Monday") que abren en este tramo. */
  dayOfWeek: string[];
  /** Hora de apertura en "HH:MM". */
  opens: string;
  /** Hora de cierre en "HH:MM". */
  closes: string;
}
