// ════════════════════════════════════════════════════════════
//  CAPA DE DATOS DE CITAS
//  Funciona en dos modos, de forma transparente para la UI:
//   - Si Supabase está configurado (.env)  -> lee/escribe en la nube.
//   - Si NO                                -> usa localStorage del navegador,
//     para poder PROBAR la reserva ya, sin backend.
//
//  ⚠️ El seguro definitivo anti-doble-reserva está en la BD (exclusion
//     constraint, ver supabase/schema.sql). En modo localStorage hacemos una
//     comprobación de solape "best effort" antes de guardar.
// ════════════════════════════════════════════════════════════
import { supabase } from './supabase'
import { solapan } from '../utils/disponibilidad'
import { avisarNuevaCita } from './aviso'

const LS_KEY = 'as_citas'

// ─── localStorage helpers ───────────────────────────────────
function lsLeer() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}
function lsGuardar(citas) {
  localStorage.setItem(LS_KEY, JSON.stringify(citas))
}

/**
 * Devuelve las citas ACTIVAS (no canceladas) que se solapan con el rango dado.
 * @param {Date} desde @param {Date} hasta
 * @returns {Promise<Array<{inicio:string, fin:string}>>}
 */
export async function getCitas(desde, hasta) {
  if (supabase) {
    // Usa la función segura: devuelve solo inicio/fin (sin datos personales).
    const { data, error } = await supabase.rpc('citas_ocupadas', {
      p_desde: desde.toISOString(),
      p_hasta: hasta.toISOString(),
    })
    if (error) {
      console.error('Error cargando citas:', error.message)
      return []
    }
    return data || []
  }

  // localStorage
  return lsLeer().filter(
    (c) =>
      c.estado !== 'cancelada' &&
      new Date(c.inicio) < hasta &&
      new Date(c.fin) > desde
  )
}

/**
 * Crea una cita. Devuelve { ok, error }.
 * @param {Object} cita {servicioId, servicioNombre, clienteNombre,
 *   clienteMovil, clienteEmail, inicio:Date, fin:Date}
 */
export async function crearCita(cita) {
  const registro = {
    servicio_id: cita.servicioId,
    servicio_nombre: cita.servicioNombre,
    cliente_nombre: cita.clienteNombre,
    cliente_movil: cita.clienteMovil,
    cliente_email: cita.clienteEmail || null,
    inicio: cita.inicio.toISOString(),
    fin: cita.fin.toISOString(),
    estado: 'pendiente',
  }

  if (supabase) {
    const { error } = await supabase.from('citas').insert(registro)
    if (error) {
      // 23P01 = violación de exclusion constraint (solape) en PostgreSQL
      const ocupado = error.code === '23P01' || /exclu|overlap/i.test(error.message)
      return {
        ok: false,
        error: ocupado
          ? 'Ese hueco se acaba de ocupar. Elige otra hora, por favor.'
          : 'No se pudo guardar la cita. Inténtalo de nuevo.',
      }
    }
    avisarNuevaCita(cita)
    return { ok: true }
  }

  // localStorage: comprobación de solape antes de guardar
  const citas = lsLeer()
  const ini = new Date(registro.inicio)
  const fin = new Date(registro.fin)
  const choca = citas.some(
    (c) =>
      c.estado !== 'cancelada' &&
      solapan(ini, fin, new Date(c.inicio), new Date(c.fin))
  )
  if (choca) {
    return { ok: false, error: 'Ese hueco se acaba de ocupar. Elige otra hora, por favor.' }
  }
  citas.push({ ...registro, id: `local-${citas.length + 1}-${ini.getTime()}` })
  lsGuardar(citas)
  avisarNuevaCita(cita)
  return { ok: true }
}
