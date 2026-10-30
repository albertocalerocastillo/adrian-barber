import type { HorarioDiaDTO } from './dtos/HorarioDiaDTO'
import type { ServicioDTO } from './dtos/ServicioDTO'
import type { ResultadoOperacionDTO } from './dtos/ResultadoOperacionDTO'

/**
 * Configuración editable desde el panel: horario de trabajo y servicios. Se
 * lee de Supabase para que la reserva y el panel usen la misma fuente; si no
 * hay Supabase o está vacío, se usan los datos estáticos de src/data/.
 */
export interface IConfigurationService {
  /** Horario de los 7 días, de lunes a domingo. */
  getHorario: () => Promise<HorarioDiaDTO[]>;
  /** Guarda el horario completo (borra el anterior y escribe el nuevo). */
  guardarHorario: (dias: HorarioDiaDTO[]) => Promise<ResultadoOperacionDTO>;
  /** Todos los servicios, también los inactivos, en su orden. */
  getServicios: () => Promise<ServicioDTO[]>;
  /**
   * Guarda la lista completa de servicios fijando el orden por posición. Las
   * citas guardan el nombre del servicio, así que regenerar ids no afecta al
   * histórico.
   */
  guardarServicios: (lista: ServicioDTO[]) => Promise<ResultadoOperacionDTO>;
}
