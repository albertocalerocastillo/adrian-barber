import type { HorarioDiaDTO } from './dtos/HorarioDiaDTO'
import type { ServicioDTO } from './dtos/ServicioDTO'
import type { ResultadoOperacionDTO } from './dtos/ResultadoOperacionDTO'
import type { AperturaDTO } from './dtos/AperturaDTO'

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
  /**
   * Aperturas extra (días u horas que se trabaja fuera del horario de la
   * semana) que pisan [desde, hasta). Las lee también la web pública. Si no se
   * pueden leer, lanza el error: el panel no debe enseñar un día como cerrado
   * por un fallo de red.
   */
  listarAperturas: (desde: Date, hasta: Date) => Promise<AperturaDTO[]>;
  /** Abre un rato fuera del horario de la semana. */
  crearApertura: (inicio: Date, fin: Date) => Promise<ResultadoOperacionDTO>;
  /** Quita una apertura extra (ese rato vuelve a estar cerrado). */
  borrarApertura: (id: AperturaDTO['id']) => Promise<ResultadoOperacionDTO>;
}
