// #region Imports
import { m, useScroll, useSpring } from 'motion/react'
import { SPRING_SMOOTH } from '../../../theme/animation'
// #endregion

/**
 * Hilo dorado arriba del todo que se llena según se baja por la página.
 */
const ScrollProgressComponent = () => {
  // #region Declaraciones, variables y hooks
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, SPRING_SMOOTH)
  // #endregion

  // #region Renderizado
  return (
    <m.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-acento-oscuro via-acento to-acento-claro"
      style={{ scaleX }}
    />
  )
  // #endregion
}

export default ScrollProgressComponent
