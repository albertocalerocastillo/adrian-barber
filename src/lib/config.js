// ════════════════════════════════════════════════════════════
//  Configuración editable: HORARIO de trabajo y SERVICIOS.
//  Lee/escribe en Supabase para que tanto la reserva pública como el panel
//  usen la misma fuente. Si no hay Supabase o está vacío, cae a los datos
//  estáticos de src/data/ (horarios.js / servicios.js).
// ════════════════════════════════════════════════════════════
import { supabase } from './supabase'
import { HORARIO } from '../data/horarios'
import { SERVICIOS } from '../data/servicios'

const NOMBRES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
// Orden de presentación: lunes primero, domingo al final.
const ORDEN = [1, 2, 3, 4, 5, 6, 0]

/**
 * Devuelve el horario en la estructura de la app:
 *   [{ dia, nombre, tramos: [['HH:MM','HH:MM'], ...] }]  (7 días)
 */
export async function getHorario() {
  if (!supabase) return HORARIO

  const { data, error } = await supabase
    .from('horario')
    .select('dia_semana, hora_inicio, hora_fin')
    .order('dia_semana', { ascending: true })
    .order('hora_inicio', { ascending: true })

  if (error || !data || data.length === 0) return HORARIO

  return ORDEN.map((dia) => ({
    dia,
    nombre: NOMBRES[dia],
    tramos: data
      .filter((r) => r.dia_semana === dia)
      .map((r) => [r.hora_inicio.slice(0, 5), r.hora_fin.slice(0, 5)]),
  }))
}

/**
 * Guarda el horario completo (solo panel autenticado). Borra el anterior y
 * escribe el nuevo. `dias` es la estructura de arriba.
 */
export async function guardarHorario(dias) {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }

  const { error: errBorrar } = await supabase.from('horario').delete().gte('id', 0)
  if (errBorrar) return { ok: false, error: errBorrar.message }

  const filas = dias.flatMap((d) =>
    d.tramos
      .filter(([ini, fin]) => ini && fin && fin > ini)
      .map(([ini, fin]) => ({ dia_semana: d.dia, hora_inicio: ini, hora_fin: fin }))
  )

  if (filas.length > 0) {
    const { error } = await supabase.from('horario').insert(filas)
    if (error) return { ok: false, error: error.message }
  }
  return { ok: true }
}

// ════════════════════════════════════════════════════════════
//  SERVICIOS
//  La app trabaja con la forma { id, nombre, descripcion, duracion, precio,
//  icono, destacado, activo }. En Supabase la columna es `duracion_min`, así
//  que traducimos en ambos sentidos (aApp / aDb) para no tocar los
//  consumidores (reserva, panel y home).
// ════════════════════════════════════════════════════════════

/** Fila de Supabase → forma de la app. */
function aApp(r) {
  return {
    id: r.id,
    nombre: r.nombre,
    descripcion: r.descripcion || '',
    duracion: r.duracion_min,
    precio: Number(r.precio),
    icono: r.icono || 'Scissors',
    destacado: !!r.destacado,
    activo: r.activo !== false,
  }
}

/** Forma de la app → columnas de Supabase (sin id ni orden; los pone quien escribe). */
function aDb(s) {
  return {
    nombre: (s.nombre || '').trim(),
    descripcion: s.descripcion?.trim() ? s.descripcion.trim() : null,
    duracion_min: Number(s.duracion),
    precio: Number(s.precio) || 0,
    icono: s.icono || 'Scissors',
    destacado: !!s.destacado,
    activo: s.activo !== false,
  }
}

/**
 * Devuelve los servicios (todos, incluidos los inactivos, ordenados). Los
 * consumidores filtran por `activo` según convenga. Fallback al estático.
 */
export async function getServicios() {
  if (!supabase) return SERVICIOS

  const { data, error } = await supabase
    .from('servicios')
    .select('id, nombre, descripcion, duracion_min, precio, icono, destacado, activo, orden')
    .order('orden', { ascending: true })
    .order('id', { ascending: true })

  if (error || !data || data.length === 0) return SERVICIOS

  return data.map(aApp)
}

/**
 * Guarda la lista completa de servicios (solo panel autenticado). Igual que el
 * horario: borra los anteriores y escribe los nuevos, fijando `orden` por
 * posición. Las citas guardan el nombre del servicio (no el id), así que
 * regenerar ids no afecta al histórico.
 */
export async function guardarServicios(lista) {
  if (!supabase) return { ok: false, error: 'Supabase no configurado.' }

  const filas = lista
    .filter((s) => (s.nombre || '').trim() && Number(s.duracion) > 0)
    .map((s, i) => ({ ...aDb(s), orden: i + 1 }))

  const { error: errBorrar } = await supabase.from('servicios').delete().gte('id', 0)
  if (errBorrar) return { ok: false, error: errBorrar.message }

  if (filas.length > 0) {
    const { error } = await supabase.from('servicios').insert(filas)
    if (error) return { ok: false, error: error.message }
  }
  return { ok: true }
}

export { NOMBRES, ORDEN }
