import { useState, useEffect } from 'react'
import { HORARIO } from '../data/horarios'
import { getHorario } from '../lib/config'
import { estadoNegocio } from '../utils/horario'

/**
 * Estado "abierto / cerrado ahora" del negocio, en vivo.
 *
 * Centraliza aquí la carga del horario y el refresco para que lo compartan
 * todos los sitios que lo muestran (hero y sección Horario), en vez de repetir
 * la misma lógica en cada uno.
 *
 * Devuelve { estado, horario, ahora }.
 */
export function useEstadoNegocio() {
  const [ahora, setAhora] = useState(() => new Date())
  const [horario, setHorario] = useState(HORARIO)

  // Refresca cada minuto para que el estado no se quede obsoleto.
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Carga el horario real (Supabase); mientras, vale el estático.
  useEffect(() => {
    let vivo = true
    getHorario().then((h) => {
      if (vivo) setHorario(h)
    })
    return () => {
      vivo = false
    }
  }, [])

  return { estado: estadoNegocio(horario, ahora), horario, ahora }
}
