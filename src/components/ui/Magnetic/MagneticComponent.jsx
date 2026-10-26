import { m, useMotionValue, useSpring } from 'motion/react'
import { MUELLE_SUAVE } from '../../../theme/animacion'

/**
 * Efecto "magnético": el contenido se acerca un poco al ratón cuando pasa por
 * encima y vuelve con un muelle al salir. Solo con ratón (con el dedo no tiene
 * sentido).
 */
export default function MagneticComponent({ children, fuerza = 0.25, className = '' }) {
  const x = useSpring(useMotionValue(0), MUELLE_SUAVE)
  const y = useSpring(useMotionValue(0), MUELLE_SUAVE)

  const mover = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * fuerza)
    y.set((e.clientY - r.top - r.height / 2) * fuerza)
  }

  const soltar = () => {
    x.set(0)
    y.set(0)
  }

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
}
