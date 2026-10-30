// #region Imports
import { createContext, useContext } from 'react'
import type { IToastOptions } from './IToastOptions'
// #endregion

/**
 * Contexto de los avisos del panel (ver ToastProviderComponent). Va en su
 * propio archivo para que el componente se recargue bien en desarrollo.
 */
export const ToastContext = createContext<(options: IToastOptions) => void>(() => {})

/** Devuelve la función para mostrar un aviso: showToast({ text, type, onUndo }). */
export const useToast = (): ((options: IToastOptions) => void) => {
  const result = useContext(ToastContext)
  return result
}
