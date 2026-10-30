import type { ServicioDTO } from '../../../../services/dtos/ServicioDTO'

/** Propiedades de ConfirmationComponent. */
export interface IConfirmationProps {
  /** Servicio reservado. */
  servicio: ServicioDTO;
  /** Inicio de la cita. */
  hora: Date;
  /** Nombre del cliente (se saluda con el primero). */
  nombre: string;
}
