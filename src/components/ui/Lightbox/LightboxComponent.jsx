import { useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Visor a pantalla completa para la galería.
 * Navegable con flechas del teclado y botones; se cierra con Esc o clic fuera.
 *
 * Props:
 *  - fotos: array de { src, alt }.
 *  - indice: índice de la foto mostrada (null = cerrado).
 *  - onCerrar, onAnterior, onSiguiente: callbacks.
 */
export default function LightboxComponent({ fotos, indice, onCerrar, onAnterior, onSiguiente }) {
  const onKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onCerrar()
      if (e.key === 'ArrowLeft') onAnterior()
      if (e.key === 'ArrowRight') onSiguiente()
    },
    [onCerrar, onAnterior, onSiguiente]
  )

  useEffect(() => {
    if (indice === null) return
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [indice, onKey])

  if (indice === null) return null
  const foto = fotos[indice]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/95 p-4 backdrop-blur-sm"
      onClick={onCerrar}
    >
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute right-4 top-4 text-hueso/70 transition-colors hover:text-acento"
      >
        <X size={32} />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onAnterior() }}
        aria-label="Anterior"
        className="absolute left-3 text-hueso/60 transition-colors hover:text-acento md:left-8"
      >
        <ChevronLeft size={40} />
      </button>

      <img
        src={foto.src}
        alt={foto.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
      />

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSiguiente() }}
        aria-label="Siguiente"
        className="absolute right-3 text-hueso/60 transition-colors hover:text-acento md:right-8"
      >
        <ChevronRight size={40} />
      </button>
    </div>
  )
}
