import type { OcupadoDTO } from './dtos/OcupadoDTO'
import type { PeticionCrearCitaDTO } from './dtos/PeticionCrearCitaDTO'
import type { ResultadoOperacionDTO } from './dtos/ResultadoOperacionDTO'

/** Reserva pública: lo que la web puede ver y hacer sin sesión. */
export interface IBookingService {
  /**
   * Devuelve los ratos OCUPADOS (citas activas y días libres) que se solapan
   * con el rango, solo con inicio y fin: nada de datos de otros clientes.
   * Si falla la conexión LANZA un error: es mejor decir "no se pudo cargar"
   * que enseñar todo libre y que luego no se pueda reservar.
   */
  getCitas: (desde: Date, hasta: Date) => Promise<OcupadoDTO[]>;
  /**
   * Crea una cita. Si la base de datos la rechaza, devuelve el motivo en
   * cristiano y si hay que volver a elegir hora.
   */
  crearCita: (cita: PeticionCrearCitaDTO) => Promise<ResultadoOperacionDTO>;
}
