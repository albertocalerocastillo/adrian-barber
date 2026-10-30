import type { PeticionCrearCitaDTO } from './dtos/PeticionCrearCitaDTO'

/** Avisos a Adrián cuando entra una cita por la web. */
export interface INotificationService {
  /**
   * Pide a la Edge Function `aviso-cita` que avise a Adrián por WhatsApp. No
   * espera la respuesta y NUNCA lanza un error: la cita ya está guardada.
   */
  avisarNuevaCita: (cita: Pick<PeticionCrearCitaDTO, 'clienteMovil' | 'inicio'>) => void;
}
