// ════════════════════════════════════════════════════════════
//  Aviso de cita nueva por WhatsApp.
//
//  La llamada a CallMeBot se hace en una Edge Function de Supabase
//  (supabase/functions/aviso-cita), NO aquí: así la apikey vive como secreto
//  del servidor y nunca llega al navegador. Antes iba en VITE_CALLMEBOT_APIKEY
//  y Vite la incrustaba en el JS público.
//
//  Es "fire-and-forget": no bloquea la confirmación y, si falla, la cita ya
//  está guardada igualmente.
// ════════════════════════════════════════════════════════════
import { supabase } from './supabase'

export function avisarNuevaCita({ servicioNombre, clienteNombre, clienteMovil, inicio }) {
  if (!supabase) return // sin Supabase no hay función a la que llamar

  supabase.functions
    .invoke('aviso-cita', {
      body: {
        servicioNombre,
        clienteNombre,
        clienteMovil,
        inicio: inicio instanceof Date ? inicio.toISOString() : inicio,
      },
    })
    .catch(() => {})
}
