// ════════════════════════════════════════════════════════════
//  Configuración editable: HORARIO de trabajo.
//  Lee/escribe el horario en Supabase para que tanto la reserva pública como
//  el panel usen la misma fuente. Si no hay Supabase o está vacío, cae al
//  horario estático de src/data/horarios.js.
// ════════════════════════════════════════════════════════════
import { supabase } from './supabase'
import { HORARIO } from '../data/horarios'

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

export { NOMBRES, ORDEN }
