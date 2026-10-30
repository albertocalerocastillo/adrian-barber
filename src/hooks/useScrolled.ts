import { useState, useEffect } from 'react'

// Píxeles de scroll a partir de los que se condensa la barra.
const UMBRAL_POR_DEFECTO = 24

/**
 * Devuelve true cuando la página se ha desplazado más de `umbral` píxeles.
 * Se usa para condensar/oscurecer la barra de navegación al hacer scroll.
 */
export const useScrolled = (umbral: number = UMBRAL_POR_DEFECTO): boolean => {
  const [result, setScrolled] = useState<boolean>(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > umbral)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [umbral])

  return result
}
