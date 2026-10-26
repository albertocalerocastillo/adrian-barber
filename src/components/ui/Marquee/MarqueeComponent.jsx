import { useRef } from 'react'
import {
  m,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'motion/react'

const COPIAS = 4
const MUELLE_VELOCIDAD = { damping: 50, stiffness: 400 }
const INCLINACION_MAX = 3

/**
 * Cinta de texto que se desliza sin fin y reacciona al scroll: al bajar rápido
 * acelera y se inclina, y al subir cambia de sentido. El contenido va repetido
 * (las copias, ocultas a lectores de pantalla). Fuera de pantalla no calcula
 * nada, y con "reducir movimiento" se queda quieta.
 *
 * Props:
 *  - velocidad: % del ancho de UNA copia que avanza por segundo.
 */
export default function MarqueeComponent({ children, velocidad = 3, className = '' }) {
  const ref = useRef(null)
  const enPantalla = useInView(ref)
  const reducir = useReducedMotion()
  const desplazamiento = useMotionValue(0)
  const sentido = useRef(1)
  const { scrollY } = useScroll()
  const velocidadScroll = useSpring(useVelocity(scrollY), MUELLE_VELOCIDAD)
  const factor = useTransform(velocidadScroll, [0, 1000], [0, 4], { clamp: false })
  const skewX = useTransform(velocidadScroll, [-3000, 3000], [INCLINACION_MAX, -INCLINACION_MAX])
  // Cada copia ocupa 1/COPIAS del ancho: al pasar una entera vuelve al principio sin salto.
  const x = useTransform(desplazamiento, (v) => `${wrap(-100 / COPIAS, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (reducir || !enPantalla) return
    const f = factor.get()
    if (f < 0) sentido.current = -1
    else if (f > 0) sentido.current = 1
    const base = (-velocidad / COPIAS) * sentido.current * (delta / 1000)
    desplazamiento.set(desplazamiento.get() + base + base * Math.abs(f))
  })

  return (
    <div ref={ref} className="overflow-hidden">
      <m.div className={`flex w-max ${className}`} style={{ x, skewX }}>
        {Array.from({ length: COPIAS }, (_, i) => (
          <div key={i} aria-hidden={i > 0} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </m.div>
    </div>
  )
}
