import { m, useMotionValue, useSpring } from 'motion/react'
import { MUELLE_SUAVE } from '../../../theme/animacion'

const limitar = (v) => Math.max(-1, Math.min(1, v))

/**
 * Efecto "magnético": el contenido se acerca un poco al ratón cuando pasa por
 * encima y vuelve con un muelle al salir. Solo con ratón (con el dedo no tiene
 * sentido).
 *
 * El desplazamiento va en píxeles fijos (`maximo`), no en proporción al
 * tamaño: antes era proporcional y un botón ancho llegaba a moverse 36 px,
 * que parecía que se escapaba. Unos pocos píxeles se notan sin molestar.
 */
export default function MagneticComponent({ children, maximo = 6, className = '' }) {
  const x = useSpring(useMotionValue(0), MUELLE_SUAVE)
  const y = useSpring(useMotionValue(0), MUELLE_SUAVE)

  const mover = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    x.set(limitar((e.clientX - r.left - r.width / 2) / (r.width / 2)) * maximo)
    y.set(limitar((e.clientY - r.top - r.height / 2) / (r.height / 2)) * maximo * 0.6)
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
