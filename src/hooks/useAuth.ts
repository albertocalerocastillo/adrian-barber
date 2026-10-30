import { useState, useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../services/SupabaseService'

/**
 * Gestiona la sesión de Supabase Auth para el panel del barbero.
 * Devuelve { sesion, cargando }:
 *  - sesion: objeto de sesión si hay alguien logueado, null si no.
 *  - cargando: true mientras se comprueba la sesión inicial.
 */
export const useAuth = () => {
  const [sesion, setSesion] = useState<Session | null>(null)
  // Si no hay Supabase configurado no hay nada que cargar.
  const [cargando, setCargando] = useState<boolean>(Boolean(supabase))

  useEffect(() => {
    const cliente = supabase
    if (!cliente) return undefined
    let vivo = true

    const cargar = async () => {
      const { data } = await cliente.auth.getSession()
      if (!vivo) return
      setSesion(data.session)
      setCargando(false)
    }
    cargar()

    const { data: sub } = cliente.auth.onAuthStateChange((_evento, nueva) => {
      setSesion(nueva)
    })

    return () => {
      vivo = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return { sesion, cargando }
}
