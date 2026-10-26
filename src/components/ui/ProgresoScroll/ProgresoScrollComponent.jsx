import { m, useScroll, useSpring } from 'motion/react'
import { MUELLE_SUAVE } from '../../../theme/animacion'

/**
 * Hilo dorado arriba del todo que se llena según se baja por la página.
 */
export default function ProgresoScrollComponent() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, MUELLE_SUAVE)

  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-acento-oscuro via-acento to-acento-claro"
      style={{ scaleX }}
    />
  )
}
