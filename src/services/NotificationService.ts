// La llamada a CallMeBot se hace en una Edge Function de Supabase
// (supabase/functions/aviso-cita), NO aquí: así la apikey vive como secreto
// del servidor y nunca llega al navegador.
//
// Solo manda móvil + hora: la función busca la cita en la BD y compone el
// mensaje con lo guardado.
import { supabase } from './SupabaseService'
import { wait } from '../utils/wait'
import type { INotificationService } from './INotificationService'

// #region Constantes
// Nombre de la Edge Function que manda el WhatsApp.
const FUNCION_AVISO = 'aviso-cita'

// Intentos en total si el aviso falla (red o CallMeBot), y espera entre uno y otro.
const INTENTOS_AVISO = 3
const ESPERA_REINTENTO_MS = 4000
// #endregion

/** Respuesta de la función del aviso. */
interface RespuestaAviso {
  /** Si el WhatsApp ha salido. */
  avisado?: boolean;
  /** Por qué no ha salido ("ya avisada", "CallMeBot no responde"…). */
  motivo?: string;
}

// Motivos por los que no merece la pena reintentar (ya se avisó o no hay nada que avisar).
const MOTIVOS_DEFINITIVOS = ['ya avisada', 'cita no encontrada o ya avisada', 'sin configurar']

const avisarNuevaCita: INotificationService['avisarNuevaCita'] = ({ clienteMovil, inicio }) => {
  // Sin Supabase no hay función a la que llamar.
  if (!supabase) return
  const cliente = supabase

  // Se reintenta unas veces si falla la red o CallMeBot (la función no repite avisos: marca la cita
  // antes de mandar y la desmarca si no sale). Si aun así falla, la cita sigue guardada: no se le dice
  // nada al cliente y Adrián la ve en el panel.
  const intentar = async () => {
    for (let intento = 1; intento <= INTENTOS_AVISO; intento++) {
      const { data, error } = await cliente.functions
        .invoke<RespuestaAviso>(FUNCION_AVISO, { body: { clienteMovil, inicio: inicio.toISOString() } })
        .catch(() => ({ data: null, error: true }))
      if (!error && (data?.avisado || MOTIVOS_DEFINITIVOS.includes(data?.motivo ?? ''))) return
      if (intento < INTENTOS_AVISO) await wait(ESPERA_REINTENTO_MS)
    }
  }
  intentar()
}

/** Avisos a Adrián cuando entra una cita por la web. */
export const NotificationService: INotificationService = { avisarNuevaCita }
