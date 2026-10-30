// Capa de datos de la reserva pública. Funciona en dos modos, de forma
// transparente para la UI:
//  - Si Supabase está configurado (.env), lee y escribe en la nube.
//  - Si no, usa el localStorage del navegador, para poder probar la reserva
//    sin backend.
//
// ⚠️ El seguro definitivo anti-doble-reserva está en la BD (exclusion
// constraint, ver supabase/schema.sql). En modo localStorage se hace una
// comprobación de solape "best effort" antes de guardar.
import { supabase } from './SupabaseService'
import { CODIGO_SOLAPE } from './SupabaseConstants'
import { NotificationService } from './NotificationService'
import { overlaps } from '../utils/availability'
import { EstadoCitaEnum } from './enums/EstadoCitaEnum'
import { TablaSupabaseEnum } from './enums/TablaSupabaseEnum'
import { FuncionSupabaseEnum } from './enums/FuncionSupabaseEnum'
import type { IBookingService } from './IBookingService'
import type { OcupadoDTO } from './dtos/OcupadoDTO'
import type { ResultadoOperacionDTO } from './dtos/ResultadoOperacionDTO'

// #region Constantes
// Clave del localStorage donde se guardan las citas sin Supabase.
const CLAVE_LOCAL = 'as_citas'

// Error que se lanza si no se puede leer la agenda.
const ERROR_CARGA = 'No se pudo cargar la agenda'

// Error genérico al guardar.
const ERROR_GUARDAR = 'No se pudo guardar la cita. Revisa la conexión e inténtalo de nuevo.'

// Clave del error de solape (es también el nombre de la restricción de la BD).
const CLAVE_SOLAPE = 'citas_sin_solape'
// #endregion

// #region Copia local (sin Supabase)
/** Cita tal como se guarda en el localStorage. */
interface CitaLocal {
  id: string;
  servicio_nombre: string;
  cliente_nombre: string;
  cliente_movil: string;
  inicio: string;
  fin: string;
  estado: EstadoCitaEnum;
}

const leerLocal = (): CitaLocal[] => {
  // Si el localStorage está corrupto o bloqueado, se empieza de cero.
  try {
    return JSON.parse(localStorage.getItem(CLAVE_LOCAL) || '[]') as CitaLocal[]
  } catch {
    return []
  }
}

const guardarLocal = (citas: CitaLocal[]) => {
  localStorage.setItem(CLAVE_LOCAL, JSON.stringify(citas))
}
// #endregion

// #region Errores de la base de datos
/** Mensaje para el cliente y si hay que volver a elegir hora. */
interface ErrorReserva {
  texto: string;
  volverAHoras?: boolean;
}

// Errores que devuelve la base de datos al validar una reserva (ver
// supabase/migracion-reservas-2027.sql), en cristiano.
const ERRORES_BD: Record<string, ErrorReserva> = {
  [CLAVE_SOLAPE]: { texto: 'Alguien acaba de coger esa hora. Elige otra, por favor.', volverAHoras: true },
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

const traducirError = (error: { message?: string; code?: string }): ResultadoOperacionDTO => {
  const clave = Object.keys(ERRORES_BD).find(
    (k) => error.message?.includes(k) || (k === CLAVE_SOLAPE && error.code === CODIGO_SOLAPE)
  )
  const result: ResultadoOperacionDTO = clave
    ? { ok: false, error: ERRORES_BD[clave].texto, volverAHoras: Boolean(ERRORES_BD[clave].volverAHoras) }
    : { ok: false, error: ERROR_GUARDAR }
  return result
}
// #endregion

// #region Lectura de citas
const getCitas: IBookingService['getCitas'] = async (desde, hasta) => {
  if (supabase) {
    // Función segura de la BD: citas + días libres, solo las horas.
    const { data, error } = await supabase.rpc(FuncionSupabaseEnum.CitasOcupadas, {
      p_desde: desde.toISOString(),
      p_hasta: hasta.toISOString(),
    })
    if (error) {
      console.error('Error cargando huecos ocupados:', error.message)
      throw new Error(ERROR_CARGA)
    }
    return (data as OcupadoDTO[] | null) ?? []
  }

  // Sin Supabase, las citas salen del localStorage.
  const result: OcupadoDTO[] = leerLocal().filter(
    (c) => c.estado !== EstadoCitaEnum.Cancelada && new Date(c.inicio) < hasta && new Date(c.fin) > desde
  )
  return result
}
// #endregion

// #region Creación de citas
const crearCita: IBookingService['crearCita'] = async (cita) => {
  const registro = {
    // El servicio_id (bigint FK) se omite: la web usa servicios estáticos con id
    // de texto. Se guarda el nombre, que es lo que se muestra y da el histórico.
    servicio_nombre: cita.servicioNombre,
    cliente_nombre: cita.clienteNombre,
    cliente_movil: cita.clienteMovil,
    inicio: cita.inicio.toISOString(),
    fin: cita.fin.toISOString(),
    estado: EstadoCitaEnum.Pendiente,
  }

  if (supabase) {
    const { error } = await supabase.from(TablaSupabaseEnum.Citas).insert(registro)
    if (error) return traducirError(error)
    NotificationService.avisarNuevaCita(cita)
    return { ok: true }
  }

  // Sin Supabase, se comprueba el solape en localStorage antes de guardar.
  const citas = leerLocal()
  const choca = citas.some(
    (c) => c.estado !== EstadoCitaEnum.Cancelada && overlaps(cita.inicio, cita.fin, new Date(c.inicio), new Date(c.fin))
  )
  if (choca) return { ok: false, error: ERRORES_BD[CLAVE_SOLAPE].texto, volverAHoras: true }
  guardarLocal([...citas, { ...registro, id: `local-${citas.length + 1}-${cita.inicio.getTime()}` }])
  NotificationService.avisarNuevaCita(cita)
  return { ok: true }
}
// #endregion

/** Reserva pública: lo que la web puede ver y hacer sin sesión. */
export const BookingService: IBookingService = { getCitas, crearCita }
