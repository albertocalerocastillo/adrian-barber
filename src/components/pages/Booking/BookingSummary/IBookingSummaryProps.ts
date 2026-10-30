import type { ServicioDTO } from '../../../../services/dtos/ServicioDTO'

/** Propiedades de BookingSummaryComponent. */
export interface IBookingSummaryProps {
  /** Servicio elegido (sin él no se enseña nada). */
  servicio: ServicioDTO | null;
  /** Día elegido, si ya se ha pasado de ese paso. */
  fecha: Date | null;
  /** Hora elegida, si ya se ha pasado de ese paso. */
  hora: Date | null;
}
