// #region Imports
import { createPortal } from 'react-dom'
import { AnimatePresence, m } from 'motion/react'
import { Save, RotateCcw } from 'lucide-react'
import { EASE_SMOOTH } from '../../../../../theme/animation'
import PrimaryButtonComponent from '../PrimaryButton/PrimaryButtonComponent'
// #endregion

/**
 * Barra de "Guardar cambios" que solo aparece cuando hay algo sin guardar,
 * para que no se olvide (y no estorbe cuando no hace falta). En un portal,
 * como la Hoja, para quedar por encima de todo.
 */
const SaveBarComponent = ({ visible, guardando, onGuardar, onDescartar, texto = 'Tienes cambios sin guardar' }) => {
  return createPortal(
    <AnimatePresence>
      {visible && (
        <m.div
          className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 md:bottom-6 lg:left-64"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.4, ease: EASE_SMOOTH }}
        >
          <div className="flex w-full max-w-xl items-center gap-2 rounded-2xl bg-tinta p-2 pl-4 text-hueso shadow-2xl shadow-black/30 ring-1 ring-acento/25 sm:gap-3">
            <span className="hidden min-w-0 flex-1 truncate text-sm text-hueso/75 sm:block">{texto}</span>
            <button
              type="button"
              onClick={onDescartar}
              disabled={guardando}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-sm font-medium text-hueso/70 transition-colors hover:bg-white/10 hover:text-hueso sm:flex-none"
            >
              <RotateCcw size={15} /> Descartar
            </button>
            <PrimaryButtonComponent onClick={onGuardar} cargando={guardando} className="flex-1 !rounded-xl !py-3 text-sm sm:flex-none">
              {!guardando && <Save size={16} />} Guardar
            </PrimaryButtonComponent>
          </div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default SaveBarComponent
