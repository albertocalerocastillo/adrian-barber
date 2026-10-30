import type { EstadoNegocioDTO } from '../../../services/dtos/EstadoNegocioDTO'

/** Propiedades de StatusBadgeComponent. */
export interface IStatusBadgeProps {
  /** Estado de apertura (lo que devuelve useBusinessStatus()). */
  status: EstadoNegocioDTO;
  /** Colores para fondos oscuros (hero). */
  light?: boolean;
  /** Ancla a la que lleva el badge (p. ej. '#horario'); sin ella no es un enlace. */
  href?: string;
}
