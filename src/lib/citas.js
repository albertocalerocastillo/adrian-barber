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
 * Devuelve los ratos OCUPADOS (citas activas y días libres) que se solapan con
 * el rango dado, solo con inicio/fin: nada de datos de otros clientes.
 * Si falla la conexión LANZA un error: es mejor decirle al cliente "no se
 * pudo cargar" que enseñarle todo libre y que luego no pueda reservar.
 * @param {Date} desde @param {Date} hasta
 * @returns {Promise<Array<{inicio:string, fin:string}>>}
 */
export async function getCitas(desde, hasta) {
  if (supabase) {
    // Función segura de la BD: citas + días libres, solo las horas.
    const { data, error } = await supabase.rpc('citas_ocupadas', {
      p_desde: desde.toISOString(),
      p_hasta: hasta.toISOString(),
    })
    if (error) {
      console.error('Error cargando huecos ocupados:', error.message)
      throw new Error('No se pudo cargar la agenda')
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

// Errores que devuelve la base de datos al validar una reserva (ver
// supabase/migracion-reservas-2027.sql), en cristiano. `volverAHoras` = el
// hueco ya no vale y hay que elegir otro.
const ERRORES_BD = {
  citas_sin_solape: { texto: 'Alguien acaba de coger esa hora. Elige otra, por favor.', volverAHoras: true },
  DIA_CERRADO: { texto: 'Ese rato se acaba de cerrar. Elige otra hora, por favor.', volverAHoras: true },
  FUERA_DE_HORARIO: { texto: 'Esa hora ya no está disponible. Elige otra, por favor.', volverAHoras: true },
  SIN_ANTELACION: { texto: 'Esa hora ya está muy cerca. Elige una más tarde.', volverAHoras: true },
  ANTES_DE_INICIO: { texto: 'Esa fecha aún no se puede reservar online.', volverAHoras: true },
  DEMASIADO_LEJOS: { texto: 'Esa fecha queda demasiado lejos. Elige una más cercana.', volverAHoras: true },
  SERVICIO_NO_VALIDO: { texto: 'Ese servicio ha cambiado. Vuelve a empezar, por favor.', volverAHoras: true },
  DATOS_NO_VALIDOS: { texto: 'Revisa tu nombre y tu móvil.' },
  DEMASIADAS_RESERVAS: {
    texto: 'Ahora mismo hay muchas reservas a la vez. Prueba en un rato o escríbeme por WhatsApp.',
  },
  DEMASIADAS_CITAS: {
    texto: 'Ya tienes citas pendientes con ese móvil. Si quieres otra, escríbeme por WhatsApp.',
  },
}

function traducirError(error) {
  const clave = Object.keys(ERRORES_BD).find(
    (k) => error.message?.includes(k) || (k === 'citas_sin_solape' && error.code === '23P01')
  )
  return clave
    ? { ok: false, error: ERRORES_BD[clave].texto, volverAHoras: !!ERRORES_BD[clave].volverAHoras }
    : { ok: false, error: 'No se pudo guardar la cita. Revisa la conexión e inténtalo de nuevo.' }
}

/**
 * Crea una cita. Devuelve { ok } o { ok:false, error, volverAHoras }.
 * @param {Object} cita {servicioId, servicioNombre, clienteNombre,
 *   clienteMovil, inicio:Date, fin:Date}
 */
export async function crearCita(cita) {
  const registro = {
    // servicio_id (bigint FK) se omite: la web usa servicios estáticos con id
    // de texto. Guardamos el nombre, que es lo que se muestra y da el histórico.
    servicio_nombre: cita.servicioNombre,
    cliente_nombre: cita.clienteNombre,
    cliente_movil: cita.clienteMovil,
    inicio: cita.inicio.toISOString(),
    fin: cita.fin.toISOString(),
    estado: 'pendiente',
  }

  if (supabase) {
    const { error } = await supabase.from('citas').insert(registro)
    if (error) return traducirError(error)
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
    return { ok: false, error: ERRORES_BD.citas_sin_solape.texto, volverAHoras: true }
  }
  citas.push({ ...registro, id: `local-${citas.length + 1}-${ini.getTime()}` })
  lsGuardar(citas)
  avisarNuevaCita(cita)
  return { ok: true }
}
