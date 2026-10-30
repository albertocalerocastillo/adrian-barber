import { createContext, useContext } from 'react'

// Contexto de los avisos del panel (ver Aviso.jsx). Va en su propio archivo
// para que el componente se recargue bien en desarrollo.
export const ToastContext = createContext(() => {})

/** Devuelve avisar({ texto, tipo: 'ok' | 'error', deshacer }). */
export const useToast = () => {
  return useContext(ToastContext)
}
