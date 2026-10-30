import { useState, useEffect } from 'react'
import { HORARIO } from '../data/openingHours'
import { ConfigurationService } from '../services/ConfigurationService'
import type { HorarioDiaDTO } from '../services/dtos/HorarioDiaDTO'
import { estadoNegocio } from '../utils/schedule'

// Cada cuánto se recalcula si está abierto.
const REFRESCO_MS = 60_000

/**
 * Estado "abierto / cerrado ahora" del negocio, en vivo.
 *
 * Centraliza aquí la carga del horario y el refresco para que lo compartan
 * todos los sitios que lo muestran (hero y sección Horario), en vez de repetir
 * la misma lógica en cada uno.
 *
 * Devuelve { estado, horario, ahora }.
 */
export const useBusinessStatus = () => {
  const [ahora, setAhora] = useState<Date>(() => new Date())
  const [horario, setHorario] = useState<HorarioDiaDTO[]>(HORARIO)

  // Refresca cada minuto para que el estado no se quede obsoleto.
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), REFRESCO_MS)
    return () => clearInterval(id)
  }, [])

  // Carga el horario real (Supabase); mientras, vale el estático.
  useEffect(() => {
    let vivo = true
    const cargar = async () => {
      const h = await ConfigurationService.getHorario()
      if (vivo) setHorario(h)
    }
    cargar()
    return () => {
      vivo = false
    }
  }, [])

  return { estado: estadoNegocio(horario, ahora), horario, ahora }
}
