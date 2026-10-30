// #region Imports
import { useEffect, useCallback, useRef } from 'react'
import type { FunctionComponent, MouseEvent, TouchEvent } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ILightboxProps } from './ILightboxProps'
// #endregion

// #region Constantes
// Píxeles que hay que arrastrar para que cuente como deslizar (y no como un
// toque tembloroso).
const MINIMO_DESLIZAR = 50

// Teclas con las que se maneja el visor.
const KEY_CLOSE = 'Escape'
const KEY_PREVIOUS = 'ArrowLeft'
const KEY_NEXT = 'ArrowRight'
// #endregion

/**
 * Visor a pantalla completa para la galería.
 * Se navega con las flechas del teclado, con los botones o DESLIZANDO en el
 * móvil, que es el gesto que todo el mundo intenta. Se cierra con Esc o
 * tocando fuera.
 */
const LightboxComponent: FunctionComponent<ILightboxProps> = ({ photos, index, onClose, onPrevious, onNext }) => {
  // #region Declaraciones, variables y hooks
  const inicioX = useRef<number | null>(null)
  const huboDeslizamiento = useRef<boolean>(false)

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === KEY_CLOSE) onClose()
      if (e.key === KEY_PREVIOUS) onPrevious()
      if (e.key === KEY_NEXT) onNext()
    },
    [onClose, onPrevious, onNext]
  )

  useEffect(() => {
    if (index === null) return
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, onKey])

  if (index === null) return null
  const foto = photos[index]
  // #endregion

  // #region Gestos
  const alEmpezarToque = (e: TouchEvent<HTMLDivElement>) => {
    inicioX.current = e.touches[0].clientX
    huboDeslizamiento.current = false
  }

  const alTerminarToque = (e: TouchEvent<HTMLDivElement>) => {
    if (inicioX.current === null) return
    const recorrido = e.changedTouches[0].clientX - inicioX.current
    if (Math.abs(recorrido) >= MINIMO_DESLIZAR) {
      huboDeslizamiento.current = true
      if (recorrido < 0) onNext()
      else onPrevious()
    }
    inicioX.current = null
  }

  // Tocar el fondo cierra, pero un deslizamiento NO debe cerrar.
  const alTocarFondo = () => {
    if (huboDeslizamiento.current) {
      huboDeslizamiento.current = false
      return
    }
    onClose()
  }

  const alPulsarAnterior = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onPrevious()
  }

  const alPulsarSiguiente = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onNext()
  }
  // #endregion

  // #region Renderizado
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/95 p-4 backdrop-blur-sm"
      onClick={alTocarFondo}
      onTouchStart={alEmpezarToque}
      onTouchEnd={alTerminarToque}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 text-hueso/70 transition-colors hover:text-acento"
      >
        <X size={32} />
      </button>

      <button
        type="button"
        onClick={alPulsarAnterior}
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
        onClick={alPulsarSiguiente}
        aria-label="Siguiente"
        className="absolute right-3 hidden text-hueso/60 transition-colors hover:text-acento sm:block md:right-8"
      >
        <ChevronRight size={40} />
      </button>

      {/* Posición: sin esto no sabes cuántas fotos quedan. */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs uppercase tracking-widest text-hueso/60">
        {index + 1} / {photos.length}
      </p>
    </div>
  )
  // #endregion
}

export default LightboxComponent
