import { useState, useEffect } from 'react'

/**
 * Devuelve true cuando la página se ha desplazado más de `umbral` píxeles.
 * Se usa para condensar/oscurecer la barra de navegación al hacer scroll.
 */
export function useScrolled(umbral = 24) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > umbral)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [umbral])

  return scrolled
}
