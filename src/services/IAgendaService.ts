import type { CitaDTO } from './dtos/CitaDTO'
import type { BloqueoDTO } from './dtos/BloqueoDTO'
import type { ResultadoOperacionDTO } from './dtos/ResultadoOperacionDTO'
import type { PeticionCrearCitaManualDTO } from './dtos/PeticionCrearCitaManualDTO'
import type { PeticionCrearBloqueoDTO } from './dtos/PeticionCrearBloqueoDTO'
import type { EstadoCitaEnum } from './enums/EstadoCitaEnum'

/**
 * Agenda del panel (requiere sesión). A diferencia de BookingService, aquí sí
 * se leen los datos completos de las citas; la RLS solo lo permite a Adrián.
 */
export interface IAgendaService {
  /** Citas (datos completos) que empiezan en el rango [desde, hasta). */
  listarCitas: (desde: Date, hasta: Date) => Promise<CitaDTO[]>;
  /** Ratos cerrados que se solapan con el rango [desde, hasta). */
  listarBloqueos: (desde: Date, hasta: Date) => Promise<BloqueoDTO[]>;
  /** Cambia el estado de una cita. */
  cambiarEstado: (id: CitaDTO['id'], estado: EstadoCitaEnum) => Promise<ResultadoOperacionDTO>;
  /** Crea una cita apuntada a mano (teléfono, en persona…). */
  crearCitaManual: (cita: PeticionCrearCitaManualDTO) => Promise<ResultadoOperacionDTO>;
  /** Cambia una cita de día u hora. */
  moverCita: (id: CitaDTO['id'], inicio: Date, fin: Date) => Promise<ResultadoOperacionDTO>;
  /** Busca citas por nombre o móvil (las más recientes primero). */
  buscarCitas: (texto: string) => Promise<CitaDTO[]>;
  /** Cierra un rato de la agenda (día libre, vacaciones, descanso). */
  crearBloqueo: (bloqueo: PeticionCrearBloqueoDTO) => Promise<ResultadoOperacionDTO>;
  /** Vuelve a abrir un rato cerrado. */
  borrarBloqueo: (id: BloqueoDTO['id']) => Promise<ResultadoOperacionDTO>;
}
