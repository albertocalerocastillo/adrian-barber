// #region Imports
import { useCallback, useRef, useState } from 'react'
import type { FunctionComponent } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Check, AlertCircle } from 'lucide-react'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { ToastTypeEnum } from '../../../../services/enums/ToastTypeEnum'
import { ToastContext } from './ToastContext'
import type { IToastOptions } from './IToastOptions'
import type { IToastProviderProps } from './IToastProviderProps'
// #endregion

// #region Constantes
// Tiempo que se queda el aviso en pantalla, en milisegundos.
const DURATION_MS = 5000

// Milisegundos de un segundo (motion mide en segundos).
const MS_PER_SECOND = 1000
// #endregion

/** Aviso que se está mostrando. */
interface IToast extends IToastOptions {
  /** Identificador, para que cada aviso nuevo se anime aunque repita texto. */
  id: number;
}

/**
 * Avisos cortos abajo de la pantalla ("Cita guardada", "Marcada como
 * atendida · Deshacer"). Sustituyen a los window.confirm: en vez de preguntar
 * "¿seguro?" antes de cada toque, se hace y se ofrece deshacerlo, que es más
 * rápido para el día a día y igual de seguro.
 *
 * Uso: const showToast = useToast(); showToast({ text, type: ToastTypeEnum.Error, onUndo }).
 */
const ToastProviderComponent: FunctionComponent<IToastProviderProps> = ({ children }) => {
  // #region Declaraciones, variables y hooks
  const [toast, setToast] = useState<IToast | null>(null)
  const timer = useRef<number>(0)

  const showToast = useCallback(({ text, type = ToastTypeEnum.Ok, onUndo }: IToastOptions) => {
    window.clearTimeout(timer.current)
    setToast({ id: Date.now(), text, type, onUndo })
    timer.current = window.setTimeout(() => setToast(null), DURATION_MS)
  }, [])

  const close = () => {
    window.clearTimeout(timer.current)
    setToast(null)
  }
  // #endregion

  // #region Renderizado
  return (
    <ToastContext.Provider value={showToast}>
      {children}

      {/* Encima de la barra de navegación del móvil (bottom-20) y dejando sitio
          a la derecha para el botón flotante de la agenda (pr-20). */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex justify-center pl-4 pr-20 md:bottom-6 md:pr-4">
        <AnimatePresence>
          {toast && (
            <m.div
              key={toast.id}
              role="status"
              className="pointer-events-auto relative flex w-full max-w-md items-center gap-3 rounded-2xl bg-tinta px-4 py-3 text-sm text-hueso shadow-2xl shadow-black/30 ring-1 ring-white/10"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE_SMOOTH }}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  toast.type === ToastTypeEnum.Error ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                }`}
              >
                {toast.type === ToastTypeEnum.Error ? <AlertCircle size={16} /> : <Check size={16} />}
              </span>
              <span className="min-w-0 flex-1">{toast.text}</span>
              {toast.onUndo && (
                <button
                  type="button"
                  onClick={() => {
                    toast.onUndo?.()
                    close()
                  }}
                  className="shrink-0 rounded-full px-3 py-1.5 font-semibold text-acento transition-colors hover:bg-white/10"
                >
                  Deshacer
                </button>
              )}
              {/* Hilo que se consume: cuánto queda para que se vaya. */}
              <m.span
                aria-hidden="true"
                className="absolute inset-x-4 bottom-0 h-0.5 origin-left rounded-full bg-acento/50"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: DURATION_MS / MS_PER_SECOND, ease: 'linear' }}
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
  // #endregion
}

export default ToastProviderComponent
