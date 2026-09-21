import { useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// Píxeles que hay que arrastrar para que cuente como deslizar (y no como un
// toque tembloroso).
const MINIMO_DESLIZAR = 50

/**
 * Visor a pantalla completa para la galería.
 * Se navega con las flechas del teclado, con los botones o DESLIZANDO en el
 * móvil, que es el gesto que todo el mundo intenta. Se cierra con Esc o
 * tocando fuera.
 *
 * Props:
 *  - fotos: array de { src, alt }.
 *  - indice: índice de la foto mostrada (null = cerrado).
 *  - onCerrar, onAnterior, onSiguiente: callbacks.
 */
export default function LightboxComponent({ fotos, indice, onCerrar, onAnterior, onSiguiente }) {
  const inicioX = useRef(null)
  const huboDeslizamiento = useRef(false)

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

  const alEmpezarToque = (e) => {
    inicioX.current = e.touches[0].clientX
    huboDeslizamiento.current = false
  }

  const alTerminarToque = (e) => {
    if (inicioX.current === null) return
    const recorrido = e.changedTouches[0].clientX - inicioX.current
    if (Math.abs(recorrido) >= MINIMO_DESLIZAR) {
      huboDeslizamiento.current = true
      if (recorrido < 0) onSiguiente()
      else onAnterior()
    }
    inicioX.current = null
  }

  // Tocar el fondo cierra, pero un deslizamiento NO debe cerrar.
  const alTocarFondo = () => {
    if (huboDeslizamiento.current) {
      huboDeslizamiento.current = false
      return
    }
    onCerrar()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/95 p-4 backdrop-blur-sm"
      onClick={alTocarFondo}
      onTouchStart={alEmpezarToque}
      onTouchEnd={alTerminarToque}
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
        className="absolute left-3 hidden text-hueso/60 transition-colors hover:text-acento sm:block md:left-8"
      >
        <ChevronLeft size={40} />
      </button>

      <img
        src={foto.src}
        alt={foto.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-full object-contain shadow-2xl"
      />

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onSiguiente() }}
        aria-label="Siguiente"
        className="absolute right-3 hidden text-hueso/60 transition-colors hover:text-acento sm:block md:right-8"
      >
        <ChevronRight size={40} />
      </button>

      {/* Posición: sin esto no sabes cuántas fotos quedan. */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-hueso/60">
        {indice + 1} / {fotos.length}
      </p>
    </div>
  )
}
