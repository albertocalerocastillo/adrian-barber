import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { m } from 'motion/react'
import { X } from 'lucide-react'
import { EASE_SUAVE } from '../../../theme/animacion'

const ESCRITORIO = '(min-width: 640px)'

function useEsEscritorio() {
  const [es, setEs] = useState(() => window.matchMedia(ESCRITORIO).matches)
  useEffect(() => {
    const mq = window.matchMedia(ESCRITORIO)
    const cambio = () => setEs(mq.matches)
    mq.addEventListener('change', cambio)
    return () => mq.removeEventListener('change', cambio)
  }, [])
  return es
}

/**
 * Ventana para formularios (nueva cita, día libre).
 *  - Móvil: hoja que sube desde abajo, como en las apps, con el botón de
 *    guardar siempre a la vista (pie fijo).
 *  - Tablet y escritorio: ventana centrada.
 * Se cierra con la X, tocando fuera o con Esc. Quien la usa la envuelve en
 * <AnimatePresence> para que también se anime al cerrarse.
 *
 * Va en un portal (directa en el <body>): cada pantalla del panel entra con
 * una animación, y eso encerraba la ventana en su capa, por DEBAJO de la
 * barra de navegación del móvil.
 *
 * Props: titulo, subtitulo, onCerrar, pie (botones de abajo), children.
 */
export default function Hoja({ titulo, subtitulo, onCerrar, pie, children }) {
  const escritorio = useEsEscritorio()

  useEffect(() => {
    const tecla = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', tecla)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', tecla)
      document.body.style.overflow = ''
    }
  }, [onCerrar])

  const panel = escritorio
    ? { initial: { opacity: 0, scale: 0.95, y: 16 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.97, y: 8 } }
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <m.div
        className="absolute inset-0 bg-tinta-900/60 backdrop-blur-sm"
        onClick={onCerrar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      <m.div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-3xl bg-hueso text-tinta shadow-2xl sm:max-h-[88vh] sm:max-w-lg sm:rounded-3xl"
        {...panel}
        transition={{ duration: 0.45, ease: EASE_SUAVE }}
      >
        {/* Asa (móvil) */}
        <span className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-tinta/15 sm:hidden" />

        <div className="flex shrink-0 items-start justify-between gap-4 px-6 pb-4 pt-4 sm:pt-6">
          <div>
            <h2 className="font-display text-2xl font-bold">{titulo}</h2>
            {subtitulo && <p className="mt-1 text-sm text-tinta/55">{subtitulo}</p>}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-tinta/50 transition-colors hover:bg-tinta/5 hover:text-tinta"
          >
            <X size={22} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6">{children}</div>

        {pie && (
          <div className="shrink-0 border-t border-hueso-200 bg-white/70 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
            {pie}
          </div>
        )}
      </m.div>
    </div>,
    document.body
  )
}
