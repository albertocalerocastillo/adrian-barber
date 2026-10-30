// #region Imports
import type { FunctionComponent, PointerEvent } from 'react'
import { m, useMotionValue, useSpring } from 'motion/react'
import { SPRING_SMOOTH } from '../../../theme/animation'
import type { IMagneticProps } from './IMagneticProps'
// #endregion

// #region Constantes
// El movimiento vertical es más corto que el horizontal.
const FACTOR_VERTICAL = 0.6
// #endregion

/** Deja un valor entre -1 y 1. */
const limitar = (v: number): number => Math.max(-1, Math.min(1, v))

/**
 * Efecto "magnético": el contenido se acerca un poco al ratón cuando pasa por
 * encima y vuelve con un muelle al salir. Solo con ratón (con el dedo no tiene
 * sentido).
 *
 * El desplazamiento va en píxeles fijos (`maxOffset`), no en proporción al
 * tamaño: antes era proporcional y un botón ancho llegaba a moverse 36 px,
 * que parecía que se escapaba. Unos pocos píxeles se notan sin molestar.
 */
const MagneticComponent: FunctionComponent<IMagneticProps> = ({ children, maxOffset = 6, className = '' }) => {
  // #region Declaraciones, variables y hooks
  const x = useSpring(useMotionValue(0), SPRING_SMOOTH)
  const y = useSpring(useMotionValue(0), SPRING_SMOOTH)

  const mover = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    x.set(limitar((e.clientX - r.left - r.width / 2) / (r.width / 2)) * maxOffset)
    y.set(limitar((e.clientY - r.top - r.height / 2) / (r.height / 2)) * maxOffset * FACTOR_VERTICAL)
  }

  const soltar = () => {
    x.set(0)
    y.set(0)
  }
  // #endregion

  // #region Renderizado
  return (
    <m.div
      className={`inline-block ${className}`}
      style={{ x, y }}
      onPointerMove={mover}
      onPointerLeave={soltar}
    >
      {children}
    </m.div>
  )
  // #endregion
}

export default MagneticComponent
