// ════════════════════════════════════════════════════════════
//  Aviso de cita nueva por WhatsApp.
//
//  La llamada a CallMeBot se hace en una Edge Function de Supabase
//  (supabase/functions/aviso-cita), NO aquí: así la apikey vive como secreto
//  del servidor y nunca llega al navegador. Antes iba en VITE_CALLMEBOT_APIKEY
//  y Vite la incrustaba en el JS público.
//
//  Es "fire-and-forget": no bloquea la confirmación y, si falla, la cita ya
//  está guardada igualmente. NUNCA debe lanzar un error: si lo hiciera, el
//  cliente vería "no se pudo guardar" con la cita YA guardada, y reservaría
//  otra vez.
//
//  Solo manda móvil + hora: la función busca la cita en la BD y compone el
//  mensaje con lo guardado (ver supabase/functions/aviso-cita).
// ════════════════════════════════════════════════════════════
import { supabase } from './SupabaseService'

/** Pide a la Edge Function que avise a Adrián de la cita nueva, sin esperar ni lanzar errores. */
export const avisarNuevaCita = ({ clienteMovil, inicio }) => {
  // Sin Supabase no hay función a la que llamar.
  if (!supabase) return

  try {
    Promise.resolve(
      supabase.functions.invoke('aviso-cita', {
        body: {
          clienteMovil,
          inicio: inicio instanceof Date ? inicio.toISOString() : inicio,
        },
      })
    ).catch(() => {})
  } catch {
    // Sin aviso, pero la cita sigue guardada.
  }
}
