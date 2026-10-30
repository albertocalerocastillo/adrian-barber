import { supabase } from './SupabaseService'
import { ERROR_SIN_SUPABASE } from './SupabaseConstants'
import { HORARIO } from '../data/openingHours'
import { SERVICIOS } from '../data/services'
import { TablaSupabaseEnum } from './enums/TablaSupabaseEnum'
import type { IConfigurationService } from './IConfigurationService'
import type { HorarioDiaDTO } from './dtos/HorarioDiaDTO'
import type { ServicioDTO } from './dtos/ServicioDTO'

// #region Constantes
/** Nombre de cada día, por su número (Date.getDay()). */
export const NOMBRES_DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/** Orden de presentación: lunes primero, domingo al final. */
export const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0]

// Icono de un servicio sin icono.
const ICONO_POR_DEFECTO = 'Scissors'

// Para borrar todas las filas de una tabla (Supabase pide un filtro).
const ID_MINIMO = 0

// Longitud de "HH:MM" (Postgres devuelve "HH:MM:SS").
const LONGITUD_HORA = 5
// #endregion

// #region Horario
/** Fila de la tabla `horario`. */
interface FilaHorario {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

const getHorario: IConfigurationService['getHorario'] = async () => {
  if (!supabase) return HORARIO

  const { data, error } = await supabase
    .from(TablaSupabaseEnum.Horario)
    .select('dia_semana, hora_inicio, hora_fin')
    .order('dia_semana', { ascending: true })
    .order('hora_inicio', { ascending: true })

  const filas = (data as FilaHorario[] | null) ?? []
  if (error || filas.length === 0) return HORARIO

  const result: HorarioDiaDTO[] = ORDEN_DIAS.map((dia) => ({
    dia,
    nombre: NOMBRES_DIAS[dia],
    tramos: filas
      .filter((f) => f.dia_semana === dia)
      .map((f): [string, string] => [f.hora_inicio.slice(0, LONGITUD_HORA), f.hora_fin.slice(0, LONGITUD_HORA)]),
  }))
  return result
}

const guardarHorario: IConfigurationService['guardarHorario'] = async (dias) => {
  if (!supabase) return { ok: false, error: ERROR_SIN_SUPABASE }

  const { error: errorBorrar } = await supabase.from(TablaSupabaseEnum.Horario).delete().gte('id', ID_MINIMO)
  if (errorBorrar) return { ok: false, error: errorBorrar.message }

  const filas: FilaHorario[] = dias.flatMap((d) =>
    d.tramos
      .filter(([inicio, fin]) => inicio && fin && fin > inicio)
      .map(([inicio, fin]) => ({ dia_semana: d.dia, hora_inicio: inicio, hora_fin: fin }))
  )

  if (filas.length > 0) {
    const { error } = await supabase.from(TablaSupabaseEnum.Horario).insert(filas)
    if (error) return { ok: false, error: error.message }
  }
  return { ok: true }
}
// #endregion

// #region Servicios
// En Supabase las columnas son `duracion_min` y `reserva_online`, así que se
// traducen en ambos sentidos para no tocar a quien los usa.

/** Fila de la tabla `servicios`. */
interface FilaServicio {
  id?: number;
  nombre: string;
  descripcion: string | null;
  duracion_min: number;
  precio: number | string;
  icono: string | null;
  destacado: boolean | null;
  activo: boolean | null;
  reserva_online?: boolean | null;
  orden?: number;
}

/** Fila de Supabase → ServicioDTO. */
const aServicioDTO = (fila: FilaServicio): ServicioDTO => {
  const result: ServicioDTO = {
    id: fila.id ?? fila.nombre,
    nombre: fila.nombre,
    descripcion: fila.descripcion || '',
    duracion: fila.duracion_min,
    precio: Number(fila.precio),
    icono: fila.icono || ICONO_POR_DEFECTO,
    destacado: Boolean(fila.destacado),
    activo: fila.activo !== false,
    online: fila.reserva_online !== false,
  }
  return result
}

/** ServicioDTO → columnas de Supabase (sin id ni orden; los pone quien escribe). */
const aFilaServicio = (servicio: ServicioDTO): FilaServicio => {
  const result: FilaServicio = {
    nombre: (servicio.nombre || '').trim(),
    descripcion: servicio.descripcion?.trim() ? servicio.descripcion.trim() : null,
    duracion_min: Number(servicio.duracion),
    precio: Number(servicio.precio) || 0,
    icono: servicio.icono || ICONO_POR_DEFECTO,
    destacado: Boolean(servicio.destacado),
    activo: servicio.activo !== false,
    reserva_online: servicio.online !== false,
  }
  return result
}

const getServicios: IConfigurationService['getServicios'] = async () => {
  if (!supabase) return SERVICIOS

  // Con '*' (y no una lista de columnas): si falta una columna nueva porque
  // aún no se ha ejecutado su migración, sigue leyendo en vez de fallar.
  const { data, error } = await supabase
    .from(TablaSupabaseEnum.Servicios)
    .select('*')
    .order('orden', { ascending: true })
    .order('id', { ascending: true })

  const filas = (data as FilaServicio[] | null) ?? []
  if (error || filas.length === 0) return SERVICIOS
  return filas.map(aServicioDTO)
}

const guardarServicios: IConfigurationService['guardarServicios'] = async (lista) => {
  if (!supabase) return { ok: false, error: ERROR_SIN_SUPABASE }

  const filas = lista
    .filter((s) => (s.nombre || '').trim() && Number(s.duracion) > 0)
    .map((s, i) => ({ ...aFilaServicio(s), orden: i + 1 }))

  const { error: errorBorrar } = await supabase.from(TablaSupabaseEnum.Servicios).delete().gte('id', ID_MINIMO)
  if (errorBorrar) return { ok: false, error: errorBorrar.message }

  if (filas.length > 0) {
    const { error } = await supabase.from(TablaSupabaseEnum.Servicios).insert(filas)
    if (error) return { ok: false, error: error.message }
  }
  return { ok: true }
}
// #endregion

/** Horario y servicios editables desde el panel. */
export const ConfigurationService: IConfigurationService = { getHorario, guardarHorario, getServicios, guardarServicios }
