import { createContext, useContext } from 'react'

// Contexto de los avisos del panel (ver Aviso.jsx). Va en su propio archivo
// para que el componente se recargue bien en desarrollo.
export const AvisoContexto = createContext(() => {})

/** Devuelve avisar({ texto, tipo: 'ok' | 'error', deshacer }). */
export function useAviso() {
  return useContext(AvisoContexto)
}
