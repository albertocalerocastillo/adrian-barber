import { useState, useEffect } from 'react'
import { supabase } from '../services/SupabaseService'

/**
 * Gestiona la sesión de Supabase Auth para el panel del barbero.
 * Devuelve { sesion, cargando }:
 *  - sesion: objeto de sesión si hay alguien logueado, null si no.
 *  - cargando: true mientras se comprueba la sesión inicial.
 */
export const useAuth = () => {
  const [sesion, setSesion] = useState(null)
  // Si no hay Supabase configurado no hay nada que cargar.
  const [cargando, setCargando] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return
    let vivo = true

    const cargar = async () => {
      const { data } = await supabase.auth.getSession()
      if (!vivo) return
      setSesion(data.session)
      setCargando(false)
    }
    cargar()

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      setSesion(nueva)
    })

    return () => {
      vivo = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { sesion, cargando }
}
