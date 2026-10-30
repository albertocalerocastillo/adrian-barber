// #region Imports
import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Check, AlertCircle } from 'lucide-react'
import { EASE_SMOOTH } from '../../../../theme/animation'
import { ToastContext } from './ToastContext'
// #endregion

const DURACION_MS = 5000

/**
 * Avisos cortos abajo de la pantalla ("Cita guardada", "Marcada como
 * atendida · Deshacer"). Sustituyen a los window.confirm: en vez de preguntar
 * "¿seguro?" antes de cada toque, se hace y se ofrece deshacerlo, que es más
 * rápido para el día a día y igual de seguro.
 *
 * Uso: const avisar = useAviso(); avisar({ texto, tipo: 'error', deshacer }).
 */
export const ToastProviderComponent = ({ children }) => {
  const [aviso, setAviso] = useState(null)
  const temporizador = useRef(0)

  const avisar = useCallback(({ texto, tipo = 'ok', deshacer }) => {
    clearTimeout(temporizador.current)
    setAviso({ id: Date.now(), texto, tipo, deshacer })
    temporizador.current = setTimeout(() => setAviso(null), DURACION_MS)
  }, [])

  const cerrar = () => {
    clearTimeout(temporizador.current)
    setAviso(null)
  }

  return (
    <ToastContext.Provider value={avisar}>
      {children}

      {/* Encima de la barra de navegación del móvil (bottom-20) y dejando sitio
          a la derecha para el botón flotante de la agenda (pr-20). */}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex justify-center pl-4 pr-20 md:bottom-6 md:pr-4">
        <AnimatePresence>
          {aviso && (
            <m.div
              key={aviso.id}
              role="status"
              className="pointer-events-auto relative flex w-full max-w-md items-center gap-3 rounded-2xl bg-tinta px-4 py-3 text-sm text-hueso shadow-2xl shadow-black/30 ring-1 ring-white/10"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE_SMOOTH }}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  aviso.tipo === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                }`}
              >
                {aviso.tipo === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              </span>
              <span className="min-w-0 flex-1">{aviso.texto}</span>
              {aviso.deshacer && (
                <button
                  type="button"
                  onClick={() => {
                    aviso.deshacer()
                    cerrar()
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
                transition={{ duration: DURACION_MS / 1000, ease: 'linear' }}
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
