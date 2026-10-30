// La llamada a CallMeBot se hace en una Edge Function de Supabase
// (supabase/functions/aviso-cita), NO aquí: así la apikey vive como secreto
// del servidor y nunca llega al navegador.
//
// Solo manda móvil + hora: la función busca la cita en la BD y compone el
// mensaje con lo guardado.
import { supabase } from './SupabaseService'
import type { INotificationService } from './INotificationService'

// #region Constantes
// Nombre de la Edge Function que manda el WhatsApp.
const FUNCION_AVISO = 'aviso-cita'
// #endregion

const avisarNuevaCita: INotificationService['avisarNuevaCita'] = ({ clienteMovil, inicio }) => {
  // Sin Supabase no hay función a la que llamar.
  if (!supabase) return

  // Si el aviso falla, la cita sigue guardada: no se le dice nada al cliente.
  supabase.functions
    .invoke(FUNCION_AVISO, { body: { clienteMovil, inicio: inicio.toISOString() } })
    .catch(() => undefined)
}

/** Avisos a Adrián cuando entra una cita por la web. */
export const NotificationService: INotificationService = { avisarNuevaCita }
