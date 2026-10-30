import type { ResultadoOperacionDTO } from './dtos/ResultadoOperacionDTO'

/** Acceso al panel de Adrián. */
export interface IAuthenticationService {
  /** Inicia sesión con email y contraseña. */
  login: (email: string, password: string) => Promise<ResultadoOperacionDTO>;
  /** Cierra la sesión. */
  logout: () => Promise<void>;
  /**
   * Si la cuenta con sesión es un barbero autorizado (tabla `barberos`, ver
   * supabase/migracion-seguridad.sql). Si la función aún no existe en la BD se
   * da por buena, para no dejar fuera a nadie antes de la migración.
   */
  esBarbero: () => Promise<boolean>;
}
