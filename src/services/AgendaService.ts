import { supabase } from './SupabaseService'
import { ERROR_SIN_SUPABASE, CODIGO_SOLAPE } from './SupabaseConstants'
import { EstadoCitaEnum } from './enums/EstadoCitaEnum'
import { TablaSupabaseEnum } from './enums/TablaSupabaseEnum'
import type { IAgendaService } from './IAgendaService'
import type { CitaDTO } from './dtos/CitaDTO'
import type { BloqueoDTO } from './dtos/BloqueoDTO'
import type { ResultadoOperacionDTO } from './dtos/ResultadoOperacionDTO'
import type { OrigenCitaEnum } from './enums/OrigenCitaEnum'
import { patronSinTildes } from '../utils/search'
import { limpiarMovil } from '../utils/phone'

// #region Constantes
// Mensajes de error para Adrián.
const ERROR_HUECO_OCUPADO = 'Ese hueco ya está ocupado.'
const ERROR_CREAR_CITA = 'No se pudo crear la cita.'
const ERROR_MOVER_CITA = 'No se pudo cambiar la cita.'
const ERROR_GUARDAR = 'No se pudo guardar. Revisa la conexión.'
const ERROR_CARGAR = 'No se pudo cargar la agenda. Revisa la conexión.'

// Mensajes de Postgres cuando una cita pisa a otra.
const PATRON_SOLAPE = /exclu|overlap/i

// Búsqueda: letras mínimas y resultados máximos.
const LONGITUD_MINIMA_BUSQUEDA = 2
const MAXIMO_RESULTADOS_BUSQUEDA = 60
// #endregion

// #region Conversión de filas
/** Fila de la tabla `citas` tal como la devuelve Supabase. */
interface FilaCita {
  id: number | string;
  servicio_nombre: string;
  cliente_nombre: string;
  cliente_movil: string | null;
  inicio: string;
  fin: string;
  estado: EstadoCitaEnum;
  notas: string | null;
  origen?: OrigenCitaEnum;
}

/** Fila de Supabase → CitaDTO (camelCase). */
const aCitaDTO = (fila: FilaCita): CitaDTO => {
  const result: CitaDTO = {
    id: fila.id,
    servicioNombre: fila.servicio_nombre,
    clienteNombre: fila.cliente_nombre,
    clienteMovil: fila.cliente_movil ?? '',
    inicio: fila.inicio,
    fin: fila.fin,
    estado: fila.estado,
    notas: fila.notas ?? null,
    origen: fila.origen,
  }
  return result
}

/** Resultado de una escritura simple: bien, o el mensaje de Supabase. */
/** ¿El error es porque la cita pisa a otra? */
const esSolape = (error: { message: string; code?: string }) =>
  error.code === CODIGO_SOLAPE || PATRON_SOLAPE.test(error.message)

// Nunca se enseña a Adrián el mensaje técnico de Postgres (en inglés): se traduce.
const resultadoEscritura = (error: { message: string; code?: string } | null): ResultadoOperacionDTO => {
  if (!error) return { ok: true }
  const result: ResultadoOperacionDTO = { ok: false, error: esSolape(error) ? ERROR_HUECO_OCUPADO : ERROR_GUARDAR }
  return result
}
// #endregion

// #region Citas
const listarCitas: IAgendaService['listarCitas'] = async (desde, hasta) => {
  if (!supabase) return []
  const { data, error } = await supabase
    .from(TablaSupabaseEnum.Citas)
    .select('*')
    .gte('inicio', desde.toISOString())
    .lt('inicio', hasta.toISOString())
    .order('inicio', { ascending: true })
  // Un fallo se lanza (no se devuelve vacío): una agenda vacía por error haría creer a Adrián que no tiene citas.
  if (error) throw new Error(ERROR_CARGAR)
  return ((data as FilaCita[] | null) ?? []).map(aCitaDTO)
}

const cambiarEstado: IAgendaService['cambiarEstado'] = async (id, estado) => {
  if (!supabase) return { ok: false, error: ERROR_SIN_SUPABASE }
  const { error } = await supabase.from(TablaSupabaseEnum.Citas).update({ estado }).eq('id', id)
  return resultadoEscritura(error)
}

const crearCitaManual: IAgendaService['crearCitaManual'] = async (cita) => {
  if (!supabase) return { ok: false, error: ERROR_SIN_SUPABASE }
  const { error } = await supabase.from(TablaSupabaseEnum.Citas).insert({
    // El servicio_id (bigint FK) se omite: los servicios de la web usan id de texto.
    servicio_nombre: cita.servicioNombre,
    cliente_nombre: cita.clienteNombre,
    // Si es un móvil español se guarda en 9 cifras, como los de la web (así se reconoce al cliente de siempre).
    cliente_movil: limpiarMovil(cita.clienteMovil || '') ?? (cita.clienteMovil || ''),
    inicio: cita.inicio.toISOString(),
    fin: cita.fin.toISOString(),
    estado: EstadoCitaEnum.Pendiente,
    notas: cita.notas || null,
  })
  if (error) return { ok: false, error: esSolape(error) ? ERROR_HUECO_OCUPADO : ERROR_CREAR_CITA }
  return { ok: true }
}

const moverCita: IAgendaService['moverCita'] = async (id, inicio, fin) => {
  if (!supabase) return { ok: false, error: ERROR_SIN_SUPABASE }
  const { error } = await supabase
    .from(TablaSupabaseEnum.Citas)
    .update({ inicio: inicio.toISOString(), fin: fin.toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: esSolape(error) ? ERROR_HUECO_OCUPADO : ERROR_MOVER_CITA }
  return { ok: true }
}

const buscarCitas: IAgendaService['buscarCitas'] = async (texto) => {
  if (!supabase) return []
  const limpio = texto.trim()
  if (limpio.length < LONGITUD_MINIMA_BUSQUEDA) return []
  // Si son todo cifras se busca por móvil; si no, por nombre sin que importen las tildes.
  const movil = limpio.replace(/\s+/g, '')
  const todas = supabase.from(TablaSupabaseEnum.Citas).select('*')
  const filtradas = /^\d+$/.test(movil)
    ? todas.ilike('cliente_movil', `%${movil}%`)
    : todas.filter('cliente_nombre', 'imatch', patronSinTildes(limpio))
  const { data, error } = await filtradas
    .order('inicio', { ascending: false })
    .limit(MAXIMO_RESULTADOS_BUSQUEDA)
  if (error) {
    console.error('Error buscando citas:', error.message)
    return []
  }
  return ((data as FilaCita[] | null) ?? []).map(aCitaDTO)
}
// #endregion

// #region Bloqueos
const listarBloqueos: IAgendaService['listarBloqueos'] = async (desde, hasta) => {
  if (!supabase) return []
  const { data, error } = await supabase
    .from(TablaSupabaseEnum.Bloqueos)
    .select('*')
    .lt('inicio', hasta.toISOString())
    .gt('fin', desde.toISOString())
    .order('inicio', { ascending: true })
  if (error) throw new Error(ERROR_CARGAR)
  return (data as BloqueoDTO[] | null) ?? []
}

const crearBloqueo: IAgendaService['crearBloqueo'] = async ({ inicio, fin, motivo }) => {
  if (!supabase) return { ok: false, error: ERROR_SIN_SUPABASE }
  const { error } = await supabase.from(TablaSupabaseEnum.Bloqueos).insert({
    inicio: inicio.toISOString(),
    fin: fin.toISOString(),
    motivo: motivo || null,
  })
  return resultadoEscritura(error)
}

const borrarBloqueo: IAgendaService['borrarBloqueo'] = async (id) => {
  if (!supabase) return { ok: false, error: ERROR_SIN_SUPABASE }
  const { error } = await supabase.from(TablaSupabaseEnum.Bloqueos).delete().eq('id', id)
  return resultadoEscritura(error)
}
// #endregion

/** Agenda del panel (requiere sesión de Adrián). */
export const AgendaService: IAgendaService = {
  listarCitas,
  listarBloqueos,
  cambiarEstado,
  crearCitaManual,
  moverCita,
  buscarCitas,
  crearBloqueo,
  borrarBloqueo,
}
