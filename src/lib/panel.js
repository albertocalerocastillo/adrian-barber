// ════════════════════════════════════════════════════════════
//  Acceso a datos del PANEL del barbero (requiere sesión autenticada).
//  A diferencia de lib/citas.js (público, sin datos personales), aquí sí se
//  leen los datos completos de las citas, porque lo usa Adrián logueado.
//  La RLS permite todo esto solo a usuarios autenticados.
// ════════════════════════════════════════════════════════════
import { supabase } from './supabase'

/** Inicia sesión con email + contraseña. Devuelve { ok, error }. */
export async function login(email, password) {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    const malas = /invalid login credentials/i.test(error.message)
    return { ok: false, error: malas ? 'Email o contraseña incorrectos.' : error.message }
  }
  return { ok: true }
}

/** Cierra la sesión. */
export async function logout() {
  if (supabase) await supabase.auth.signOut()
}

/** Lista las citas (datos completos) que empiezan en el rango [desde, hasta). */
export async function listarCitas(desde, hasta) {
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
export async function listarBloqueos(desde, hasta) {
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
export async function cambiarEstado(id, estado) {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }
  const { error } = await supabase.from('citas').update({ estado }).eq('id', id)
  return error ? { ok: false, error: error.message } : { ok: true }
}

/** Crea una cita manual (teléfono/presencial/migración). {inicio,fin} son Date. */
export async function crearCitaManual(cita) {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }
  const { error } = await supabase.from('citas').insert({
    // servicio_id (bigint FK) se omite: los servicios de la web usan id de texto.
    servicio_nombre: cita.servicioNombre,
    cliente_nombre: cita.clienteNombre,
    cliente_movil: cita.clienteMovil || '',
    inicio: cita.inicio.toISOString(),
    fin: cita.fin.toISOString(),
    estado: 'pendiente',
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

/** Crea un bloqueo (vacaciones/descanso). {inicio,fin} son Date. */
export async function crearBloqueo({ inicio, fin, motivo }) {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }
  const { error } = await supabase.from('bloqueos').insert({
    inicio: inicio.toISOString(),
    fin: fin.toISOString(),
    motivo: motivo || null,
  })
  return error ? { ok: false, error: error.message } : { ok: true }
}

/** Borra un bloqueo por id. */
export async function borrarBloqueo(id) {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }
  const { error } = await supabase.from('bloqueos').delete().eq('id', id)
  return error ? { ok: false, error: error.message } : { ok: true }
}
