// Cliente único de Supabase para toda la web.
// Las credenciales vienen de variables de entorno (.env, ver .env.example).
// La anon key es pública y segura en el frontend: la protege la RLS de la BD.
//
// Si faltan las variables (p. ej. en la Fase 1, antes de configurar Supabase),
// NO se lanza error: `supabase` queda en null y la web funciona con los datos
// estáticos de src/data/* como red de seguridad.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Cliente de Supabase, o null si la web funciona sin base de datos. */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null

if (!supabase) {
  console.warn(
    'Supabase no configurado (faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
      'La web usará los datos estáticos de src/data/.'
  )
}
