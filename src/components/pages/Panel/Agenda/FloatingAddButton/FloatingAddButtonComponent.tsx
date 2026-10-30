// #region Imports
import { useState } from 'react'
import type { FunctionComponent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'motion/react'
import { Ban, CalendarDays, Plus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { EASE_SMOOTH } from '../../../../../theme/animation'
import type { IFloatingAddButtonProps } from './IFloatingAddButtonProps'
// #endregion

// #region Constantes
// Retraso de la animación de entrada entre una opción y la siguiente, en segundos.
const RETRASO_OPCION_S = 0.05
// #endregion

/** Una opción del menú del botón flotante. */
interface OpcionBotonFlotante {
  /** Texto de la opción. */
  texto: string;
  /** Icono de la opción. */
  Icono: LucideIcon;
  /** Se llama al tocarla. */
  accion: () => void;
}

/**
 * Botón flotante (móvil): nueva cita o día libre. Va en un portal para que
 * quede fijo sobre toda la pantalla.
 */
const FloatingAddButtonComponent: FunctionComponent<IFloatingAddButtonProps> = ({ onCita, onBloquear }) => {
  // #region Declaraciones, variables y hooks
  const [abierto, setAbierto] = useState<boolean>(false)
  const opciones: OpcionBotonFlotante[] = [
    { texto: 'Día libre', Icono: Ban, accion: onBloquear },
    { texto: 'Nueva cita', Icono: CalendarDays, accion: onCita },
  ]
  // #endregion

  // #region Renderizado
  return createPortal(
    <div className="md:hidden">
      <AnimatePresence>
        {abierto && (
          <m.div
            className="fixed inset-0 z-40 bg-tinta-900/40 backdrop-blur-[2px]"
            onClick={() => setAbierto(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {abierto &&
            opciones.map((o, i) => (
              <m.button
                key={o.texto}
                type="button"
                onClick={() => {
                  setAbierto(false)
                  o.accion()
                }}
                className="flex items-center gap-3 rounded-full bg-white py-2 pl-4 pr-2 text-sm font-semibold text-tinta shadow-xl"
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ duration: 0.25, delay: (opciones.length - 1 - i) * RETRASO_OPCION_S, ease: EASE_SMOOTH }}
              >
                {o.texto}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tinta/5">
                  <o.Icono size={17} />
                </span>
              </m.button>
            ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-label={abierto ? 'Cerrar' : 'Añadir'}
          aria-expanded={abierto}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-acento text-tinta shadow-xl shadow-acento/40 transition-transform active:scale-90"
        >
          <Plus size={26} className={`transition-transform duration-300 ${abierto ? 'rotate-45' : ''}`} />
        </button>
      </div>
    </div>,
    document.body
  )
  // #endregion
}

export default FloatingAddButtonComponent
