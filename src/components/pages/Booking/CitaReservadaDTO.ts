import type { PeticionCrearCitaDTO } from '../../../services/dtos/PeticionCrearCitaDTO'
import type { ServicioDTO } from '../../../services/dtos/ServicioDTO'

/** Cita ya guardada que enseña la confirmación de la reserva. */
export interface CitaReservadaDTO extends PeticionCrearCitaDTO {
  /** Servicio reservado (con duración y precio, para el resumen y el calendario). */
  servicio: ServicioDTO;
}
