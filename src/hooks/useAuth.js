import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Gestiona la sesión de Supabase Auth para el panel del barbero.
 * Devuelve { sesion, cargando }:
 *  - sesion: objeto de sesión si hay alguien logueado, null si no.
 *  - cargando: true mientras se comprueba la sesión inicial.
 */
export function useAuth() {
  const [sesion, setSesion] = useState(null)
  // Si no hay Supabase configurado no hay nada que cargar.
  const [cargando, setCargando] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return
    let vivo = true

    supabase.auth.getSession().then(({ data }) => {
      if (!vivo) return
      setSesion(data.session)
      setCargando(false)
    })

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
