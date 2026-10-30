import { supabase } from './SupabaseService'
import { ERROR_SIN_SUPABASE } from './SupabaseConstants'
import { FuncionSupabaseEnum } from './enums/FuncionSupabaseEnum'
import type { IAuthenticationService } from './IAuthenticationService'

// #region Constantes
// Mensaje de Supabase cuando el email o la contraseña no valen.
const PATRON_CREDENCIALES = /invalid login credentials/i

// Código y mensajes de Supabase cuando la función RPC no existe todavía.
const CODIGO_FUNCION_INEXISTENTE = 'PGRST202'
const PATRON_FUNCION_INEXISTENTE = /not find|does not exist/i
// #endregion

const login: IAuthenticationService['login'] = async (email, password) => {
  if (!supabase) return { ok: false, error: ERROR_SIN_SUPABASE }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const credencialesMalas = PATRON_CREDENCIALES.test(error.message)
    return { ok: false, error: credencialesMalas ? 'Email o contraseña incorrectos.' : error.message }
  }
  return { ok: true }
}

const logout: IAuthenticationService['logout'] = async () => {
  if (supabase) await supabase.auth.signOut()
}

const esBarbero: IAuthenticationService['esBarbero'] = async () => {
  if (!supabase) return true
  const { data, error } = await supabase.rpc(FuncionSupabaseEnum.EsBarbero)
  if (error) return error.code === CODIGO_FUNCION_INEXISTENTE || PATRON_FUNCION_INEXISTENTE.test(error.message)
  return data === true
}

/** Acceso al panel de Adrián. */
export const AuthenticationService: IAuthenticationService = { login, logout, esBarbero }
