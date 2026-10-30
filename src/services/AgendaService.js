// ════════════════════════════════════════════════════════════
//  Acceso a datos del PANEL del barbero (requiere sesión autenticada).
//  A diferencia de BookingService (público, sin datos personales), aquí sí se
//  leen los datos completos de las citas, porque lo usa Adrián logueado.
//  La RLS permite todo esto solo a usuarios autenticados.
// ════════════════════════════════════════════════════════════
import { supabase } from './SupabaseService'
import { EstadoCitaEnum } from './enums/EstadoCitaEnum'

/** Inicia sesión con email + contraseña. Devuelve { ok, error }. */
export const login = async (email, password) => {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const malas = /invalid login credentials/i.test(error.message)
    return { ok: false, error: malas ? 'Email o contraseña incorrectos.' : error.message }
  }
  return { ok: true }
}

/**
 * ¿La cuenta con sesión es un barbero autorizado? (lista `barberos` de la BD,
 * ver supabase/migracion-seguridad.sql). Si la función aún no existe en la BD
 * se da por buena, para no dejar fuera a nadie antes de la migración.
 */
export const esBarbero = async () => {
  if (!supabase) return true
  const { data, error } = await supabase.rpc('es_barbero')
  if (error) return error.code === 'PGRST202' || /not find|does not exist/i.test(error.message)
  return data === true
}

/** Cierra la sesión. */
export const logout = async () => {
  if (supabase) await supabase.auth.signOut()
}

/** Lista las citas (datos completos) que empiezan en el rango [desde, hasta). */
export const listarCitas = async (desde, hasta) => {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .gte('inicio', desde.toISOString())
    .lt('inicio', hasta.toISOString())
    .order('inicio', { ascending: true })
  if (error) {
    console.error('Error listando citas:', error.message)
    return []
  }
  return data || []
}

/** Lista los bloqueos que se solapan con el rango [desde, hasta). */
export const listarBloqueos = async (desde, hasta) => {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('bloqueos')
    .select('*')
    .lt('inicio', hasta.toISOString())
    .gt('fin', desde.toISOString())
    .order('inicio', { ascending: true })
  if (error) {
    console.error('Error listando bloqueos:', error.message)
    return []
  }
  return data || []
}

/** Cambia el estado de una cita ('pendiente' | 'atendida' | 'cancelada'). */
export const cambiarEstado = async (id, estado) => {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }
  const { error } = await supabase.from('citas').update({ estado }).eq('id', id)
  return error ? { ok: false, error: error.message } : { ok: true }
}

/** Crea una cita manual (teléfono/presencial/migración). {inicio,fin} son Date. */
export const crearCitaManual = async (cita) => {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }
  const { error } = await supabase.from('citas').insert({
    // El servicio_id (bigint FK) se omite: los servicios de la web usan id de texto.
    servicio_nombre: cita.servicioNombre,
    cliente_nombre: cita.clienteNombre,
    cliente_movil: cita.clienteMovil || '',
    inicio: cita.inicio.toISOString(),
    fin: cita.fin.toISOString(),
    estado: EstadoCitaEnum.Pendiente,
    notas: cita.notas || null,
  })
  if (error) {
    const ocupado = error.code === '23P01' || /exclu|overlap/i.test(error.message)
    return {
      ok: false,
      error: ocupado ? 'Ese hueco ya está ocupado.' : 'No se pudo crear la cita.',
    }
  }
  return { ok: true }
}

/** Cambia una cita de día u hora. {inicio,fin} son Date. */
export const moverCita = async (id, inicio, fin) => {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }
  const { error } = await supabase
    .from('citas')
    .update({ inicio: inicio.toISOString(), fin: fin.toISOString() })
    .eq('id', id)
  if (error) {
    const ocupado = error.code === '23P01' || /exclu|overlap/i.test(error.message)
    return { ok: false, error: ocupado ? 'Ese hueco ya está ocupado.' : 'No se pudo cambiar la cita.' }
  }
  return { ok: true }
}

/**
 * Busca citas por nombre o móvil (las más recientes primero). Se quitan los
 * caracteres que tienen significado en el filtro `or` de Supabase.
 */
export const buscarCitas = async (texto) => {
  if (!supabase) return []
  const t = texto.replace(/[,()%*\\]/g, ' ').trim()
  if (t.length < 2) return []
  const movil = t.replace(/\s+/g, '')
  const filtro = /^\d+$/.test(movil)
    ? `cliente_movil.ilike.%${movil}%`
    : `cliente_nombre.ilike.%${t}%`
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .or(filtro)
    .order('inicio', { ascending: false })
    .limit(60)
  if (error) {
    console.error('Error buscando citas:', error.message)
    return []
  }
  return data || []
}

/** Crea un bloqueo (vacaciones/descanso). {inicio,fin} son Date. */
export const crearBloqueo = async ({ inicio, fin, motivo }) => {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }
  const { error } = await supabase.from('bloqueos').insert({
    inicio: inicio.toISOString(),
    fin: fin.toISOString(),
    motivo: motivo || null,
  })
  return error ? { ok: false, error: error.message } : { ok: true }
}

/** Borra un bloqueo por id. */
export const borrarBloqueo = async (id) => {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }
  const { error } = await supabase.from('bloqueos').delete().eq('id', id)
  return error ? { ok: false, error: error.message } : { ok: true }
}
