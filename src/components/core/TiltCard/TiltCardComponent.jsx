// #region Imports
import { m, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'
import { SPRING_SMOOTH } from '../../../theme/animation'
// #endregion

/**
 * Tarjeta que se inclina en 3D siguiendo al ratón, con un brillo dorado que se
 * mueve con él. Solo con ratón: en pantallas táctiles se queda quieta.
 */
const TiltCardComponent = ({ children, inclinacion = 3, brillo = 0.18, className = '' }) => {
  // #region Declaraciones, variables y hooks
  // Posición del ratón dentro de la tarjeta, de 0 a 1 (0,5 = centro).
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [inclinacion, -inclinacion]), SPRING_SMOOTH)
  const rotateY = useSpring(useTransform(px, [0, 1], [-inclinacion, inclinacion]), SPRING_SMOOTH)
  const gx = useTransform(px, [0, 1], ['0%', '100%'])
  const gy = useTransform(py, [0, 1], ['0%', '100%'])
  const fondo = useMotionTemplate`radial-gradient(24rem circle at ${gx} ${gy}, rgb(220 189 125 / ${brillo}), transparent 60%)`

  const mover = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }

  const soltar = () => {
    px.set(0.5)
    py.set(0.5)
  }
  // #endregion

  // #region Renderizado
  return (
    <div className="group/tilt h-full [perspective:1200px]">
      <m.div
        className={`relative h-full [transform-style:preserve-3d] ${className}`}
        style={{ rotateX, rotateY }}
        onPointerMove={mover}
        onPointerLeave={soltar}
      >
        {children}
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
          style={{ background: fondo }}
        />
      </m.div>
    </div>
  )
  // #endregion
}

export default TiltCardComponent
