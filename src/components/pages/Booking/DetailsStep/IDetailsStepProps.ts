import type { PeticionCrearCitaDTO } from '../../../../services/dtos/PeticionCrearCitaDTO'
import type { ServicioDTO } from '../../../../services/dtos/ServicioDTO'

/** Propiedades de DetailsStepComponent. */
export interface IDetailsStepProps {
  /** Servicio elegido. */
  servicio: ServicioDTO;
  /** Hora elegida (inicio de la cita). */
  hora: Date;
  /** Se llama cuando la cita queda guardada, con los datos enviados. */
  onConfirmado: (cita: PeticionCrearCitaDTO) => void;
  /** Se llama si la hora ya no vale (alguien la ha cogido), con el aviso para el cliente. */
  onHoraPerdida: (aviso: string) => void;
}
