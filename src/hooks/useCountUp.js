import { useEffect, useRef } from 'react'

const DURACION_MS = 1600

// Arranca rápido y frena al final.
const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3)

/**
 * Cuenta de 0 hasta `objetivo` cuando el número entra en pantalla.
 * El HTML ya trae el valor final (bien para Google y sin JavaScript); la
 * animación solo lo repinta, escribiendo directamente en el elemento para no
 * provocar renderizados de React.
 *
 *  - decimales: cifras decimales a mostrar (con coma, como en España).
 */
export const useCountUp = (objetivo, decimales = 0) => {
  const result = useRef(null)

  useEffect(() => {
    const el = result.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const formato = (v) => v.toFixed(decimales).replace('.', ',')
    let frame = 0
    const animar = (inicio) => (ahora) => {
      const p = Math.min((ahora - inicio) / DURACION_MS, 1)
      el.textContent = formato(objetivo * easeOutCubic(p))
      if (p < 1) frame = requestAnimationFrame(animar(inicio))
    }

    const obs = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          obs.disconnect()
          frame = requestAnimationFrame((ahora) => animar(ahora)(ahora))
        }
      },
      { threshold: 0.6 }
    )
    obs.observe(el)

    return () => {
      obs.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [objetivo, decimales])

  return result
}
